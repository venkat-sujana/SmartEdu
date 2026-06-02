import { NextResponse } from 'next/server'

import { connectInvigilationDB } from '@/lib/mongodb-invigilation'

import ExamSchedule from '@/models/ExamSchedule'
import DutyAssignment from '@/models/DutyAssignment'
import User from '@/models/User'

import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin'])

  if (error) return error

  try {
    await connectInvigilationDB()

    const examCount = await ExamSchedule.countDocuments()

    const dutyCount = await DutyAssignment.countDocuments()

    const lecturerCount = await User.countDocuments({
      role: 'lecturer',
    })

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

    const examSummary = Object.values(examSummaryMap)

    return NextResponse.json({
  totalSessions: examCount,

  totalDuties: dutyCount,

  totalLecturers: lecturerCount,

  roomsUsed: roomsUsed.length,

  examSummary,
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