import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";

import Student from "@/models/Student";
import LeaveRequest from "@/models/LeaveRequest";

export async function POST(req) {
  try {
    await connectMongoDB();

    // --------------------------------------------------
    // 1. Login check
    // --------------------------------------------------

    const session = await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      session.user.role !== "student"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only students can apply for leave",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 2. Logged-in student
    // --------------------------------------------------

    const student = await Student.findOne({
      _id: session.user.id,
      collegeId: session.user.collegeId,
      status: "Active",
    })
      .select("_id collegeId group yearOfStudy")
      .lean();

    if (!student) {
      return NextResponse.json(
        {
          status: "error",
          message: "Student record not found",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 3. Request body
    // --------------------------------------------------

    const body = await req.json();

    const {
      leaveDate,
      session: leaveSession,
      reason,
    } = body;

    // --------------------------------------------------
    // 4. Basic validation
    // --------------------------------------------------

    if (!leaveDate) {
      return NextResponse.json(
        {
          status: "error",
          message: "Leave date is required",
        },
        { status: 400 }
      );
    }

    if (
      !["FN", "AN", "Full Day"].includes(
        leaveSession
      )
    ) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Session must be FN, AN, or Full Day",
        },
        { status: 400 }
      );
    }

    if (
      !reason ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Leave reason is required",
        },
        { status: 400 }
      );
    }

    if (reason.trim().length > 500) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Leave reason cannot exceed 500 characters",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Normalize leave date
    // --------------------------------------------------

    const selectedDate = new Date(leaveDate);

    if (Number.isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid leave date",
        },
        { status: 400 }
      );
    }

    selectedDate.setHours(0, 0, 0, 0);

    // --------------------------------------------------
    // 6. Leave must be applied BEFORE the leave date
    //
    // Today and past dates are NOT allowed.
    // --------------------------------------------------

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Leave must be applied at least one day in advance",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Prevent duplicate request
    // --------------------------------------------------

    const existingRequest =
      await LeaveRequest.findOne({
        studentId: student._id,
        leaveDate: selectedDate,
        session: leaveSession,
      }).lean();

    if (existingRequest) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Leave request already exists for this date and session",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 8. Create leave request
    // --------------------------------------------------

    const leaveRequest =
      await LeaveRequest.create({
        studentId: student._id,
        collegeId: student.collegeId,
        group: student.group,
        yearOfStudy: student.yearOfStudy,

        leaveDate: selectedDate,

        session: leaveSession,

        reason: reason.trim(),

        status: "Pending",
      });

    // --------------------------------------------------
    // 9. Response
    // --------------------------------------------------

    return NextResponse.json(
      {
        status: "success",
        message: "Leave request submitted successfully",
        data: {
          id: leaveRequest._id,
          leaveDate: leaveRequest.leaveDate,
          session: leaveRequest.session,
          reason: leaveRequest.reason,
          status: leaveRequest.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Student leave apply API error:",
      error
    );

    // --------------------------------------------------
    // Duplicate index safety
    // --------------------------------------------------

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Leave request already exists for this date and session",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        message: "Server error while applying leave",
      },
      { status: 500 }
    );
  }
}