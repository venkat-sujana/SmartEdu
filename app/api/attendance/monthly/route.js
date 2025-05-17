// app/api/attendance/monthly/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const month = parseInt(searchParams.get("month")); // 0-11
  const year = parseInt(searchParams.get("year"));

  if (!studentId || isNaN(month) || isNaN(year)) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const records = await Attendance.find({
    studentId,
    date: { $gte: start, $lte: end }
  });

  return NextResponse.json({ data: records });
}
