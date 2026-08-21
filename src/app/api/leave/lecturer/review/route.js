import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";

import LeaveRequest from "@/models/LeaveRequest";

import {
  getLecturerGroupFromSubject,
} from "@/lib/lecturerGroupAccess";

export async function PUT(req) {
  try {
    await connectMongoDB();

    // --------------------------------------------------
    // 1. Lecturer authentication
    // --------------------------------------------------

    const session =
      await getServerSession(authOptions);

    if (
      !session?.user?.id ||
      session.user.role !== "lecturer"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Only lecturers can review leave requests",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 2. Required college
    // --------------------------------------------------

    const collegeId = session.user.collegeId;

    if (!collegeId) {
      return NextResponse.json(
        {
          status: "error",
          message: "College ID not found",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Lecturer assigned group
    // --------------------------------------------------

    const lecturerGroup =
      getLecturerGroupFromSubject(
        session.user.subject
      );

    if (!lecturerGroup) {
      return NextResponse.json(
        {
          status: "error",
          message: "Lecturer group not found",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 4. Request body
    // --------------------------------------------------

    const body = await req.json();

    const {
      leaveRequestId,
      action,
      lecturerRemark,
    } = body;

    // --------------------------------------------------
    // 5. Validate request ID
    // --------------------------------------------------

    if (!leaveRequestId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Leave request ID is required",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Validate action
    // --------------------------------------------------

    if (!["Approved", "Rejected"].includes(action)) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Action must be Approved or Rejected",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Validate remark
    // --------------------------------------------------

    const remark =
      typeof lecturerRemark === "string"
        ? lecturerRemark.trim()
        : "";

    if (remark.length > 500) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Lecturer remark cannot exceed 500 characters",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 8. Find request ONLY inside lecturer's group
    // --------------------------------------------------

    const leaveRequest =
      await LeaveRequest.findOne({
        _id: leaveRequestId,
        collegeId,
        group: lecturerGroup,
      });

    if (!leaveRequest) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Leave request not found or access denied",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // 9. Prevent reviewing already reviewed request
    // --------------------------------------------------

    if (leaveRequest.status !== "Pending") {
      return NextResponse.json(
        {
          status: "error",
          message:
            `Leave request is already ${leaveRequest.status}`,
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 10. Update request
    // --------------------------------------------------

    leaveRequest.status = action;

    leaveRequest.reviewedBy =
      session.user.id;

    leaveRequest.reviewedAt = new Date();

    leaveRequest.lecturerRemark = remark;

    await leaveRequest.save();

    // --------------------------------------------------
    // 11. Response
    // --------------------------------------------------

    return NextResponse.json({
      status: "success",
      message:
        action === "Approved"
          ? "Leave request approved successfully"
          : "Leave request rejected successfully",

      data: {
        id: leaveRequest._id,
        status: leaveRequest.status,
        lecturerRemark:
          leaveRequest.lecturerRemark,
        reviewedAt:
          leaveRequest.reviewedAt,
      },
    });
    } catch (error) {
    console.error("Lecturer leave review API error:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Server error",
        errorName: error?.name || "UnknownError",
      },
      { status: 500 }
    );
  }
}