import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";

import LeaveRequest from "@/models/LeaveRequest";

import {
  getLecturerGroupFromSubject,
} from "@/lib/lecturerGroupAccess";

export async function GET() {
  try {
    await connectMongoDB();

    // --------------------------------------------------
    // 1. Login check
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
          message: "Only lecturers can access leave requests",
        },
        { status: 403 }
      );
    }

    // --------------------------------------------------
    // 2. College check
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
    // 3. Get lecturer assigned group
    // --------------------------------------------------

    const lecturerGroup =
      getLecturerGroupFromSubject(
        session.user.subject
      );

    if (!lecturerGroup) {
      return NextResponse.json({
        status: "success",
        data: [],
        group: null,
      });
    }

    // --------------------------------------------------
    // 4. Fetch ONLY assigned group's leave requests
    // --------------------------------------------------

    const requests =
      await LeaveRequest.find({
        collegeId,
        group: lecturerGroup,
      })
        .populate(
          "studentId",
          "name admissionNo group yearOfStudy"
        )
        .sort({
          status: 1,
          leaveDate: 1,
          createdAt: -1,
        })
        .lean();

    // --------------------------------------------------
    // 5. Response
    // --------------------------------------------------

    return NextResponse.json({
      status: "success",
      group: lecturerGroup,
      data: requests,
    });
  } catch (error) {
    console.error(
      "Lecturer leave requests API error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          "Failed to load lecturer leave requests",
      },
      { status: 500 }
    );
  }
}