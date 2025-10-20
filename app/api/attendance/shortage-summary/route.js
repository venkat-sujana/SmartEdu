import "@/models/College";
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

/** 🔧 Normalize year text (e.g., "2nd YEAR", "Second year" → "second year") */
function normalizeYear(y) {
  if (!y) return "";
  const val = y.toLowerCase().trim();
  if (val.includes("1")) return "first year";
  if (val.includes("2")) return "second year";
  if (val.includes("3")) return "third year";
  return val.replace(/\s+/g, " ");
}

/** 🔧 Normalize date to YYYY-MM-DD */
function normalizeDate(date) {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

export async function GET(req) {
  try {
    await connectMongoDB();
    console.log("✅ /api/attendance/shortage-summary called");

    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const yearOfStudyRaw = searchParams.get("yearOfStudy");
    const yearOfStudy = yearOfStudyRaw ? normalizeYear(yearOfStudyRaw) : null;
    const collegeId = searchParams.get("collegeId");

    if (!collegeId)
      return NextResponse.json(
        { error: "collegeId required" },
        { status: 400 }
      );

    /** 🎓 Build Student Query */
    const studentQuery = {};
    if (ObjectId.isValid(collegeId))
      studentQuery.collegeId = new ObjectId(collegeId);
    else studentQuery.collegeId = collegeId;

    if (group) studentQuery.group = group;
    if (yearOfStudy)
      studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");

    const students = await Student.find(studentQuery);
    console.log(
      "👨‍🎓 Students fetched:",
      students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        year: s.yearOfStudy,
        group: s.group,
      }))
    );

    /** 🗓️ Build Attendance Query */
    const attendanceQuery = {};
    if (ObjectId.isValid(collegeId))
      attendanceQuery.collegeId = new ObjectId(collegeId);
    else attendanceQuery.collegeId = collegeId;
    if (group) attendanceQuery.group = group;

    const attendanceRecords = await Attendance.find(attendanceQuery);
    console.log("📅 Attendance records:", attendanceRecords.length);

    /** 🧮 Compute shortage summary */
    const summary = students.map((student) => {
      let totalPresent = 0;
      let totalWorking = 0;

      const sId = student._id.toString();
      const sYear = normalizeYear(student.yearOfStudy);
      const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;

      attendanceRecords.forEach((record) => {
        const rId = record.studentId?.toString();
        const rYear = normalizeYear(record.yearOfStudy);

        if (!rId || !rYear) return;

        // 🧩 Match by studentId and year
        if (rId === sId && rYear === sYear) {
          const recordDate = new Date(record.date);

          // Exclude attendance before joining date
          if (doj && recordDate < doj) return;

          totalWorking++;
          if (record.status?.toLowerCase() === "present") totalPresent++;
        }
      });

      const percentage =
        totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

      // Debug log for verification
      console.log(
        `📊 ${student.name} (${sYear}) → ${totalPresent}/${totalWorking} = ${percentage.toFixed(
          2
        )}%`
      );

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        group: student.group,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    /** 🚫 Filter students below 75% */
    const filtered = summary.filter((s) => s.percentage < 75);

    return NextResponse.json(filtered, { status: 200 });
  } catch (err) {
    console.error("❌ Error in shortage-summary API:", err);
    return NextResponse.json(
      { error: "Failed to generate shortage summary" },
      { status: 500 }
    );
  }
}
