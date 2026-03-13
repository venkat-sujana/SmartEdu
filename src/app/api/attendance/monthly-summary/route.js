import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

const MONTHS = [
  { label: "JUN", year: "2025" },
  { label: "JUL", year: "2025" },
  { label: "AUG", year: "2025" },
  { label: "SEP", year: "2025" },
  { label: "OCT", year: "2025" },
  { label: "NOV", year: "2025" },
  { label: "DEC", year: "2025" },
  { label: "JAN", year: "2026" },
  { label: "FEB", year: "2026" },
  { label: "MAR", year: "2026" },
];

const publicHolidays = [
  { month: 0, day: 26 },
  { month: 5, day: 7 },
  { month: 7, day: 8 },
  { month: 7, day: 15 },
];

function isHoliday(dateObj) {
  return publicHolidays.some(
    holiday =>
      holiday.month === dateObj.getMonth() && holiday.day === dateObj.getDate()
  );
}

function normalizeYear(value) {
  if (!value) return "";

  const normalized = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.includes("1")) return "first year";
  if (normalized.includes("2")) return "second year";

  return normalized;
}

function buildEmptyMonthMap() {
  return MONTHS.reduce((acc, { label, year }) => {
    const key = `${label}-${year}`;
    acc[key] = 0;
    return acc;
  }, {});
}

function buildStudentSummary(student) {
  return {
    _id: student._id,
    name: student.name,
    group: student.group,
    yearOfStudy: student.yearOfStudy,
    workingDays: buildEmptyMonthMap(),
    present: buildEmptyMonthMap(),
    percentage: buildEmptyMonthMap(),
    alerts: buildEmptyMonthMap(),
  };
}

function toMonthKey(dateObj) {
  const label = dateObj
    .toLocaleString("en-US", { month: "short", timeZone: "UTC" })
    .toUpperCase();

  return `${label}-${dateObj.getUTCFullYear()}`;
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);

    const queryCollegeId = searchParams.get("collegeId");
    const group = searchParams.get("group");
    const yearOfStudyRaw = searchParams.get("yearOfStudy");
    const yearOfStudy = normalizeYear(yearOfStudyRaw);

    const effectiveCollegeId = session?.user?.collegeId || queryCollegeId;

    if (!effectiveCollegeId) {
      return NextResponse.json(
        { error: "collegeId required" },
        { status: 400 }
      );
    }

    const collegeObjectId = mongoose.Types.ObjectId.isValid(effectiveCollegeId)
      ? new mongoose.Types.ObjectId(effectiveCollegeId)
      : effectiveCollegeId;

    const studentQuery = {
      collegeId: collegeObjectId,
      status: "Active",
    };

    if (group) studentQuery.group = group;
    if (yearOfStudy) {
      studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");
    }

    const students = await Student.find(studentQuery)
      .select("name group yearOfStudy dateOfJoining")
      .sort({ name: 1 })
      .lean();

    if (students.length === 0) {
      return NextResponse.json({ status: "success", data: [] });
    }

    const studentIds = students.map(student => student._id);
    const attendanceQuery = {
      collegeId: collegeObjectId,
      studentId: { $in: studentIds },
    };

    if (group) attendanceQuery.group = group;
    if (yearOfStudy) {
      attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");
    }

    const attendanceRecords = await Attendance.find(attendanceQuery)
      .select("studentId date status")
      .sort({ date: 1 })
      .lean();

    const summaries = new Map();
    const workingSets = new Map();
    const presentSets = new Map();
    const joiningDates = new Map();

    students.forEach(student => {
      const studentId = student._id.toString();
      summaries.set(studentId, buildStudentSummary(student));
      workingSets.set(studentId, {});
      presentSets.set(studentId, {});
      joiningDates.set(
        studentId,
        student.dateOfJoining ? new Date(student.dateOfJoining) : null
      );
    });

    attendanceRecords.forEach(record => {
      const studentId = record.studentId?.toString();
      if (!studentId || !summaries.has(studentId)) return;

      const recordDate = new Date(record.date);
      if (Number.isNaN(recordDate.getTime()) || recordDate.getUTCDay() === 0) {
        return;
      }

      if (isHoliday(recordDate)) return;

      const joiningDate = joiningDates.get(studentId);
      if (joiningDate && recordDate < joiningDate) return;

      const monthKey = toMonthKey(recordDate);
      const workingByMonth = workingSets.get(studentId);
      const presentByMonth = presentSets.get(studentId);

      if (!(monthKey in summaries.get(studentId).workingDays)) return;

      if (!workingByMonth[monthKey]) workingByMonth[monthKey] = new Set();
      if (!presentByMonth[monthKey]) presentByMonth[monthKey] = new Set();

      const dayKey = recordDate.toDateString();
      workingByMonth[monthKey].add(dayKey);

      if (record.status === "Present") {
        presentByMonth[monthKey].add(dayKey);
      }
    });

    summaries.forEach((summary, studentId) => {
      const workingByMonth = workingSets.get(studentId);
      const presentByMonth = presentSets.get(studentId);

      Object.keys(summary.workingDays).forEach(monthKey => {
        const workingCount = workingByMonth[monthKey]?.size || 0;
        const presentCount = presentByMonth[monthKey]?.size || 0;
        const percent =
          workingCount > 0 ? ((presentCount / workingCount) * 100).toFixed(2) : "0.00";

        summary.workingDays[monthKey] = workingCount;
        summary.present[monthKey] = presentCount;
        summary.percentage[monthKey] = percent;
        summary.alerts[monthKey] =
          workingCount > 0 && Number(percent) < 75 ? "RED ALERT" : "Eligible";
      });
    });

    return NextResponse.json({
      status: "success",
      data: Array.from(summaries.values()),
    });
  } catch (error) {
    console.error("Monthly summary API error:", error);

    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}
