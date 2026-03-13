// src/app/api/attendance/today/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import {
  getTodayAttendanceStats,
  getTodayAttendanceBreakdown,
  getTodayAttendanceList,
  getTodayAbsentees,
} from "@/services/attendanceService";

export async function GET(req) {

  try {

    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const collegeId = session.user.collegeId;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const date = dateParam ? new Date(dateParam) : new Date();
    date.setHours(0,0,0,0);

    const [
      stats,
      breakdown,
      list,
      absentees
    ] = await Promise.all([
      getTodayAttendanceStats(collegeId, date),
      getTodayAttendanceBreakdown(collegeId, date),
      getTodayAttendanceList(collegeId, date),
      getTodayAbsentees(collegeId, date),
    ]);

    return NextResponse.json({
      status: "success",
      date,
      stats,
      breakdown,
      list,
      absentees
    });

  } catch (error) {

    console.error("Unified today attendance API error:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }

}