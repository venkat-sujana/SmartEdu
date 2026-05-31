// src/app/api/invigilation/duties/auto-assign/route.js
import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import DutyAssignment from '@/models/DutyAssignment'
import ExamSchedule from '@/models/ExamSchedule'
import User from '@/models/User'
import LecturerAvailability from '@/models/LecturerAvailability'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

function toDateKey(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function hasDateClash(existingSlots, exam, sameDayNoRepeat) {
  const examDateKey = toDateKey(exam.date)
  const examSlotKey = `${examDateKey}|${exam.session}`
  if (sameDayNoRepeat) return existingSlots?.has(examDateKey)
  return existingSlots?.has(examSlotKey)
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin'])
  if (error) return error

  try {
    await connectInvigilationDB()

    const body = await req.json().catch(() => ({}))

    const date                 = body?.date || ''
    const fromDate             = body?.fromDate || ''
    const toDate               = body?.toDate || ''
    const session              = body?.session || ''
    const examType             = body?.examType || ''
    const maxDutiesPerLecturer = Number(body?.maxDutiesPerLecturer || 0)
    const sameDayNoRepeat      = body?.sameDayNoRepeat !== false

    // ── Exam filter ────────────────────────────────────────────────────────────
    const examFilter = {}
    if (user.collegeId) examFilter.collegeId = user.collegeId

    if (date) {
      const start = new Date(date)
      const end   = new Date(date)
      end.setDate(end.getDate() + 1)
      examFilter.date = { $gte: start, $lt: end }
    }

    if (!date && fromDate && toDate) {
      const start = new Date(fromDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(toDate)
      end.setHours(23, 59, 59, 999)
      examFilter.date = { $gte: start, $lte: end }
    }

    if (session)  examFilter.session  = session
    if (examType) examFilter.examType = examType




    // ── Parallel fetch ─────────────────────────────────────────────────────────
    // ✅ ఇలా మార్చండి
const [allExams, lecturers, existingDuties, availabilityList, historicalAssignments] = await Promise.all([
  
  ExamSchedule.find(examFilter).sort({ date: 1, session: 1 }).lean(),

  User.find({
    role: 'lecturer',
    ...(user.collegeId ? { collegeId: user.collegeId } : {}),
  }).select('_id name').lean(),

  DutyAssignment.find({
    ...(user.collegeId ? { collegeId: user.collegeId } : {}),
  }).populate('examScheduleId', 'date session').select('examScheduleId lecturerId').lean(),

  LecturerAvailability.find({
    status: 'available',
    ...(user.collegeId ? { collegeId: user.collegeId } : {}),
  }).select('lecturerId date session status').lean(),

  // ✅ historicalAssignments.find → DutyAssignment.find గా మార్చండి
  DutyAssignment.find({
    ...(user.collegeId ? { collegeId: user.collegeId } : {}),
  }).select('examScheduleId lecturerId').lean(),
])

    if (lecturers.length === 0) {
      return NextResponse.json({ message: 'No lecturers available', assigned: 0, skipped: 0 })
    }




    // ── Already assigned exam IDs ──────────────────────────────────────────────
    const assignedExamIds = new Set(existingDuties.map(d => String(d.examScheduleId?._id)))
    const targetExams     = allExams.filter(exam => !assignedExamIds.has(String(exam._id)))

    if (targetExams.length === 0) {
      return NextResponse.json({ message: 'All exams already assigned', assigned: 0, skipped: 0 })
    }

    // ── Load tracker ───────────────────────────────────────────────────────────
    const loadByLecturer = new Map(lecturers.map(l => [String(l._id), 0]))
    const clashMap       = new Map()

    // ── ✅ Unavailability map: lecturerId → Set of 'dateKey|session' ───────────
    const availMap = new Map()

for (const item of availabilityList) {

  const lid = String(item.lecturerId)

  const dateKey = toDateKey(item.date)

  const slotKey = `${dateKey}|${item.session}`

  if (!availMap.has(lid)) {
    availMap.set(lid, new Set())
  }

  availMap.get(lid).add(slotKey)
}


// ── Historical Load Tracker ─────────────────────────

const historicalLoadMap = new Map()

historicalAssignments.forEach(d => {

  const lid = String(d.lecturerId)

  historicalLoadMap.set(
    lid,
    (historicalLoadMap.get(lid) || 0) + 1
  )
})

    // ── Existing duty load & clash tracking ────────────────────────────────────
    for (const d of existingDuties) {
      const lid  = String(d.lecturerId)
      const exam = d.examScheduleId
      if (!exam?.date || !exam?.session) continue

      loadByLecturer.set(lid, (loadByLecturer.get(lid) || 0) + 1)

      const key = sameDayNoRepeat
        ? toDateKey(exam.date)
        : `${toDateKey(exam.date)}|${exam.session}`

      if (!clashMap.has(lid)) clashMap.set(lid, new Set())
      clashMap.get(lid).add(key)
    }

    // ── Main assignment loop ───────────────────────────────────────────────────
    const createdAssignments = []
    const skippedExams       = []

    for (const exam of targetExams) {
      const examDateKey = toDateKey(exam.date)
      const slotKey     = `${examDateKey}|${exam.session}`

      const candidates = lecturers.filter(l => {
        const lid         = String(l._id)
        const currentLoad = loadByLecturer.get(lid) || 0

        // 1. Max duties limit
        if (maxDutiesPerLecturer > 0 && currentLoad >= maxDutiesPerLecturer) return false

        // 2. ✅ Unavailability check — lecturer ఈ date/session కి unavailable గా mark చేశారా?
        if (!availMap.get(lid)?.has(slotKey)) {return false
}

        // 3. Same-day / same-slot clash check
        if (hasDateClash(clashMap.get(lid), exam, sameDayNoRepeat)) return false

        return true
      })

      if (candidates.length === 0) {
        skippedExams.push({
          examScheduleId: exam._id,
          date:    examDateKey,
          session: exam.session,
          reason: sameDayNoRepeat
            ? 'No free lecturer available for this date'
            : 'No free lecturer for this date/session',
        })
        continue
      }

      console.log(
        candidates.map(c => ({
          name: c.name,
          historical: historicalLoadMap.get(String(c._id)) || 0,
        }))
      )

      // Fair distribution — fewest duties first
      candidates.sort((a, b) => {
        const ha = historicalLoadMap.get(String(a._id)) || 0

        const hb = historicalLoadMap.get(String(b._id)) || 0

        // Historical Load Priority
        if (ha !== hb) {
          return ha - hb
        }

        const la = loadByLecturer.get(String(a._id)) || 0

        const lb = loadByLecturer.get(String(b._id)) || 0

        // Current Load Priority
        if (la !== lb) {
          return la - lb
        }

        return String(a._id).localeCompare(String(b._id))
      })

      const selected   = candidates[0]
      const selectedId = String(selected._id)

      const created = await DutyAssignment.create({
        examScheduleId: exam._id,
        lecturerId:     selected._id,
        assignedBy:     user._id,
        availability:   'Pending',
      })

      createdAssignments.push(created)

      // Update trackers
      loadByLecturer.set(selectedId, (loadByLecturer.get(selectedId) || 0) + 1)

      if (!clashMap.has(selectedId)) clashMap.set(selectedId, new Set())
      clashMap.get(selectedId).add(sameDayNoRepeat ? examDateKey : slotKey)
    }

    return NextResponse.json({
      message:  'Auto allocation completed',
      assigned: createdAssignments.length,
      skipped:  skippedExams.length,
      skippedExams,
      rules: { sameDayNoRepeat, maxDutiesPerLecturer },
    })
  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Auto allocation failed' },
      { status: 500 }
    )
  }
}
