//src/app/api/invigilation/reports/exam-analytics/route.js
import { NextResponse } from 'next/server'
import LecturerAvailability from '@/models/LecturerAvailability'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import ExamSchedule from '@/models/ExamSchedule'
import DutyAssignment from '@/models/DutyAssignment'
import User from '@/models/User'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin', 'principal'])

  if (error) return error

  try {
    await connectInvigilationDB()

    const examCount = await ExamSchedule.countDocuments()

    const dutyCount = await DutyAssignment.countDocuments()

    const lecturerCount = await User.countDocuments({
      role: 'lecturer',
    })

    const availableCount = await LecturerAvailability.countDocuments({
      status: 'available',
    })

    const unavailableCount = await LecturerAvailability.countDocuments({
      status: 'unavailable',
    })

    const availabilityPercent =
      availableCount + unavailableCount > 0
        ? ((availableCount / (availableCount + unavailableCount)) * 100).toFixed(1)
        : 0

    const roomsUsed = await ExamSchedule.distinct('hallNo')

    const examSchedules = await ExamSchedule.find().select('examType').lean()

    const examSummaryMap = {}

    examSchedules.forEach(exam => {
      const type = exam.examType

      if (!examSummaryMap[type]) {
        examSummaryMap[type] = {
          examType: type,
          sessions: 0,
        }
      }

      examSummaryMap[type].sessions += 1
    })

    const dutyLoad = await DutyAssignment.find().populate('lecturerId', 'name').lean()

    const lecturerMap = {}

    dutyLoad.forEach(d => {
      const name = d.lecturerId?.name

      if (!name) return

      if (!lecturerMap[name]) {
        lecturerMap[name] = {
          lecturerName: name,
          duties: 0,
        }
      }

      lecturerMap[name].duties += 1
    })

    const allLecturerLoads = Object.values(lecturerMap)

    const maxDuties =
      allLecturerLoads.length > 0 ? Math.max(...allLecturerLoads.map(l => l.duties)) : 0

    const minDuties =
      allLecturerLoads.length > 0 ? Math.min(...allLecturerLoads.map(l => l.duties)) : 0

    const loadDifference = maxDuties - minDuties

    let loadHealth = 'Balanced'

    if (loadDifference > 10) {
      loadHealth = 'Unbalanced'
    } else if (loadDifference > 5) {
      loadHealth = 'Moderate'
    }

    const topLecturers = Object.values(lecturerMap)
      .sort((a, b) => b.duties - a.duties)
      .slice(0, 5)

    const examSummary = Object.values(examSummaryMap)

    console.log({
      maxDuties,
      minDuties,
      loadDifference,
      loadHealth,
    })

    return NextResponse.json({
      totalSessions: examCount,
      totalDuties: dutyCount,
      totalLecturers: lecturerCount,
      roomsUsed: roomsUsed.length,

      availableCount,
      unavailableCount,
      availabilityPercent,

      maxDuties,
      minDuties,
      loadDifference,
      loadHealth,

      examSummary,
      topLecturers,
    })
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message,
      },
      {
        status: 500,
      }
    )
  }
}
