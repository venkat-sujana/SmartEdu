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

  // ==== Group by group → year → session ====
  const result = {};

  attendanceRecords.forEach((record) => {
    const { group, yearOfStudy, status, lecturerName, session } = record;

    if (!result[group]) result[group] = {};
    if (!result[group][yearOfStudy]) result[group][yearOfStudy] = {};

    // Unique by session
    if (!result[group][yearOfStudy][session]) {
      result[group][yearOfStudy][session] = {
        present: 0,
        absent: 0,
        percent: 0,
        lecturerName: lecturerName || "—",
        session: session || "FN"
      };
    }
    // First non-empty lecturerName assign only
    if (
      !result[group][yearOfStudy][session].lecturerName ||
      result[group][yearOfStudy][session].lecturerName === "—"
    ) {
      if (lecturerName && lecturerName.trim() !== "") {
        result[group][yearOfStudy][session].lecturerName = lecturerName;
      }
    }
    // Present/Absent count
    if (status === "Present") result[group][yearOfStudy][session].present++;
    else result[group][yearOfStudy][session].absent++;
  });

  // Transform yearData to array (sessions-array output for UI)
  for (const group in result) {
    for (const year of Object.keys(result[group])) {
      const yearObj = result[group][year];
      for (const session in yearObj) {
        const stats = yearObj[session];
        const total = stats.present + stats.absent;
        stats.percent = total > 0 ? Math.round((stats.present / total) * 100) : 0;
      }
      // Replace yearObj with sessions array
      result[group][year] = Object.values(yearObj); // Array of session summaries
    }
  }

  return NextResponse.json({ groupWise: result });
}
