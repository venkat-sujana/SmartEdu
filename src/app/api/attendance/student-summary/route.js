//app/api/attendance/student-summary/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";
import { isNonWorkingDay } from "@/lib/attendanceCalendar";

// Month number → name mapping (academic year order)
const MONTH_MAP = {
  6:  "June",
  7:  "July",
  8:  "August",
  9:  "September",
  10: "October",
  11: "November",
  12: "December",
  1:  "January",
  2:  "February",
  3:  "March",
};

// Academic year month order
const MONTH_ORDER = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json(
      { error: "Missing or invalid studentId" },
      { status: 400 }
    );
  }

  try {
    // Fetch all attendance records — month is Number in DB
    const attendance = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .select("date month status session")
      .lean();

    console.log("Total attendance records found:", attendance.length);

    // Aggregate per month number
    const totalSessionsByMonth = {};
    const presentSessionsByMonth = {};

    attendance.forEach((a) => {
      const monthNum = a.month; // Number: 1-12
      const dt = new Date(a.date);

      if (isNonWorkingDay(dt)) return;

      if (!totalSessionsByMonth[monthNum]) totalSessionsByMonth[monthNum] = 0;
      totalSessionsByMonth[monthNum] += 1;

      if (a.status === "Present") {
        if (!presentSessionsByMonth[monthNum]) presentSessionsByMonth[monthNum] = 0;
        presentSessionsByMonth[monthNum] += 1;
      }
    });

    // Build summary in academic year order
    const summary = {};

    MONTH_ORDER.forEach((monthNum) => {
      const monthName = MONTH_MAP[monthNum];
      const workingSessions = totalSessionsByMonth[monthNum] || 0;
      const presentSessions = presentSessionsByMonth[monthNum] || 0;

      // Skip months with no data
      if (workingSessions === 0) return;

      const percent =
        workingSessions > 0
          ? ((presentSessions / workingSessions) * 100).toFixed(2)
          : "0.00";

      const required = Math.ceil(workingSessions * 0.75);
      const shortageSessions =
        required - presentSessions > 0 ? required - presentSessions : 0;

      const status =
        parseFloat(percent) >= 75 ? "Eligible ✅" : "RED ALERT ❌";

      summary[monthName] = {
        presentSessions,
        workingSessions,
        percent,
        shortageSessions,
        status,
      };
    });

    console.log("Summary built:", summary);

    return NextResponse.json({ data: summary, status: "success" });
  } catch (error) {
    console.error("Student attendance summary error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}