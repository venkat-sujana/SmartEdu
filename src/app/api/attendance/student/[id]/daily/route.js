// src/app/api/attendance/student/[id]/daily/route.js

import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { normalizeAttendanceSession } from "@/validations/attendanceValidation";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    // ---------------------------------------------
    // 1. Login check
    // ---------------------------------------------

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ---------------------------------------------
    // 2. Next.js 15/16 params
    // ---------------------------------------------

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid student ID",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------
    // 3. SECURITY
    //
    // Student can request ONLY own attendance.
    // ---------------------------------------------

    if (String(id) !== String(session.user.id)) {
      return NextResponse.json(
        {
          status: "error",
          message: "You can only view your own attendance",
        },
        { status: 403 }
      );
    }

    const studentId =
      new mongoose.Types.ObjectId(id);

    // ---------------------------------------------
    // 4. Verify student + college
    // ---------------------------------------------

    const student = await Student.findOne({
      _id: studentId,
      collegeId: session.user.collegeId,
    })
      .select("_id name collegeId group yearOfStudy")
      .lean();

    if (!student) {
      return NextResponse.json(
        {
          status: "error",
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    // ---------------------------------------------
    // 5. Fetch attendance
    // ---------------------------------------------

    const records = await Attendance.find({
      studentId,
      collegeId: session.user.collegeId,
    })
      .sort({
        date: -1,
        session: 1,
      })
      .lean();

    // ---------------------------------------------
    // 6. Normalize session
    // ---------------------------------------------

    const normalizedRecords = records.map(
      (record) => ({
        ...record,

        session:
          normalizeAttendanceSession(
            record.session
          ),
      })
    );

    // ---------------------------------------------
    // 7. Return
    // ---------------------------------------------

    return NextResponse.json({
      status: "success",

      student: {
        id: student._id,
        name: student.name,
        group: student.group,
        yearOfStudy: student.yearOfStudy,
      },

      data: normalizedRecords,
    });
  } catch (error) {
    console.error(
      "Student daily attendance error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to load attendance history",
      },
      { status: 500 }
    );
  }
}