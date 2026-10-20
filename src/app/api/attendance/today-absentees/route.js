
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import { getTodayAbsentees } from "@/services/attendanceService";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);

    // Authentication is required; never trust a URL collegeId alone.
    if (!session?.user?.id || !session?.user?.role) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = session.user.role;

    // Lecturer data must be restricted to explicitly assigned groups.
    if (role === "lecturer") {
      const access = await getCaretakerLecturerGroupAccess(session);

      if (!access.authorized || !access.groups.length) {
        return NextResponse.json(
          {
            status: "error",
            message: "No authorized group mapping found for this lecturer",
          },
          { status: 403 }
        );
      }

      const data = await getTodayAbsentees(
        access.collegeId,
        access.groups
      );

      return NextResponse.json(data, { status: 200 });
    }

    // Preserve college-wide data for Principal and Office roles.
    if (role === "principal" || role === "office") {
      if (!session.user.collegeId) {
        return NextResponse.json(
          { status: "error", message: "Unauthorized" },
          { status: 401 }
        );
      }

      const data = await getTodayAbsentees(session.user.collegeId);

      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json(
      { status: "error", message: "Forbidden" },
      { status: 403 }
    );
  } catch (error) {
    console.error("Today absentees API error:", error);

    return NextResponse.json(
      { status: "error", message: "Failed to fetch today's absentees" },
      { status: 500 }
    );
  }
}
