import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

// Month array must match usage & DB
const months = [
  "June", "July", "August", "September", "October", "November",
  "December", "January", "February", "March"
];

// Define public holidays if needed
const publicHolidays = [
  { month: 0, day: 26, name: 'Republic Day' },
  { month: 5, day: 7, name: 'Bakrid' },
  // ... (add other holidays)
];

function isHoliday(dateObj) {
  return publicHolidays.some(h => h.month === dateObj.getMonth() && h.day === dateObj.getDate());
}

export async function GET(req) {
  await connectMongoDB();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json({ error: "Missing studentId" });
  }

  try {
    // Fetch all attendance records for the student with session info
    const attendance = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    }).select("date month status session").lean();

    // Initialize aggregates
    const daysByMonth = {};
    const presentSessionsByMonth = {};
    const totalSessionsByMonth = {};

    attendance.forEach(a => {
      const m = a.month;
      const dt = new Date(a.date);
      const dateStr = dt.toDateString();

      // Skip Sundays and holidays
      if (dt.getDay() === 0 || isHoliday(dt)) return;

      if (!daysByMonth[m]) daysByMonth[m] = new Set();
      daysByMonth[m].add(dateStr);

      if (!totalSessionsByMonth[m]) totalSessionsByMonth[m] = 0;
      totalSessionsByMonth[m] += 1; // counting each session as one

      if (a.status === "Present") {
        if (!presentSessionsByMonth[m]) presentSessionsByMonth[m] = 0;
        presentSessionsByMonth[m] += 1;
      }
    });

    // Prepare summary with session-wise attendance
    const summary = {};
    months.forEach(m => {
      const workingSessions = totalSessionsByMonth[m] || 0;
      const presentSessions = presentSessionsByMonth[m] || 0;
      const percent = workingSessions > 0 ? ((presentSessions / workingSessions) * 100).toFixed(2) : "0.00";
      const required = Math.ceil(workingSessions * 0.75);
      const shortageSessions = required - presentSessions > 0 ? required - presentSessions : 0;
      const status = percent >= 75 ? "Eligible ✅" : "RED ALERT❌";

      summary[m] = {
        presentSessions,
        workingSessions,
        percent,
        shortageSessions,
        status,
      };
    });

    return NextResponse.json({ data: summary, status: "success" });
  } catch (error) {
    console.error("Student attendance summary error:", error);
    return NextResponse.json({ error: "Something went wrong" });
  }
}
