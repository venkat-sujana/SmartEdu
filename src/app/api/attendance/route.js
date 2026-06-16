// app/api/attendance/route.js
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Attendance from '@/models/Attendance'
import connectMongoDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import {
  attendanceRecordSchema,
  attendanceSessionParamSchema,
  buildAttendanceSessionReadFilter,
  normalizeAttendanceSession,
} from '@/validations/attendanceValidation'

function normalizeAttendanceDate(value) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function normalizeStartOfDay(value) {
  if (!value) return null
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

// 🔽 POST Attendance
export async function POST(req) {
  await connectMongoDB()

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
    }

    const collegeId = session.user.collegeId
    const lecturerName = session.user.name || 'Unknown Lecturer'
    const lecturerId = session.user.id || session.user._id || null

    const records = await req.json()

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: 'Invalid data', status: 'error' }, { status: 400 })
    }

    const parsedRecords = records.map((record) => attendanceRecordSchema.safeParse(record))
    const invalidRecord = parsedRecords.find((result) => !result.success)

    if (invalidRecord) {
      return NextResponse.json(
        {
          message: invalidRecord.error.issues[0]?.message || 'Invalid attendance record',
          status: 'error',
        },
        { status: 400 }
      )
    }

    const validRecords = parsedRecords.map((result) => result.data)
    const markedRecords = validRecords.filter((record) => record.status)

    const unmarkedCount = validRecords.length - markedRecords.length

    if (markedRecords.length === 0) {
      return NextResponse.json(
        {
          message: 'No attendance status selected. Use Mark All Present, Mark All Absent, or mark students individually. Unselected students remain N/A.',
          status: 'error',
        },
        { status: 400 }
      )
    }

    // ✅ Extract common info
    // 🔥 Step 1: Duplicate check (same date + group + yearOfStudy + collegeId + session)
    const { date, yearOfStudy, group, session: sessionVal } = markedRecords[0]
    const selectedDate = normalizeAttendanceDate(date)
    const selectedGroup = group
    const selectedYearOfStudy = yearOfStudy
    const selectedSession = normalizeAttendanceSession(sessionVal)
    const nextDate = new Date(selectedDate)
    nextDate.setDate(nextDate.getDate() + 1)

    const alreadyMarked = await Attendance.findOne({
      collegeId,
      group: selectedGroup,
      yearOfStudy: selectedYearOfStudy,
      date: { $gte: selectedDate, $lt: nextDate },
      session: selectedSession,
    })

    // 🟢 UPDATED ERROR MESSAGE WITH LECTURER NAME
    if (alreadyMarked) {
      const markedBy = alreadyMarked.lecturerName || 'somebody'
      return NextResponse.json(
        {
          status: 'error',
          message: `Attendance already marked by ${markedBy} (${selectedSession}) for ${selectedGroup}, ${selectedYearOfStudy}, ${selectedDate.toISOString().slice(0, 10)}`,
        },
        { status: 400 }
      )
    }

    // collect all studentIds
const studentIds = markedRecords.map(r => r.studentId)

// fetch students in one query
const students = await mongoose
  .model("Student")
  .find({ _id: { $in: studentIds }, collegeId })
  .select("name dateOfJoining")
  .lean()

const studentMap = new Map(
  students.map(s => [String(s._id), s])
)

let processedRecords = []

for (const record of markedRecords) {

  const student = studentMap.get(String(record.studentId))
  if (!student) continue

  const joinDate = normalizeStartOfDay(student.dateOfJoining)
  const attendanceDate = normalizeAttendanceDate(record.date)

  if (joinDate && attendanceDate < joinDate) continue

  const month = attendanceDate.getMonth() + 1
  const year = attendanceDate.getFullYear()

  processedRecords.push({
    ...record,
    collegeId,
    month,
    year,
    lecturerName,
    lecturerId,
    studentName: student.name,
    studentId: record.studentId,
    status: record.status,
    date: attendanceDate,
    yearOfStudy: record.yearOfStudy,
    group: record.group,
    session: normalizeAttendanceSession(record.session),
    markedAt: new Date()
  })
}

    console.log('SESSION USER:', session.user)

    if (processedRecords.length === 0) {
      return NextResponse.json({ message: 'No valid attendance records to save', status: 'error' })
    }

    // ✅ Step 3: Bulk upsert attendance records
    const bulkOps = processedRecords.map(rec => ({
      updateOne: {
        filter: {
          collegeId: rec.collegeId,
          studentId: rec.studentId,
          date: rec.date,
          session: rec.session || 'FN',
        },
        update: { $set: rec },
        upsert: true,
      },
    }))

    await Attendance.bulkWrite(bulkOps)

    return NextResponse.json({
      message: `Attendance submitted successfully. Marked: ${processedRecords.length}, N/A: ${unmarkedCount}.`,
      status: 'success',
      markedCount: processedRecords.length,
      unmarkedCount,
      skippedCount: markedRecords.length - processedRecords.length,
    })
  } catch (err) {
    console.error('POST Error:', err)
    return NextResponse.json(
      { message: 'Error submitting attendance', status: 'error' },
      { status: 500 }
    )
  }
}





// 🔽 GET Attendance Record + Summary
export async function GET(req) {
  await connectMongoDB()
  console.log('📢 Attendance GET API called')

  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
    }

    const collegeId = session.user.collegeId

    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const filter = { collegeId, ...buildAttendanceSessionReadFilter() }
    if (month) filter.month = month
    if (year) filter.year = Number(year)

    // Add session filter if provided
    const sessionQ = searchParams.get('session')
    if (sessionQ) {
      const parsedSession = attendanceSessionParamSchema.safeParse(sessionQ)

      if (!parsedSession.success) {
        return NextResponse.json(
          { message: parsedSession.error.issues[0]?.message || 'Invalid session', status: 'error' },
          { status: 400 }
        )
      }

      filter.session = parsedSession.data
    }

    const summary = await Attendance.aggregate([
  { $match: filter },

  {
    $group: {
      _id: null,
      totalRecords: { $sum: 1 },
      totalPresents: {
        $sum: {
          $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
        }
      }
    }
  }
])

const total = summary[0]?.totalRecords || 0
const presents = summary[0]?.totalPresents || 0
const percentage = total
  ? ((presents / total) * 100).toFixed(2)
  : 0

// optional: fetch records separately with lean
const records = await Attendance.find(filter)
.populate("studentId", "studentName name")
.select("studentId status date session group yearOfStudy")
.lean()


const normalizedRecords = records.map((record) => ({
  ...record,
  session: normalizeAttendanceSession(record.session),
}))

return NextResponse.json({
  status: "success",
  totalRecords: total,
  totalPresents: presents,
  attendancePercentage: percentage,
  data: normalizedRecords
})
  } catch (err) {
    console.error('💥 GET Error:', err)
    return NextResponse.json(
      { message: 'Error fetching attendance', status: 'error' },
      { status: 500 }
    )
  }
}
