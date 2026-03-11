// /app/api/attendance/today-list/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const date = new Date(searchParams.get("date"));

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceList = await Attendance.find({
      collegeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("studentId", "name yearOfStudy group");

    const grouped = {};

    for (const record of attendanceList) {
      const name = record.studentId?.name || "Unknown";
      const group = record.group || record.studentId?.group || "Unknown";
      const yearOfStudy = record.yearOfStudy || record.studentId?.yearOfStudy;
      const status = record.status;

      if (!grouped[group]) {
        grouped[group] = { Present: [], Absent: [] };
      }

      grouped[group][status].push({
        name,
        year: yearOfStudy,
      });
    }

    return NextResponse.json({ data: grouped });
  } catch (err) {
    console.error("Error in attendance API:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
