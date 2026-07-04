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

    const attendance = await Attendance.findOne({
      collegeId: session.user.collegeId,
      studentId: new mongoose.Types.ObjectId(studentId),
      date: new Date(date),
    });

    return NextResponse.json({
      status: "success",
      reason: attendance?.reason || "",
    });
  } catch (err) {
    console.error(err);

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

    await Attendance.findOneAndUpdate(
      {
        collegeId: session.user.collegeId,
        studentId: new mongoose.Types.ObjectId(studentId),
        date: new Date(date),
      },
      {
        $set: {
          reason,
        },
      }
    );

    return NextResponse.json({
      status: "success",
      message: "Reason Saved Successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { status: "error", message: "Server Error" },
      { status: 500 }
    );
  }
}