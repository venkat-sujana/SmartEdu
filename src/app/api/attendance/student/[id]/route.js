//app/api/attendance/student/[id]/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Example holidays
const publicHolidays = [
  { month: 0, day: 26 },
];

function isHoliday(date) {
  return publicHolidays.some(
    h => h.month === date.getMonth() && h.day === date.getDate()
  );
}

function calculateMonthlySummary(records) {

  const byMonth = {};

  for (const rec of records) {

    const dt = new Date(rec.date);

    const monthKey = `${dt.getFullYear()}-${dt.getMonth()+1}`;

    if (dt.getDay() === 0 || isHoliday(dt)) continue;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = {
        working: new Set(),
        present: new Set()
      };
    }

    const dateStr = dt.toDateString();

    byMonth[monthKey].working.add(dateStr);

    if (rec.status === "Present") {
      byMonth[monthKey].present.add(dateStr);
    }
  }

  const summary = {};

  for (const month in byMonth) {

    const workingDays = byMonth[month].working.size;
    const presentDays = byMonth[month].present.size;

    const percent =
      workingDays > 0
        ? ((presentDays / workingDays) * 100).toFixed(2)
        : "0.00";

    const required = Math.ceil(workingDays * 0.75);
    const shortage = Math.max(0, required - presentDays);

    summary[month] = {
      workingDays,
      presentDays,
      percent,
      shortage,
      status: percent >= 75 ? "Eligible ✅" : "RED ALERT ❌"
    };
  }

  return summary;
}


export async function GET(req, { params }) {

  try {

    await connectMongoDB();

    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentId = params.id;

    const records = await Attendance.find({
  studentId,
  collegeId: session.user.collegeId
})
  .select("date status")
  .sort({ date: 1 })
  .lean();

    const summary = calculateMonthlySummary(records);

    return NextResponse.json({
      status: "success",
      data: summary,
    });

  } catch (err) {

    console.error("Student attendance summary error:", err);

    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}