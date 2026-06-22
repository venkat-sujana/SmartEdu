
//src/app/api/attendance/trend/route.js
import { NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Attendance from '@/models/Attendance'

export async function GET(req) {
  await connectMongoDB()

  try {
    const days = Number(
      new URL(req.url).searchParams.get('days') || 7
    )

    const trend = []

    const today = new Date()

for (let i = days - 1; i >= 0; i--) {
  const currentDate = new Date(today)

  currentDate.setDate(today.getDate() - i)

  const start = new Date(currentDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(currentDate)
  end.setHours(23, 59, 59, 999)

  const records = await Attendance.find({
    date: {
      $gte: start,
      $lte: end,
    },
  }).lean()

  const present = records.filter(
    r => r.status === 'Present'
  ).length

  const absent = records.filter(
    r => r.status === 'Absent'
  ).length

  const total = present + absent

  const percentage =
    total > 0
      ? Math.round((present / total) * 100)
      : 0

 trend.push({
  date: start.toISOString().split('T')[0],

  label: start.toLocaleDateString('en-US', {
    weekday: 'short',
  }),

  percentage,
  present,
  absent,
  total,

  hasData: total > 0,
})
}

    return NextResponse.json(trend)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: 'Failed to fetch attendance trend',
      },
      { status: 500 }
    )
  }
}