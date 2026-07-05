import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");

    if (!studentId || !date) {
      return NextResponse.json({ status: "success", reason: "" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ status: "success", reason: "" });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const attendance = await Attendance.findOne({
      collegeId: session.user.collegeId,
      studentId: new mongoose.Types.ObjectId(studentId),
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    return NextResponse.json({
      status: "success",
      reason: attendance?.reason || "",
    });
  } catch (err) {
    console.error("GET reason error:", err);
    return NextResponse.json(
      { status: "error", message: "Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.collegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { studentId, date, reason } = await req.json();

    if (!studentId || !date) {
      return NextResponse.json(
        { status: "error", message: "Missing fields" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { status: "error", message: "Invalid studentId" },
        { status: 400 }
      );
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const result = await Attendance.findOneAndUpdate(
      {
        collegeId: session.user.collegeId,
        studentId: new mongoose.Types.ObjectId(studentId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { $set: { reason } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { status: "error", message: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Reason Saved Successfully",
    });
  } catch (err) {
    console.error("POST reason error:", err);
    return NextResponse.json(
      { status: "error", message: "Server Error" },
      { status: 500 }
    );
  }
}