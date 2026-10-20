import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import { getTodayAbsentees } from "@/services/attendanceService";

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const queryCollegeId = searchParams.get("collegeId");
    const effectiveCollegeId = session?.user?.collegeId || queryCollegeId;

    if (!effectiveCollegeId) {
      return NextResponse.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await getTodayAbsentees(effectiveCollegeId);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Today absentees API error:", error);

    return NextResponse.json(
      { status: "error", message: "Failed to fetch today's absentees" },
      { status: 500 }
    );
  }
}
