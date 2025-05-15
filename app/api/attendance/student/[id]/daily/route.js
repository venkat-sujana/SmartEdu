// app/api/attendance/student/[id]/daily/route.js
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;

  const records = await Attendance.find({ studentId: id }).sort({ date: -1 });
  return NextResponse.json(records);
}
