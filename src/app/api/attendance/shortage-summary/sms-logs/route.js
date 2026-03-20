import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongoDB from "@/lib/mongodb";
import AttendanceSmsLog from "@/models/AttendanceSmsLog";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function isAllowedRole(role) {
  return role === "principal" || role === "admin" || role === "lecturer";
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || !isAllowedRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId") || session.user.collegeId;
    const group = searchParams.get("group");
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 50);

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId required" }, { status: 400 });
    }

    const query = { collegeId };
    if (group) {
      query.group = group;
    }

    const logs = await AttendanceSmsLog.find(query)
      .populate("studentId", "name admissionNo")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ data: logs });
  } catch (error) {
    console.error("Attendance SMS logs error:", error);
    return NextResponse.json({ error: "Failed to load SMS logs" }, { status: 500 });
  }
}
