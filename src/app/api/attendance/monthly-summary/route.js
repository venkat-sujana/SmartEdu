//src/app/api/attendance/monthly-summary/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { buildAttendanceSessionReadFilter } from "@/validations/attendanceValidation";
import { canLecturerAccessGroup, getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";
import { isNonWorkingDay } from "@/lib/attendanceCalendar";

const MONTHS = [
  { label: "JUN", year: "2026" },
  { label: "JUL", year: "2026" },
  { label: "AUG", year: "2026" },
  { label: "SEP", year: "2026" },
  { label: "OCT", year: "2026" },
  { label: "NOV", year: "2026" },
  { label: "DEC", year: "2026" },
  { label: "JAN", year: "2027" },
  { label: "FEB", year: "2027" },
  { label: "MAR", year: "2027" },
];

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
  const parts = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(dateObj);

  const month = parts.find(p => p.type === "month").value.toUpperCase();
  const year = parts.find(p => p.type === "year").value;

  return `${month}-${year}`;
}



export async function GET(req) {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongoDB();
    console.log("MongoDB connected.");

    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    const { searchParams } = new URL(req.url);
    const queryCollegeId = searchParams.get("collegeId");
    const requestedGroup = searchParams.get("group");
    const yearOfStudyRaw = searchParams.get("yearOfStudy");
    const yearOfStudy = normalizeYear(yearOfStudyRaw);

    console.log("Query Parameters:", {
      collegeId: queryCollegeId,
      group: requestedGroup,
      yearOfStudy: yearOfStudyRaw,
    });

    const effectiveCollegeId = session?.user?.collegeId || queryCollegeId;
    console.log("Effective College ID:", effectiveCollegeId);

    if (!effectiveCollegeId) {
      console.error("Error: collegeId is required.");
      return NextResponse.json(
        { error: "collegeId required" },
        { status: 400 }
      );
    }

    if (session?.user?.role === "lecturer") {
      if (requestedGroup && !canLecturerAccessGroup(session, requestedGroup)) {
        console.error("Error: Lecturer cannot access the requested group.");
        return NextResponse.json(
          { error: "You can only view monthly attendance for your assigned group." },
          { status: 403 }
        );
      }
    }

    const group =
      session?.user?.role === "lecturer"
        ? getLecturerGroupFromSubject(session.user.subject)
        : requestedGroup;

    const collegeObjectId = mongoose.Types.ObjectId.isValid(effectiveCollegeId)
      ? new mongoose.Types.ObjectId(effectiveCollegeId)
      : effectiveCollegeId;

    const studentQuery = {
      collegeId: collegeObjectId,
      status: "Active",
    };

// GET() లోపల, studentQuery తర్వాత add చెయ్యండి (తాత్కాలికంగా)
const allStudents = await Student.find({ collegeId: collegeObjectId })
  .select("name yearOfStudy")
  .lean();
console.log("All Students yearOfStudy values:", allStudents.map(s => s.yearOfStudy));


    if (group) studentQuery.group = group;
    if (yearOfStudy) {
      studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");
    }

    console.log("Student Query:", studentQuery);
    const students = await Student.find(studentQuery)
      .select("name group yearOfStudy dateOfJoining")
      .sort({ name: 1 })
      .lean();

    console.log("Students Found:", students.length);

    if (students.length === 0) {
      console.warn("No students found.");
      return NextResponse.json({ status: "success", data: [] });
    }

    const studentIds = students.map(student => student._id);
    const attendanceQuery = {
      collegeId: collegeObjectId,
      studentId: { $in: studentIds },
      ...buildAttendanceSessionReadFilter(),
    };

    if (group) attendanceQuery.group = group;
    if (yearOfStudy) {
      attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");
    }

    console.log("Attendance Query:", attendanceQuery);
    const attendanceRecords = await Attendance.find(attendanceQuery)
      .select("studentId date status")
      .sort({ date: 1 })
      .lean();

    console.log("Attendance Records Found:", attendanceRecords.length);

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


    console.log("Processing record:", {
    date: record.date,
    parsedDate: recordDate.toDateString(),
    monthKey: toMonthKey(recordDate),
    isNonWorking: isNonWorkingDay(recordDate),
    studentId,
  })  

      if (Number.isNaN(recordDate.getTime()) || isNonWorkingDay(recordDate)) {
        return;
      }

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
    console.error("Monthly summary API error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      { status: "error", message: "Server error", details: error.message },
      { status: 500 }
    );
  }
}


