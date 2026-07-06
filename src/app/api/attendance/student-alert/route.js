import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

const MONTH_MAP = {
  1: "January", 2: "February", 3: "March",
  4: "April",   5: "May",      6: "June",
  7: "July",    8: "August",   9: "September",
  10: "October",11: "November",12: "December",
};

const ACADEMIC_MONTH_ORDER = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return NextResponse.json({ error: "Invalid studentId" }, { status: 400 });
  }

  try {
    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .select("month status")
      .lean();

    // Aggregate per month
    const totalByMonth   = {};
    const presentByMonth = {};

    records.forEach(({ month, status }) => {
      if (!month) return;
      totalByMonth[month]   = (totalByMonth[month]   || 0) + 1;
      if (status === "Present") {
        presentByMonth[month] = (presentByMonth[month] || 0) + 1;
      }
    });

    // Overall totals
    const overallTotal   = records.length;
    const overallPresent = records.filter(r => r.status === "Present").length;
    const overallPercent = overallTotal > 0
      ? ((overallPresent / overallTotal) * 100).toFixed(2)
      : "0.00";

    const overallShortage = (() => {
      const required = Math.ceil(overallTotal * 0.75);
      const diff     = required - overallPresent;
      return diff > 0 ? diff : 0;
    })();

    // Per-month summary (only months with data)
    const monthlyAlerts = ACADEMIC_MONTH_ORDER
      .filter(m => totalByMonth[m] > 0)
      .map(m => {
        const total    = totalByMonth[m]   || 0;
        const present  = presentByMonth[m] || 0;
        const percent  = ((present / total) * 100).toFixed(2);
        const required = Math.ceil(total * 0.75);
        const shortage = required - present > 0 ? required - present : 0;
        return {
          month:    MONTH_MAP[m],
          total,
          present,
          percent,
          shortage,
          isBelowThreshold: parseFloat(percent) < 75,
        };
      });

    return NextResponse.json({
      overall: {
        total:    overallTotal,
        present:  overallPresent,
        percent:  overallPercent,
        shortage: overallShortage,
        isBelowThreshold: parseFloat(overallPercent) < 75,
      },
      monthlyAlerts,
      status: "success",
    });
  } catch (err) {
    console.error("Attendance alert error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}