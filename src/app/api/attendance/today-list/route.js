
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import { getTodayAttendanceList } from "@/services/attendanceService";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";

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

    const role = session.user.role;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const date = dateParam ? new Date(dateParam) : new Date();

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "Invalid date" },
        { status: 400 }
      );
    }

    date.setHours(0, 0, 0, 0);

    let collegeId;
    let allowedGroups = null;

    if (role === "lecturer") {
      const access = await getCaretakerLecturerGroupAccess(session);

      if (!access.authorized || !access.groups?.length) {
        return NextResponse.json(
          { error: "No authorized group mapping found for this lecturer" },
          { status: 403 }
        );
      }

      collegeId = access.collegeId;
      allowedGroups = access.groups;
    } else if (role === "principal" || role === "office") {
      collegeId = session.user.collegeId;
    } else {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    if (!collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await getTodayAttendanceList(collegeId, date);

    const filteredData = allowedGroups
      ? Object.fromEntries(
          Object.entries(data).filter(([group]) =>
            allowedGroups.includes(group)
          )
        )
      : data;

    return NextResponse.json(
      { data: filteredData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Today attendance list API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch today's attendance" },
      { status: 500 }
    );
  }
}
