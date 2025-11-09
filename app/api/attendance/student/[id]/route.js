//app/api/attendance/student/[id]/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

// Sample public holidays, edit as per your calendar
const publicHolidays = [
  { month: 0, day: 26 }, // Jan 26
  // ...etc
];

function isHoliday(dt) {
  return publicHolidays.some(h => h.month === dt.getMonth() && h.day === dt.getDate());
}

function calculateMonthlySummary(records) {
  const byMonth = {};
  for (const a of records) {
    const month = a.month;
    const dt = new Date(a.date);
    const dateStr = dt.toDateString();
    if (dt.getDay() === 0 || isHoliday(dt)) continue;
    if (!byMonth[month]) byMonth[month] = { all: new Set(), present: new Set() };
    byMonth[month].all.add(dateStr);
    if (a.status === "Present") byMonth[month].present.add(dateStr);
  }

  // Prepare clean summary
  const summary = {};
  Object.keys(byMonth).forEach(month => {
    const workingDays = byMonth[month].all.size;
    const presentDays = byMonth[month].present.size;
    const percent = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(2) : "0.00";
    const required = Math.ceil(workingDays * 0.75);
    const shortage = required - presentDays;
    const status = percent >= 75 ? "Eligible ✅" : "RED ALERT❌";
    summary[month] = { workingDays, presentDays, percent, shortage, status };
  });
  return summary;
}

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;
  try {
    // Attendance for one student
    const records = await Attendance.find({ studentId: id })
      .select("date month status")
      .lean();

    const summary = calculateMonthlySummary(records);

    return NextResponse.json({ data: summary, status: "success" });
  } catch (err) {
    console.error("Error fetching student attendance summary:", err);
    return NextResponse.json(
      { message: "Error fetching attendance summary", status: "error" },
      { status: 500 }
    );
  }
}
