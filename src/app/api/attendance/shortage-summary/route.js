import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongoDB from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAttendanceShortageSummary } from "@/lib/attendanceShortage";

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");
    const collegeId = searchParams.get("collegeId") || session?.user?.collegeId;

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId required" }, { status: 400 });
    }

    const data = await getAttendanceShortageSummary({
      collegeId,
      group,
      yearOfStudy,
      threshold: 75,
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error in shortage-summary API:", error);
    return NextResponse.json(
      { error: "Failed to generate shortage summary" },
      { status: 500 }
    );
  }
}
