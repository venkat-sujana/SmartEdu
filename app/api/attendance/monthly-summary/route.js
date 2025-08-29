//app/api/attendance/monthly-summary/route.js


import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import { ObjectId } from "mongodb";

// 🎯 Public Holidays list (calendar లో వాడినట్లే)
const publicHolidays = [
  { month: 0, day: 26, name: "Republic Day" },
  { month: 5, day: 7, name: "Bakrid" },
  { month: 7, day: 15, name: "Independence Day" },
  { month: 7, day: 8, name: "Varalakshmi Vratham" },
  { month: 7, day: 16, name: "Krishna Ashtami" },
  { month: 7, day: 27, name: "Vinayaka Chavithi" },
  { month: 8, day: 28, name: "Dussara Holidays" },
  { month: 8, day: 29, name: "Dussara Holidays" },
  { month: 8, day: 30, name: "Dussara Holidays" },
  { month: 9, day: 1, name: "Dussara Holidays" },
  { month: 9, day: 2, name: "Gandhi Jayanthi" },
  { month: 9, day: 3, name: "Dussara Holidays" },
  { month: 9, day: 4, name: "Dussara Holidays" },
  { month: 9, day: 6, name: "Reopen after Dussara Holidays" },
];

function isHoliday(dateObj) {
  return publicHolidays.some(
    (h) => h.month === dateObj.getMonth() && h.day === dateObj.getDate()
  );
}

export async function GET(req) {
  try {
    console.log("GET /api/attendance/monthly-summary route called!");
    await connectDB();

    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");
    const collegeId = searchParams.get("collegeId");

    console.log("Query params:", { group, yearOfStudy, collegeId });

    // ✅ Students filter
    const studentQuery = {};
    if (group) studentQuery.group = group;
    if (collegeId) studentQuery.collegeId = new ObjectId(collegeId);
    if (yearOfStudy)
      studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");

    const students = await Student.find(studentQuery);
    console.log("Fetched Students:", students.length);

    if (students.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // ✅ Attendance filter
    const attendanceQuery = {};
    if (group) attendanceQuery.group = group;
    if (collegeId) attendanceQuery.collegeId = new ObjectId(collegeId);
    if (yearOfStudy)
      attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, "i");

    const attendance = await Attendance.find(attendanceQuery);
    console.log("Fetched Attendance Records:", attendance.length);

    if (attendance.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // ✅ Month short codes
    const monthMap = {
      January: "JAN",
      February: "FEB",
      March: "MAR",
      April: "APR",
      May: "MAY",
      June: "JUN",
      July: "JUL",
      August: "AUG",
      September: "SEP",
      October: "OCT",
      November: "NOV",
      December: "DEC",
    };

    // ✅ Process each student
    const summary = students.map((student) => {
      const present = {};
      const workingDays = {};
      const percentage = {};
      const alerts = {};




const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;

attendance.forEach((r) => {
  if (r.studentId.toString() === student._id.toString()) {
    const monthKey = `${monthMap[r.month]}-${r.year}`;
    const recordDate = new Date(r.date);

    // 👉 Only First Year Students కు DOJ చెక్ చేయాలి
    if (student.yearOfStudy?.toLowerCase().includes("first") && doj && recordDate < doj) {
      console.log("Skipping record as it's before DOJ (First Year)");
      return;
    }

    // 🚫 Holiday అయితే skip
    if (isHoliday(recordDate)) {
      console.log("Skipping record as it's a holiday");
      return;
    }

    // Working days count
    if (!workingDays[monthKey]) workingDays[monthKey] = 0;
    workingDays[monthKey]++;

    // Present count
    if (r.status === "Present") {
      if (!present[monthKey]) present[monthKey] = 0;
      present[monthKey]++;
    }
  }
});







      // ✅ Calculate percentage + alerts
      Object.keys(workingDays).forEach((monthKey) => {
        const p = present[monthKey] || 0;
        const w = workingDays[monthKey] || 0;
        const perc = w > 0 ? ((p / w) * 100).toFixed(2) + "%" : "0.00%";
        percentage[monthKey] = perc;
        alerts[monthKey] = parseFloat(perc) < 75 ? "RED ALERT" : "OK";
      });

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        doj: student.dateOfJoining,
        present,
        workingDays,
        percentage,
        alerts,
      };
    });

    console.log("Monthly summary generated:", summary.length);

    return NextResponse.json({ data: summary }, { status: 200 });
  } catch (err) {
    console.error("❌ Error generating monthly summary:", err);
    return NextResponse.json(
      { error: "Failed to generate monthly summary" },
      { status: 500 }
    );
  }
}
