// app/api/attendance/monthly-summary/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Student from '@/models/Student'
import Attendance from '@/models/Attendance'
import mongoose from 'mongoose'

// 🎯 Public Holidays list (calendar లో వాడినట్లే)
const publicHolidays = [
  { month: 0, day: 26, name: 'Republic Day' },
  { month: 5, day: 7, name: 'Bakrid' },
  { month: 7, day: 15, name: 'Independence Day' },
  { month: 7, day: 8, name: 'Varalakshmi Vratham' },
  { month: 7, day: 16, name: 'Krishna Ashtami' },
  { month: 7, day: 27, name: 'Vinayaka Chavithi' },
  { month: 8, day: 5, name: 'Miladinabi' },
  { month: 8, day: 28, name: 'Dussara Holidays' },
  { month: 8, day: 29, name: 'Dussara Holidays' },
  { month: 8, day: 30, name: 'Dussara Holidays' },
  { month: 9, day: 1, name: 'Dussara Holidays' },
  { month: 9, day: 2, name: 'Gandhi Jayanthi' },
  { month: 9, day: 3, name: 'Dussara Holidays' },
  { month: 9, day: 4, name: 'Dussara Holidays' },
]

function isHoliday(dateObj) {
  return publicHolidays.some(
    h => h.month === dateObj.getMonth() && h.day === dateObj.getDate()
  )
}

export async function GET(req) {
  try {
    console.log('GET /api/attendance/monthly-summary route called!')
    await connectDB()
    console.log('Connected to database')

    const { searchParams } = new URL(req.url)
    const group = searchParams.get('group')          // e.g. "BiPC"
    const yearOfStudy = searchParams.get('yearOfStudy') // "First Year" / "Second Year"
    const collegeId = searchParams.get('collegeId')

    console.log('Query params:', { group, yearOfStudy, collegeId })

    if (!collegeId) {
      return NextResponse.json(
        { data: [], message: 'collegeId is required' },
        { status: 400 }
      )
    }

    // 🎓 Students filter
    const studentQuery = {
      collegeId: new mongoose.Types.ObjectId(collegeId),
    }

    // group case-insensitive exact
    if (group) {
      studentQuery.group = new RegExp(`^${group}$`, 'i')
    }

    // yearOfStudy: "First Year" / "Second Year" etc.
    if (yearOfStudy) {
      if (yearOfStudy === '1' || /first/i.test(yearOfStudy)) {
        studentQuery.yearOfStudy = /first/i
      } else if (yearOfStudy === '2' || /second/i.test(yearOfStudy)) {
        studentQuery.yearOfStudy = /second/i
      } else {
        studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, 'i')
      }
    }

    console.log('Student filter:', studentQuery)

    const students = await Student.find(studentQuery)
    console.log('Fetched Students:', students.length)

    if (students.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }

    // 📅 Attendance filter – yearOfStudy filter అవసరం లేదు
    const attendanceQuery = {
      collegeId: new mongoose.Types.ObjectId(collegeId),
    }
    if (group) {
      attendanceQuery.group = new RegExp(`^${group}$`, 'i')
    }

    console.log('Attendance filter:', attendanceQuery)

    const attendance = await Attendance.find(attendanceQuery)
    console.log('Fetched Attendance Records:', attendance.length)

    if (attendance.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 })
    }

    const monthMap = {
      January: 'JAN',
      February: 'FEB',
      March: 'MAR',
      April: 'APR',
      May: 'MAY',
      June: 'JUN',
      July: 'JUL',
      August: 'AUG',
      September: 'SEP',
      October: 'OCT',
      November: 'NOV',
      December: 'DEC',
    }

    // Process each student
    const summary = students.map(student => {
      const present = {}
      const workingDays = {}
      const percentage = {}
      const alerts = {}

      const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null

      attendance.forEach(r => {
        if (r.studentId.toString() !== student._id.toString()) return

        const monthKey = `${monthMap[r.month]}-${r.year}`
        const recordDate = new Date(r.date)

        // Only First Year Students DOJ skip
        if (
          student.yearOfStudy?.toLowerCase().includes('first') &&
          doj &&
          recordDate < doj
        ) {
          return
        }

        // Holiday skip
        if (isHoliday(recordDate)) return

        // Working days count (unique dates)
        if (!workingDays[monthKey]) workingDays[monthKey] = new Set()
        workingDays[monthKey].add(recordDate.toDateString())

        // Present days
        if (r.status === 'Present') {
          if (!present[monthKey]) present[monthKey] = new Set()
          present[monthKey].add(recordDate.toDateString())
        }
      })

      // Calculate percentage + alerts
      Object.keys(workingDays).forEach(monthKey => {
        const w = workingDays[monthKey] ? workingDays[monthKey].size : 0
        const pSet = present[monthKey]
        const p = pSet instanceof Set ? pSet.size : 0

        const percNum = w > 0 ? (p / w) * 100 : 0
        const perc = percNum.toFixed(2) + '%'

        workingDays[monthKey] = w
        present[monthKey] = p
        percentage[monthKey] = perc
        alerts[monthKey] = percNum < 75 ? 'RED ALERT' : 'OK'
      })

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        doj: student.dateOfJoining,
        present,
        workingDays,
        percentage,
        alerts,
      }
    })

    console.log('Monthly summary generated:', summary.length)

    return NextResponse.json({ data: summary }, { status: 200 })
  } catch (err) {
    console.error('Error generating monthly summary:', err)
    return NextResponse.json(
      { error: 'Failed to generate monthly summary' },
      { status: 500 }
    )
  }
}
