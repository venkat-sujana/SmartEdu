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

  // ✅ Build query WITHOUT buildAttendanceSessionReadFilter()
  // That helper was silently adding unknown filters — apply it only if you
  // know exactly what it returns. Remove it until verified.
  const query = {
    
    collegeId,
    group,
    yearOfStudy: year,
  }

  if (start && end) {
  query.date = {
    $gte: new Date(`${start}T00:00:00+05:30`),
    $lte: new Date(`${end}T23:59:59+05:30`),
  };
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

  // 🐛 Debug: log the query to confirm it looks right
  console.log('📋 Attendance Query:', JSON.stringify(query, null, 2))

  try {
    // ✅ Step 1: Attendance fetch — populate లేకుండా
    const attendance = await Attendance.find(query)
      .select("status date session group yearOfStudy studentId")
      .lean();

    console.log(`✅ Found ${attendance.length} records`);

    if (attendance.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // ✅ Step 2: Unique studentIds తీసుకోండి
    const studentIds = [
      ...new Set(attendance.map((a) => a.studentId?.toString()).filter(Boolean))
    ];

    // ✅ Step 3: Students separately fetch చేయండి
    const students = await Student.find({ _id: { $in: studentIds } })
      .select("name admissionNo group yearOfStudy")
      .lean();

    console.log(`✅ Found ${students.length} students`);
    console.log("Sample student:", students[0]); // ← name వస్తోందో చూడండి

    // ✅ Step 4: Quick lookup map
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = s;
    });

    // ✅ Step 5: Format
    const formatted = attendance.map((a) => {
      const student = studentMap[a.studentId?.toString()];
      return {
        _id: a._id.toString(),
        student: student?.name || student?.admissionNo || "Unknown",
        studentId: a.studentId,
        present: a.status === "Present" ? 1 : 0,
        absent: a.status === "Absent" ? 1 : 0,
        date: a.date,
        status: a.status,
        session: normalizeAttendanceSession(a.session),
        group: a.group,
        year: a.yearOfStudy,
        yearOfStudy: a.yearOfStudy,
      };
    });

    return NextResponse.json({ data: formatted }, { status: 200 });

  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}