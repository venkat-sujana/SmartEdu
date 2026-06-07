//src/app/api/attendance/consecutive-absentees/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { getConsecutiveAbsentees } from '@/services/attendanceService'
import Attendance from '@/models/Attendance'
import Student from '@/models/Student'

export async function GET(req) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)

    const collegeId = searchParams.get('collegeId')

    const absentees = await getConsecutiveAbsentees(collegeId, 2)

    return NextResponse.json({
      success: true,
      count: absentees.length,
      absentees,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Server Error',
      },
      { status: 500 }
    )
  }
}
