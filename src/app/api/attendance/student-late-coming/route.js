import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  try {
    const lateRecords = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
      lateComer: true,
    })
      .select("date session lateTime month year")
      .sort({ date: -1 })
      .lean();

    const formatted = lateRecords.map(r => ({
      date:     r.date,
      session:  r.session,
      lateTime: r.lateTime || "—",
      month:    r.month,
      year:     r.year,
    }));

    return NextResponse.json({
      data:  formatted,
      total: formatted.length,
      status: "success",
    });
  } catch (err) {
    console.error("Late coming fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}