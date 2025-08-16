//app/api/attendance/student/[id]/monthly/route.js



import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectMongoDB();
  const { id } = params;


  const allRecords = await Attendance.find({ studentId: id });

  const summary = {};

  allRecords.forEach(record => {
    const key = `${record.month}-${record.year}`;
    if (!summary[key]) summary[key] = { present: 0, total: 0, percentage: 0 };

    if (record.status === "Present") summary[key].present += 1;
    summary[key].total += 1;

    // Percentage calculate
    summary[key].percentage =
      summary[key].total > 0
        ? ((summary[key].present / summary[key].total) * 100).toFixed(2)
        : 0;
  });

  return NextResponse.json(summary);
}


