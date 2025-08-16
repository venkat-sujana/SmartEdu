// app/api/attendance/monthly/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  console.log("📌 [Monthly API] Starting request...");

  await connectMongoDB();

  const session = await getServerSession(authOptions);
  console.log("📌 Session:", session);

  if (!session || !session.user?.collegeId) {
    console.log("❌ Unauthorized request");
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const collegeId = session.user.collegeId;
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month = parseInt(searchParams.get("month"));
  const year = parseInt(searchParams.get("year"));

  console.log(`📌 Params: studentId=${studentId}, month=${month}, year=${year}`);

  if (!studentId || isNaN(month) || isNaN(year)) {
    console.log("❌ Missing parameters");
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  try {
    // ✅ Step 1: Verify student belongs to this college
    const student = await Student.findOne({
      _id: new mongoose.Types.ObjectId(studentId),
      collegeId: new mongoose.Types.ObjectId(collegeId),
    });

    if (!student) {
      console.log("❌ Student not found in this college");
      return NextResponse.json({ error: "Student not found in your college" }, { status: 404 });
    }

    console.log(`📌 Student found: ${student.name}, DOJ=${student.dateOfJoining}`);

    // ✅ Step 2: Fetch attendance records
    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      collegeId: new mongoose.Types.ObjectId(collegeId),
      date: { $gte: start, $lte: end },
    });

    console.log(`📌 Attendance records found: ${records.length}`);

    // ✅ Step 3: Generate day-wise status (including '-')
    const daysInMonth = end.getDate();
    const doj = new Date(student.dateOfJoining);
    let result = [];

for (let day = 1; day <= daysInMonth; day++) {
  const currentDate = new Date(year, month, day);

  if (currentDate.getTime() < doj.setHours(0,0,0,0)) {
    result.push({ date: currentDate, status: "🚫" });
    continue;
  }

  const record = records.find(r =>
    new Date(r.date).toDateString() === currentDate.toDateString()
  );

  result.push({
    date: currentDate,
    status: record ? record.status : "N/A"
  });
}


    console.log("📌 Final result prepared:", result);

    return NextResponse.json({ data: result, status: "success" });

  } catch (err) {
    console.error("❌ Monthly API error:", err);
    return NextResponse.json({ message: "Server error", status: "error" }, { status: 500 });
  }
}