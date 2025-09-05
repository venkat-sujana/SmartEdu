//app/api/attendance/today-breakdown/route.js
import { NextResponse } from 'next/server';
import connectMongoDB  from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student'; // 👈 import Student model
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get('collegeId');

  if (!collegeId) {
    return NextResponse.json({ error: 'Missing collegeId' }, { status: 400 });
  }

  try {
    await connectMongoDB();

    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Step 1: Fetch today's present attendance
    const todayPresent = await Attendance.find({
      collegeId,
      status: "Present",
      date: { $gte: todayStart, $lte: todayEnd },
    });

    const firstYear = todayPresent.filter(a => a.yearOfStudy === "First Year").length;
    const secondYear = todayPresent.filter(a => a.yearOfStudy === "Second Year").length;
    const totalPresent = firstYear + secondYear;

    // Step 2: Fetch total students in the college
    const totalStudents = await Student.countDocuments({ collegeId });

    // Step 3: Calculate college-level attendance percent
    const collegePercent = totalStudents > 0
      ? Math.round((totalPresent / totalStudents) * 100)
      : 0;

    return NextResponse.json({
      firstYear,
      secondYear,
      total: totalPresent,
      percent: collegePercent, // 👈 updated here
    });

  } catch (err) {
    console.error("Attendance Breakdown API Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
