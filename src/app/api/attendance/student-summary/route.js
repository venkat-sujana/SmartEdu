// src/app/api/attendance/student-summary/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isNonWorkingDay } from "@/lib/attendanceCalendar";
import { buildAttendanceSessionReadFilter } from "@/validations/attendanceValidation";

// --------------------------------------------------
// Academic Year Months
// Same order used by Lecturer Dashboard
// --------------------------------------------------

const MONTH_MAP = {
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
  1: "January",
  2: "February",
  3: "March",
};

const MONTH_ORDER = [6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

// --------------------------------------------------
// Normalize date to calendar day
// --------------------------------------------------

function normalizeDay(date) {
  const value = new Date(date);

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  );
}

// --------------------------------------------------
// GET Student Attendance Summary
// --------------------------------------------------

export async function GET(req) {
  await connectMongoDB();

  try {
    // ==================================================
    // 1. Verify logged-in user
    // ==================================================

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          status: "error",
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const loggedInStudentId = session.user.id;

    // ==================================================
    // 2. Validate logged-in student's ID
    // ==================================================

    if (!mongoose.Types.ObjectId.isValid(loggedInStudentId)) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid student session",
        },
        { status: 400 }
      );
    }

    const studentObjectId = new mongoose.Types.ObjectId(
      loggedInStudentId
    );

    // ==================================================
    // 3. Get student record
    // ==================================================

    const student = await Student.findOne({
      _id: studentObjectId,
    })
      .select(
        "name collegeId group yearOfStudy dateOfJoining status"
      )
      .lean();

    if (!student) {
      return NextResponse.json(
        {
          status: "error",
          error: "Student record not found",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // 4. College security
    // ==================================================

    const sessionCollegeId = session.user.collegeId;

    if (
      sessionCollegeId &&
      student.collegeId &&
      String(sessionCollegeId) !== String(student.collegeId)
    ) {
      return NextResponse.json(
        {
          status: "error",
          error: "Student college verification failed",
        },
        { status: 403 }
      );
    }

    // ==================================================
    // 5. Build official attendance query
    //
    // IMPORTANT:
    // Student can ONLY see own attendance.
    // Same session-read filter used by Lecturer API.
    // ==================================================

    const attendanceQuery = {
  studentId: studentObjectId,
  collegeId: student.collegeId,
  group: student.group,
  yearOfStudy: student.yearOfStudy,
  ...buildAttendanceSessionReadFilter(),
};

    const attendance = await Attendance.find(attendanceQuery)
      .select("date status session month year group yearOfStudy")
      .sort({ date: 1 })
      .lean();

    console.log(
      "Student attendance records found:",
      attendance.length
    );

    // ==================================================
    // 6. Joining date
    // Same rule as Lecturer Dashboard
    // ==================================================

    const joiningDate = student.dateOfJoining
      ? normalizeDay(student.dateOfJoining)
      : null;

    // ==================================================
    // 7. Store UNIQUE calendar days
    //
    // Working:
    //     One day = one working day
    //
    // Present:
    //     If ANY session on that day is Present,
    //     the whole day becomes Present.
    // ==================================================

    const workingDaysByMonth = {};
    const presentDaysByMonth = {};

    // Temporary day-level status
    //
    // {
    //   "June-2026": {
    //      "15": "Present"
    //   }
    // }
    //
    const dayStatusByMonth = {};

    // ==================================================
    // 8. Process attendance records
    // ==================================================

    attendance.forEach((record) => {
      const recordDate = new Date(record.date);

      if (Number.isNaN(recordDate.getTime())) {
        return;
      }

      // ------------------------------------------------
      // Ignore Sundays / holidays / non-working days
      // Same rule as Lecturer Dashboard
      // ------------------------------------------------

      if (isNonWorkingDay(recordDate)) {
        return;
      }

      // ------------------------------------------------
      // Ignore attendance before date of joining
      // ------------------------------------------------

      const normalizedRecordDate =
        normalizeDay(recordDate);

      if (
        joiningDate &&
        normalizedRecordDate < joiningDate
      ) {
        return;
      }

      // ------------------------------------------------
      // Academic month
      // ------------------------------------------------

      const monthNumber =
        normalizedRecordDate.getMonth() + 1;

      const calendarYear =
        normalizedRecordDate.getFullYear();

      const monthName = MONTH_MAP[monthNumber];

      if (!monthName) {
        return;
      }

      // ------------------------------------------------
      // Same month-year format as academic year
      // ------------------------------------------------

      const monthKey = `${monthName}-${calendarYear}`;

      // ------------------------------------------------
      // Only academic year months
      // ------------------------------------------------

      const academicMonthIndex =
        MONTH_ORDER.indexOf(monthNumber);

      if (academicMonthIndex === -1) {
        return;
      }

      // ------------------------------------------------
      // Ensure month containers
      // ------------------------------------------------

      if (!workingDaysByMonth[monthKey]) {
        workingDaysByMonth[monthKey] = new Set();
      }

      if (!presentDaysByMonth[monthKey]) {
        presentDaysByMonth[monthKey] = new Set();
      }

      if (!dayStatusByMonth[monthKey]) {
        dayStatusByMonth[monthKey] = new Map();
      }

      // ------------------------------------------------
      // UNIQUE calendar day
      //
      // Example:
      //
      // 15-Aug-FN
      // 15-Aug-AN
      //
      // Both become:
      //
      // 15-Aug
      // ------------------------------------------------

      const dayKey = normalizedRecordDate
        .toISOString()
        .slice(0, 10);

      // Every valid attendance record makes
      // that calendar day a WORKING DAY.
      workingDaysByMonth[monthKey].add(dayKey);

      // ------------------------------------------------
      // DAY-LEVEL RULE
      //
      // Present + Present = Present
      // Present + Absent  = Present
      // Absent  + Present = Present
      // Absent  + Absent  = Absent
      //
      // Therefore:
      //
      // ANY Present session => DAY PRESENT
      // ------------------------------------------------

      const existingStatus =
        dayStatusByMonth[monthKey].get(dayKey);

      if (
        record.status === "Present" ||
        existingStatus === "Present"
      ) {
        dayStatusByMonth[monthKey].set(
          dayKey,
          "Present"
        );
      } else {
        dayStatusByMonth[monthKey].set(
          dayKey,
          "Absent"
        );
      }
    });

    // ==================================================
    // 9. Convert day status → monthly summary
    // ==================================================

    const summary = {};

    MONTH_ORDER.forEach((monthNumber) => {
      const monthName = MONTH_MAP[monthNumber];

      // ------------------------------------------------
      // Academic year date mapping
      //
      // June-Dec = 2026
      // Jan-Mar  = 2027
      // ------------------------------------------------

      const calendarYear =
        monthNumber >= 6 ? 2026 : 2027;

      const monthKey =
        `${monthName}-${calendarYear}`;

      const workingSet =
        workingDaysByMonth[monthKey] || new Set();

      const presentSet =
        presentDaysByMonth[monthKey] || new Set();

      const dayStatus =
        dayStatusByMonth[monthKey] || new Map();

      // ------------------------------------------------
      // Build Present Day Set
      // ------------------------------------------------

      dayStatus.forEach((status, dayKey) => {
        if (status === "Present") {
          presentSet.add(dayKey);
        }
      });

      const workingDays = workingSet.size;
      const presentDays = presentSet.size;

      // ------------------------------------------------
      // Skip months with no attendance
      // ------------------------------------------------

      if (workingDays === 0) {
        return;
      }

      // ------------------------------------------------
      // Attendance percentage
      //
      // Present Days / Working Days
      // ------------------------------------------------

      const percent =
        workingDays > 0
          ? ((presentDays / workingDays) * 100).toFixed(2)
          : "0.00";

      // ------------------------------------------------
      // 75% shortage
      // Same calculation used by Lecturer Dashboard
      // ------------------------------------------------

      const requiredDays =
        Math.ceil(workingDays * 0.75);

      const shortageSessions =
        requiredDays - presentDays > 0
          ? requiredDays - presentDays
          : 0;

      const status =
        Number(percent) >= 75
          ? "Eligible ✅"
          : "RED ALERT ❌";

      summary[monthName] = {
        presentSessions: presentDays,
        workingSessions: workingDays,
        percent,
        shortageSessions,
        status,
      };
    });

    // ==================================================
    // 10. Return ONLY logged-in student's summary
    // ==================================================

    console.log(
      "Student day-based attendance summary:",
      {
        studentId: String(studentObjectId),
        studentName: student.name,
        summary,
      }
    );

    return NextResponse.json({
      status: "success",
      student: {
        id: student._id,
        name: student.name,
        group: student.group,
        yearOfStudy: student.yearOfStudy,
      },
      data: summary,
    });
  } catch (error) {
    console.error(
      "Student attendance summary error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}