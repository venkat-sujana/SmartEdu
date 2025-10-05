import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(req) {
  await connectMongoDB();

  const { searchParams } = new URL(req.url);
  const collegeId = searchParams.get("collegeId");
  const dateParam = searchParams.get("date");

  if (!collegeId) {
    return NextResponse.json({ error: "College ID required" }, { status: 400 });
  }

  let startOfDay, endOfDay;

  if (dateParam) {
    const selectedDate = new Date(dateParam);
    startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  }

  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    collegeId,
  }).lean();

  const result = {};

  attendanceRecords.forEach((record) => {
    const { group, yearOfStudy, status, lecturerName } = record;

    if (!result[group]) {
      result[group] = {
        "First Year": { present: 0, absent: 0, percent: 0, lecturerName: lecturerName || "—" },
        "Second Year": { present: 0, absent: 0, percent: 0, lecturerName: lecturerName || "—" },
      };
    }

    // First record లో lecturerName assign చేయడం (duplicate overwrite కాకుండా)
    if (!result[group][yearOfStudy].lecturerName && lecturerName) {
      result[group][yearOfStudy].lecturerName = lecturerName;
    }

    const yearData = result[group][yearOfStudy];
    if (status === "Present") yearData.present++;
    else yearData.absent++;
  });

  for (const group in result) {
    for (const year of ["First Year", "Second Year"]) {
      const { present, absent } = result[group][year];
      const total = present + absent;
      result[group][year].percent =
        total > 0 ? Math.round((present / total) * 100) : 0;
    }
  }

  return NextResponse.json({ groupWise: result });
}
