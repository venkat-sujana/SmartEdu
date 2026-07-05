import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";
import { normalizeAttendanceSession } from "@/validations/attendanceValidation";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await connectMongoDB();

  const { id } = await params; // ← Next.js 15 లో await కావాలి

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json([]);
    }

    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(id),
    })
      .sort({ date: -1, session: 1 })
      .lean();

    return NextResponse.json(
      records.map((record) => ({
        ...record,
        session: normalizeAttendanceSession(record.session),
      }))
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { status: "error", message: "Failed to load attendance history" },
      { status: 500 }
    );
  }
}