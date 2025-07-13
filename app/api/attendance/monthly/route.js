// app/api/attendance/monthly/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function GET(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  console.log("Session:", session);
  if (!session || !session.user?.collegeId) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const collegeId = session.user.collegeId;
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month = parseInt(searchParams.get("month")); // 0 to 11
  const year = parseInt(searchParams.get("year"));

  if (!studentId || isNaN(month) || isNaN(year)) {
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
      return NextResponse.json({ error: "Student not found in your college" }, { status: 404 });
    }

    // ✅ Step 2: Fetch attendance only for allowed student
    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      collegeId: new mongoose.Types.ObjectId(collegeId),
      date: { $gte: start, $lte: end },
    });

    return NextResponse.json({ data: records, status: "success" });
  } catch (err) {
    console.error("❌ Monthly API error:", err);
    return NextResponse.json({ message: "Server error", status: "error" }, { status: 500 });
  }
}