// app/api/attendance/monthly-summary/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

const monthLabels = {
  "01": "JAN",
  "02": "FEB",
  "03": "MAR",
  "04": "APR",
  "05": "MAY",
  "06": "JUN",
  "07": "JUL",
  "08": "AUG",
  "09": "SEP",
  "10": "OCT",
  "11": "NOV",
  "12": "DEC",
};

export async function GET(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const collegeId = session.user.collegeId;
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");
  const yearOfStudy = searchParams.get("yearOfStudy");

  if (!group) {
    return NextResponse.json({ error: "Missing group" }, { status: 400 });
  }

  try {
    // Step 1: Get all students of the group & college
    const studentQuery = { group, collegeId: new mongoose.Types.ObjectId(collegeId) };
    if (yearOfStudy) studentQuery.yearOfStudy = yearOfStudy;

    const students = await Student.find(studentQuery).select("_id name");

    if (!students.length) {
      return NextResponse.json({ data: [] }); // No students found
    }

    const studentIds = students.map((s) => s._id);

    // Step 2: Get attendance records grouped by student/month/year/status
    const attendance = await Attendance.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          collegeId: new mongoose.Types.ObjectId(collegeId),
        },
      },
      {
        $addFields: {
          month: { $dateToString: { format: "%m", date: "$date" } },
          year: { $dateToString: { format: "%Y", date: "$date" } },
        },
      },
      {
        $group: {
          _id: {
            studentId: "$studentId",
            month: "$month",
            year: "$year",
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Step 3: Build formatted response per student
    const summary = students.map((student) => {
      const studentData = {
        name: student.name,
        present: {},
        workingDays: {},
      };

      for (let monthNum in monthLabels) {
        const label = monthLabels[monthNum];
        const yearsToCheck = ["2025", "2026"];

        for (const year of yearsToCheck) {
          const presentCount =
            attendance.find(
              (r) =>
                r._id.studentId.toString() === student._id.toString() &&
                r._id.month === monthNum &&
                r._id.year === year &&
                r._id.status === "Present"
            )?.count || 0;

          const absentCount =
            attendance.find(
              (r) =>
                r._id.studentId.toString() === student._id.toString() &&
                r._id.month === monthNum &&
                r._id.year === year &&
                r._id.status === "Absent"
            )?.count || 0;

          const working = presentCount + absentCount;

          if (working > 0) {
            const key = `${label}-${year}`;
            studentData.present[key] = presentCount;
            studentData.workingDays[key] = working;
          }
        }
      }

      return studentData;
    });

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error("❌ Error generating monthly summary:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
