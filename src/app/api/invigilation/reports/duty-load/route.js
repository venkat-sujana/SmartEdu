import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import DutyAssignment from '@/models/DutyAssignment'
import LecturerAvailability from '@/models/LecturerAvailability'
import User from '@/models/User'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

export async function GET(req) {
  const { user, error } =
    await requireInvigilationAuth(
      req,
      ['admin']
    )

  if (error) return error

  try {
    await connectInvigilationDB()

    const lecturers =
      await User.find({
        role: 'lecturer',
        ...(user.collegeId
          ? { collegeId: user.collegeId }
          : {}),
      })
        .select('_id name')
        .lean()

    const duties =
      await DutyAssignment.find({
        ...(user.collegeId
          ? { collegeId: user.collegeId }
          : {}),
      })
        .populate({
          path: 'examScheduleId',
          select: 'examType',
        })
        .select('lecturerId examScheduleId')
        .lean()

const availabilities = await LecturerAvailability.find().select('lecturerId status').lean()

    // ──────────────────────────────
    // Collect Exam Types
    // ──────────────────────────────

    const examTypeSet = new Set()

    duties.forEach(d => {
      const examType =
        d.examScheduleId?.examType

      if (examType) {
        examTypeSet.add(examType)
      }
    })

    const examTypes =
      Array.from(examTypeSet)

    // ──────────────────────────────
    // Build Lecturer Rows
    // ──────────────────────────────

    const rows = lecturers.map(l => {

const row = {

  lecturerId:
    String(l._id),

  lecturerName:
    l.name,

  totalDuties: 0,

  availableCount: 0,
  unavailableCount: 0,
}


      examTypes.forEach(type => {
        row[type] = 0
      })

      return row
    })

    const rowMap = new Map(
      rows.map(r => [
        r.lecturerId,
        r,
      ])
    )




    // ──────────────────────────────
    // Count Duties
    // ──────────────────────────────

    duties.forEach(d => {

      const lecturerId =
        String(d.lecturerId)

      const examType =
        d.examScheduleId?.examType

      if (
        !examType ||
        !rowMap.has(lecturerId)
      ) {
        return
      }

      const row =
        rowMap.get(
          lecturerId
        )

      row[examType] =
        (row[examType] || 0) + 1

      row.totalDuties += 1
    })
    availabilities.forEach(a => {

  const lecturerId =
    String(a.lecturerId)

  if (
    !rowMap.has(
      lecturerId
    )
  ) {
    return
  }

  const row =
    rowMap.get(
      lecturerId
    )

  if (
    a.status ===
    'available'
  ) {

    row.availableCount += 1

  } else if (
    a.status ===
    'unavailable'
  ) {

    row.unavailableCount += 1

  }

})

    // ──────────────────────────────
    // Sort by Total Duties
    // ──────────────────────────────

    rows.sort(
      (a, b) =>
        b.totalDuties -
        a.totalDuties
    )

    return NextResponse.json({

      examTypes,

      data: rows,
    })

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          'Failed to load duty report',
      },
      {
        status: 500,
      }
    )
  }
}