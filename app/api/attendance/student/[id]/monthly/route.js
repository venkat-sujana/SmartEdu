import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;
  const allRecords = await Attendance.find({ studentId: id });

  const summary = {};
  const daySet = {};         // unique working days per month
  const presentDaySet = {};  // present days per month

  allRecords.forEach(record => {
    console.log(record.date, record.session, record.status);

    const recordDate = new Date(record.date);
    const key = `${record.month}-${record.year}`;
    const dayKey = recordDate.toDateString();

    // Unique working days
    if (!daySet[key]) daySet[key] = new Set();
    daySet[key].add(dayKey);

    // Unique present days
    if (record.status === "Present") {
      if (!presentDaySet[key]) presentDaySet[key] = new Set();
      presentDaySet[key].add(dayKey);
    }
  });

  Object.keys(daySet).forEach(key => {
    if (!summary[key]) summary[key] = {};
    summary[key].totalWorkingDays = daySet[key].size; // per-day count (not per-session)
    summary[key].presentDays = presentDaySet[key]?.size || 0; // per-day present (at least 1 PRESENT session)
    summary[key].percent = summary[key].totalWorkingDays > 0
      ? ((summary[key].presentDays / summary[key].totalWorkingDays) * 100).toFixed(2) + '%'
      : '0.00%';

    // Shortage & status
    summary[key].shortage = Math.max(0, Math.ceil(summary[key].totalWorkingDays * 0.75) - summary[key].presentDays);
    summary[key].status = parseFloat(summary[key].percent) < 75 ? "RED ALERT❌" : "Eligible ✅";
  });

  

  return NextResponse.json(summary);
}
