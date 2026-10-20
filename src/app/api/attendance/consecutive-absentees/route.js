//src/app/api/attendance/consecutive-absentees/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import { getConsecutiveAbsentees } from "@/services/attendanceService";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";

const COLLEGE_WIDE_ROLES = new Set(["principal", "office"]);

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;
    const { searchParams } = new URL(req.url);
    const requestedCollegeId = searchParams.get("collegeId");
    const requestedGroup = searchParams.get("group");

    let collegeId;
    let groups;

    if (role === "lecturer") {
      const access = await getCaretakerLecturerGroupAccess(session);

      if (!access.authorized || !access.groups.length) {
        return NextResponse.json(
          { success: false, message: "No authorized group mapping found" },
          { status: 403 }
        );
      }

      if (
        requestedCollegeId &&
        requestedCollegeId !== access.collegeId
      ) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }

      collegeId = access.collegeId;

      if (requestedGroup) {
        const normalizedRequestedGroup = requestedGroup.trim().toUpperCase();
        groups = access.groups.filter(
          (group) => group.trim().toUpperCase() === normalizedRequestedGroup
        );

        if (!groups.length) {
          return NextResponse.json(
            { success: false, message: "Group access denied" },
            { status: 403 }
          );
        }
      } else {
        groups = access.groups;
      }
    } else if (COLLEGE_WIDE_ROLES.has(role)) {
      if (
        !session.user.collegeId ||
        !mongoose.Types.ObjectId.isValid(session.user.collegeId)
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      collegeId = session.user.collegeId;

      if (
        requestedCollegeId &&
        requestedCollegeId !== String(session.user.collegeId)
      ) {
        return NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        );
      }

      // Group dashboard pages may request a single group.
      if (requestedGroup) {
        groups = [requestedGroup.trim()];
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json(
        { success: false, message: "Invalid college" },
        { status: 400 }
      );
    }

    const absentees = await getConsecutiveAbsentees(
      collegeId,
      2,
      groups
    );

    return NextResponse.json({
      success: true,
      count: absentees.length,
      absentees,
    });
  } catch (error) {
    console.error("Consecutive absentees API error:", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
