import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

// GET — ఒక date కి late comers list
export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");

    if (!date || !group || !yearOfStudy) {
      return NextResponse.json({ status: "error", message: "Missing params" }, { status: 400 });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    const normalizedGroup = normalizeAttendanceGroup(group);

    // ఆ class లో students
    const students = await Student.find({
      collegeId: session.user.collegeId,
      group: normalizedGroup,
      yearOfStudy,
    }).sort({ admissionNo: 1 }).lean();

    // ఆ date లో attendance records
    const records = await Attendance.find({
      collegeId: session.user.collegeId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).lean();

    const data = students.map((student) => {
      const record = records.find(
        (r) => r.studentId?.toString() === student._id?.toString()
      );

      return {
        studentId: student._id,
        name: student.name,
        admissionNo: student.admissionNo || "-",
        photo: student.photo || null,
        status: record?.status || "N/A",
        lateComer: record?.lateComer || false,
        lateTime: record?.lateTime || "",
      };
    });

    return NextResponse.json({ status: "success", data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}

// POST — Late mark చేయి
export async function POST(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { studentId, date, lateTime } = await req.json();

    if (!studentId || !date) {
      return NextResponse.json({ status: "error", message: "Missing fields" }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ status: "error", message: "Invalid studentId" }, { status: 400 });
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
      {
        $set: {
          lateComer: true,
          lateTime: lateTime || "",
        },
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { status: "error", message: "Attendance record not found. ముందు Present mark చేయండి." },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", message: "Late marked successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}

// DELETE — Late unmark చేయి
export async function DELETE(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const { studentId, date } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ status: "error", message: "Invalid studentId" }, { status: 400 });
    }

    const [year, month, day] = date.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

    await Attendance.findOneAndUpdate(
      {
        collegeId: session.user.collegeId,
        studentId: new mongoose.Types.ObjectId(studentId),
        date: { $gte: startOfDay, $lte: endOfDay },
      },
      { $set: { lateComer: false, lateTime: "" } }
    );

    return NextResponse.json({ status: "success", message: "Late removed" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "error", message: "Server Error" }, { status: 500 });
  }
}