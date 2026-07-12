// app/api/attendance/individual/route.js
import { NextResponse } from 'next/server'
import Attendance from '@/models/Attendance'
import Student from '@/models/Student'
import connectMongoDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import mongoose from 'mongoose'
import {
  attendanceSessionParamSchema,
  normalizeAttendanceSession,
} from '@/validations/attendanceValidation'

function getAttendanceRecordPriority(record) {
  if (record?.lateComer) return 3
  if (record?.status === 'Present') return 2
  if (record?.status === 'Absent') return 1
  return 0
}

function getAttendanceRecordKey(record) {
  const studentId = record.studentId?.toString?.()
  const session = normalizeAttendanceSession(record.session)
  const date = new Date(record.date)

  if (!studentId || Number.isNaN(date.getTime())) {
    return null
  }

  const dateKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(date)

  return `${studentId}_${session}_${dateKey}`
}

function dedupeAttendanceRecords(records) {
  const recordMap = new Map()

  for (const record of records) {
    const key = getAttendanceRecordKey(record)
    if (!key) continue

    const existingRecord = recordMap.get(key)

    if (!existingRecord) {
      recordMap.set(key, record)
      continue
    }

    const currentPriority = getAttendanceRecordPriority(record)
    const existingPriority = getAttendanceRecordPriority(existingRecord)

    if (currentPriority > existingPriority) {
      recordMap.set(key, record)
      continue
    }

    if (currentPriority === existingPriority) {
      const currentMarkedAt = new Date(record.markedAt || record.updatedAt || 0).getTime()
      const existingMarkedAt = new Date(
        existingRecord.markedAt || existingRecord.updatedAt || 0
      ).getTime()

      if (currentMarkedAt > existingMarkedAt) {
        recordMap.set(key, record)
      }
    }
  }

  return Array.from(recordMap.values())
}

export async function GET(req) {
  await connectMongoDB()

  const session = await getServerSession(authOptions)

  if (!session || !session.user?.collegeId) {
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 })
  }

  const collegeId = new mongoose.Types.ObjectId(session.user.collegeId)
  const { searchParams } = new URL(req.url)

  const group = searchParams.get('group')
  const year = searchParams.get('year')
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const sessionParam = searchParams.get('session')

  if (!group || !year) {
    return NextResponse.json({ data: [], message: 'Missing group/year' }, { status: 400 })
  }

  const query = {
    collegeId,
    group,
    yearOfStudy: year,
  }

  if (start && end) {
    query.date = {
      $gte: new Date(`${start}T00:00:00+05:30`),
      $lte: new Date(`${end}T23:59:59+05:30`),
    }
  }

  if (sessionParam) {
    const parsedSession = attendanceSessionParamSchema.safeParse(sessionParam)

    if (!parsedSession.success) {
      return NextResponse.json(
        { message: parsedSession.error.issues[0]?.message || 'Invalid session' },
        { status: 400 }
      )
    }

    query.session = parsedSession.data
  }

  try {
    const attendance = await Attendance.find(query)
      .select(
        'status date session group yearOfStudy studentId lateComer lateTime markedAt updatedAt'
      )
      .sort({ markedAt: -1, updatedAt: -1 })
      .lean()

    if (attendance.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }

    const dedupedAttendance = dedupeAttendanceRecords(attendance)

    const studentIds = [
      ...new Set(dedupedAttendance.map(record => record.studentId?.toString()).filter(Boolean)),
    ]

    const students = await Student.find({ _id: { $in: studentIds } })
      .select('name admissionNo group yearOfStudy')
      .lean()

    const studentMap = {}
    students.forEach(student => {
      studentMap[student._id.toString()] = student
    })

    const formatted = dedupedAttendance.map(record => {
      const student = studentMap[record.studentId?.toString()]

      return {
        _id: record._id.toString(),
        student: student?.name || student?.admissionNo || 'Unknown',
        studentId: record.studentId,
        present: record.status === 'Present' ? 1 : 0,
        absent: record.status === 'Absent' ? 1 : 0,
        date: record.date,
        status: record.status,
        session: normalizeAttendanceSession(record.session),
        group: record.group,
        year: record.yearOfStudy,
        yearOfStudy: record.yearOfStudy,
        lateComer: record.lateComer || false,
        lateTime: record.lateTime || '',
      }
    })

    return NextResponse.json({ data: formatted }, { status: 200 })
  } catch (err) {
    console.error('Attendance individual API error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
