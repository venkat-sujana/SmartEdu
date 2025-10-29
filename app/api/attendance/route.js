// app/api/attendance/route.js
import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Attendance from '@/models/Attendance'
import connectMongoDB from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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

    // ✅ Extract common info
    // 🔥 Step 1: Duplicate check (same date + group + yearOfStudy + collegeId + session)
const { date, yearOfStudy, group, session: sessionVal } = records[0];
const selectedDate = new Date(date);
const selectedGroup = group;
const selectedYearOfStudy = yearOfStudy;
const selectedSession = sessionVal || 'FN';

const alreadyMarked = await Attendance.findOne({
  collegeId,
  group: selectedGroup,
  yearOfStudy: selectedYearOfStudy,
  date: selectedDate,
  session: selectedSession,
});

// 🟢 UPDATED ERROR MESSAGE WITH LECTURER NAME
if (alreadyMarked) {
  const markedBy = alreadyMarked.lecturerName || "somebody";
  return NextResponse.json(
    {
      status: "error",
      message: `Attendance already marked by ${markedBy} (${selectedSession}) for ${selectedGroup}, ${selectedYearOfStudy}, ${selectedDate.toISOString().slice(0, 10)}`
    },
    { status: 400 }
  );
}

    let processedRecords = []

 // ✅ Step 2: Process valid student records
    for (let record of records) {
      const student = await mongoose
        .model('Student')
        .findOne({
          _id: record.studentId,
          collegeId,
        })
        .lean()

      if (!student) continue

      const joinDate = student.dateOfJoining ? new Date(student.dateOfJoining) : null
      const attendanceDate = new Date(record.date)

      if (joinDate && attendanceDate < joinDate) continue

      const month = attendanceDate.toLocaleString('default', { month: 'long' })
      const year = attendanceDate.getFullYear()
// Add additional fields to each record
      processedRecords.push({
        ...record,
        collegeId,
        month,
        year,
        lecturerName,
        lecturerId,
        studentName: student.name,
        studentId: record.studentId,
        status: record.status || 'Absent', // Default to 'Absent' if status not provided
        date: new Date(record.date),
        yearOfStudy: record.yearOfStudy,
        group: record.group,
        session: record.session || 'FN', // Default to 'FN' if session not provided
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
          studentId: rec.studentId, 
          date: rec.date,
          session: rec.session || 'FN', // Default to 'FN' if session not provided
   },
        update: { $set: rec },
        upsert: true,
      },
    }))

    await Attendance.bulkWrite(bulkOps)

    return NextResponse.json({ message: 'Attendance submitted successfully', status: 'success' })
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

    const filter = { collegeId }
    if (month) filter.month = month
    if (year) filter.year = Number(year)
      
// Add session filter if provided
      const sessionQ = searchParams.get('session');
    if (sessionQ) filter.session = sessionQ;

    const records = await Attendance.find(filter)

    // ✅ Summary calc
    const total = records.length
    const presents = records.filter(r => r.status === 'Present').length
    const percentage = total > 0 ? ((presents / total) * 100).toFixed(2) : 0

    return NextResponse.json({
      status: 'success',
      totalRecords: total,
      totalPresents: presents,
      attendancePercentage: percentage,
      data: records, // optional: full data కూడా ఇస్తున్నాం
    })
  } catch (err) {
    console.error('💥 GET Error:', err)
    return NextResponse.json(
      { message: 'Error fetching attendance', status: 'error' },
      { status: 500 }
    )
  }
}
