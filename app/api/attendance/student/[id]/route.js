// app/api/attendance/student/[id]/route.js
import { NextResponse } from "next/server";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;

  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter = { studentId: id }; // ✅ add studentId to filter

    if (date) {
      filter.date = new Date(date);
    }

    if (group) {
      filter.group = group;
    }

    if (month) {
      filter.month = month;
    }

    if (year) {
      filter.year = Number(year);
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name group")
      .sort({ date: -1 });

    return NextResponse.json({ data: records, status: "success" });
  } catch (err) {
    console.error("Error fetching student attendance:", err);
    return NextResponse.json(
      { message: "Error fetching attendance", status: "error" },
      { status: 500 }
    );
  }
}