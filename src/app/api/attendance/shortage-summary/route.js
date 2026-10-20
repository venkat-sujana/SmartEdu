
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectMongoDB from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAttendanceShortageSummary } from "@/lib/attendanceShortage";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";

const COLLEGE_WIDE_ROLES = new Set(["principal", "office"]);

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedCollegeId = searchParams.get("collegeId");
    const requestedGroup = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");

    const role = session.user.role;
    let collegeId;
    let groups;

    if (role === "lecturer") {
      const access = await getCaretakerLecturerGroupAccess(session);

      if (!access.authorized || !access.groups.length) {
        return NextResponse.json(
          { error: "No authorized group mapping found" },
          { status: 403 }
        );
      }

      if (
        requestedCollegeId &&
        requestedCollegeId !== access.collegeId
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      collegeId = access.collegeId;

      if (requestedGroup) {
        const requested = requestedGroup.trim().toUpperCase();
        groups = access.groups.filter(
          (group) => group.trim().toUpperCase() === requested
        );

        if (!groups.length) {
          return NextResponse.json(
            { error: "Group access denied" },
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
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      collegeId = session.user.collegeId;

      if (
        requestedCollegeId &&
        requestedCollegeId !== String(session.user.collegeId)
      ) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      if (requestedGroup) {
        groups = [requestedGroup.trim()];
      }
    } else {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(collegeId)) {
      return NextResponse.json(
        { error: "Invalid college" },
        { status: 400 }
      );
    }

    const requestedGroups = groups || [null];

    const summaries = await Promise.all(
      requestedGroups.map((group) =>
        getAttendanceShortageSummary({
          collegeId,
          group,
          yearOfStudy,
          threshold: 75,
        })
      )
    );

    const data = [
      ...new Map(
        summaries
          .flat()
          .map((student) => [student.studentId, student])
      ).values(),
    ];

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error in shortage-summary API:", error);

    return NextResponse.json(
      { error: "Failed to generate shortage summary" },
      { status: 500 }
    );
  }
}
