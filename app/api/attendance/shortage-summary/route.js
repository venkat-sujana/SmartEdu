import "@/models/College";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

// Public holidays, month number-0 based (same as monthly-summary)
const publicHolidays = [
  { month: 0, day: 26 },   // Jan
  { month: 5, day: 7 },    // Jun
  { month: 7, day: 8 },    // Aug
  { month: 7, day: 15 },   // Aug
  // ... add rest ...
];

function isHoliday(dateObj) {
  return publicHolidays.some(h => h.month === dateObj.getMonth() && h.day === dateObj.getDate());
}

function normalizeYear(y) {
  if (!y) return "";
  const val = y.toLowerCase().replace(/\s+/g, " ").trim();
  if (val.includes("1")) return "first year";
  if (val.includes("2")) return "second year";
  if (val.includes("3")) return "third year";
  return val;
}

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const yearOfStudyRaw = searchParams.get("yearOfStudy");
    const collegeId = searchParams.get("collegeId");
    const yearOfStudy = yearOfStudyRaw ? normalizeYear(yearOfStudyRaw) : null;

    if (!collegeId)
      return NextResponse.json({ error: "collegeId required" }, { status: 400 });

    const studentQuery = {};
    studentQuery.collegeId = mongoose.Types.ObjectId.isValid(collegeId)
      ? new mongoose.Types.ObjectId(collegeId)
      : collegeId;
    if (group) studentQuery.group = group;
    if (yearOfStudy)
      studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");

    const students = await Student.find(studentQuery);

    const attendanceQuery = {};
    attendanceQuery.collegeId = mongoose.Types.ObjectId.isValid(collegeId)
      ? new mongoose.Types.ObjectId(collegeId)
      : collegeId;
    if (group) attendanceQuery.group = group;
    if (yearOfStudy)
      attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");

    const attendanceRecords = await Attendance.find(attendanceQuery);

    // Shortage summary calculation
    const summary = students.map(student => {
      const sId = student._id.toString();
      const sYear = normalizeYear(student.yearOfStudy);
      const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;
      let presentDates = new Set();
      let workingDates = new Set();

      attendanceRecords.forEach(record => {
        if (
          record.studentId?.toString() === sId &&
          normalizeYear(record.yearOfStudy) === sYear
        ) {
          const recordDate = new Date(record.date);
          // Skip DOJ, holidays
          if ((doj && recordDate < doj) || isHoliday(recordDate)) return;

          // Unique date for working days (ignore session repeats)
          workingDates.add(recordDate.toDateString());

          // Present attendance only (status may be "Present"/"present")
          if (record.status?.toLowerCase() === "present") {
            presentDates.add(recordDate.toDateString());
          }
        }
      });

      const totalWorking = workingDates.size;
      const totalPresent = presentDates.size;
      const percentage =
        totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        group: student.group,
        percentage: parseFloat(percentage.toFixed(2)),
        totalPresent,
        totalWorking,
      };
    });


    // Only below 75% with valid working days
    const filtered = summary.filter(s => s.totalWorking > 0 && s.percentage < 75);

    return NextResponse.json(filtered, { status: 200 });
  } catch (err) {
    console.error("❌ Error in shortage-summary API:", err);
    return NextResponse.json(
      { error: "Failed to generate shortage summary" },
      { status: 500 }
    );
  }
}
