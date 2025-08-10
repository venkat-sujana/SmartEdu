//app/api/attendance/student/[id]/monthly/route.js
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  console.log("GET /api/attendance/student/[id]/monthly", req, params);
  await connectMongoDB();
  const { id } = params;

  console.log("Fetching records for student ID:", id);

  const allRecords = await Attendance.find({ studentId: id });
  console.log("All Records:", allRecords);

  const summary = {};

  allRecords.forEach(record => {
    console.log("Processing record:", record);
    const key = `${record.month}-${record.year}`;
    console.log("Key:", key);
    if (!summary[key]) summary[key] = { present: 0, total: 0 };
    console.log("Summary before:", summary[key]);
    if (record.status === "Present") summary[key].present += 1;
    summary[key].total += 1;
    console.log("Summary after:", summary[key]);
  });

  console.log("Summary:", summary);

  return NextResponse.json(summary);
}


