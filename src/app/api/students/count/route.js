
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
      groups = access.groups;
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

    const query = {
      collegeId: new mongoose.Types.ObjectId(collegeId),
      status: "Active",
    };

    if (groups) {
      query.group = { $in: groups };
    }

    const count = await Student.countDocuments(query);

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Student count API error:", error);

    return NextResponse.json(
      { error: "Failed to count students" },
      { status: 500 }
    );
  }
}
