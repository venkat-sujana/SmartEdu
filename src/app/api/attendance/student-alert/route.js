// src/app/api/attendance/student-alert/route.js

import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isNonWorkingDay } from "@/lib/attendanceCalendar";
import { buildAttendanceSessionReadFilter } from "@/validations/attendanceValidation";

const MONTH_MAP = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const ACADEMIC_MONTH_ORDER = [
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  1,
  2,
  3,
];

// --------------------------------------------------
// Normalize to calendar day
// --------------------------------------------------

function normalizeDay(value) {
  const date = new Date(value);

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

// --------------------------------------------------
// GET Student Attendance Alert
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
    // 2. Validate logged-in student ID
    // ==================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        loggedInStudentId
      )
    ) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid student session",
        },
        { status: 400 }
      );
    }

    const studentObjectId =
      new mongoose.Types.ObjectId(
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
    // 4. College verification
    // ==================================================

    const sessionCollegeId =
      session.user.collegeId;

    if (
      sessionCollegeId &&
      student.collegeId &&
      String(sessionCollegeId) !==
        String(student.collegeId)
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
    // 5. Attendance query
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

    const records = await Attendance.find(
      attendanceQuery
    )
      .select("date month status session")
      .sort({ date: 1 })
      .lean();

    // ==================================================
    // 6. Date of joining
    // ==================================================

    const joiningDate = student.dateOfJoining
      ? normalizeDay(student.dateOfJoining)
      : null;

    // ==================================================
    // 7. Day-level attendance storage
    //
    // Example:
    //
    // 15-Aug FN → Present
    // 15-Aug AN → Absent
    //
    // Result:
    //
    // 15-Aug → Present
    //
    // ==================================================

    const dayStatusByMonth = {};

    // ==================================================
    // 8. Process attendance records
    // ==================================================

    records.forEach((record) => {
      const recordDate = new Date(record.date);

      if (
        Number.isNaN(recordDate.getTime())
      ) {
        return;
      }

      // Ignore non-working days
      if (isNonWorkingDay(recordDate)) {
        return;
      }

      // Ignore attendance before joining date
      const normalizedDate =
        normalizeDay(recordDate);

      if (
        joiningDate &&
        normalizedDate < joiningDate
      ) {
        return;
      }

      const monthNumber =
        normalizedDate.getMonth() + 1;

      if (
        !ACADEMIC_MONTH_ORDER.includes(
          monthNumber
        )
      ) {
        return;
      }

      const monthName =
        MONTH_MAP[monthNumber];

      if (!dayStatusByMonth[monthNumber]) {
        dayStatusByMonth[monthNumber] = {};
      }

      // ------------------------------------------------
      // Unique calendar day
      // ------------------------------------------------

      const dayKey = normalizedDate
        .toISOString()
        .slice(0, 10);

      // ------------------------------------------------
      // Day-level rule
      //
      // ANY Present session
      //       ↓
      // Day Present
      //
      // Otherwise
      //       ↓
      // Day Absent
      // ------------------------------------------------

      const existingStatus =
        dayStatusByMonth[monthNumber][
          dayKey
        ];

      if (
        record.status === "Present" ||
        existingStatus === "Present"
      ) {
        dayStatusByMonth[monthNumber][
          dayKey
        ] = "Present";
      } else {
        dayStatusByMonth[monthNumber][
          dayKey
        ] = "Absent";
      }
    });

    // ==================================================
    // 9. Build month-wise summary
    // ==================================================

    const monthlyAlerts =
      ACADEMIC_MONTH_ORDER
        .filter(
          (monthNumber) =>
            dayStatusByMonth[monthNumber] &&
            Object.keys(
              dayStatusByMonth[monthNumber]
            ).length > 0
        )
        .map((monthNumber) => {

          const days =
            dayStatusByMonth[monthNumber];

          const dayKeys =
            Object.keys(days);

          // Working days
          const total = dayKeys.length;

          // Present days
          const present = dayKeys.filter(
            (dayKey) =>
              days[dayKey] === "Present"
          ).length;

          const percent =
            total > 0
              ? ((present / total) * 100).toFixed(2)
              : "0.00";

          const required =
            Math.ceil(total * 0.75);

          const shortage =
            required - present > 0
              ? required - present
              : 0;

          return {
            month:
              MONTH_MAP[monthNumber],

            // DAY-BASED values
            total,
            present,

            percent,

            shortage,

            isBelowThreshold:
              parseFloat(percent) < 75,
          };
        });

    // ==================================================
    // 10. Overall day-based attendance
    // ==================================================

    let overallTotal = 0;
    let overallPresent = 0;

    Object.values(
      dayStatusByMonth
    ).forEach((days) => {
      const dayKeys =
        Object.keys(days);

      overallTotal += dayKeys.length;

      overallPresent += dayKeys.filter(
        (dayKey) =>
          days[dayKey] === "Present"
      ).length;
    });

    // ==================================================
    // 11. Overall percentage
    // ==================================================

    const overallPercent =
      overallTotal > 0
        ? (
            (overallPresent /
              overallTotal) *
            100
          ).toFixed(2)
        : "0.00";

    // ==================================================
    // 12. Overall shortage
    // ==================================================

    const requiredOverall =
      Math.ceil(
        overallTotal * 0.75
      );

    const overallShortage =
      requiredOverall - overallPresent > 0
        ? requiredOverall - overallPresent
        : 0;

    // ==================================================
    // 13. Return response
    // ==================================================

    console.log(
      "STUDENT DAY-BASED ALERT:",
      {
        studentId:
          String(studentObjectId),

        overallTotal,
        overallPresent,
        overallPercent,

        monthlyAlerts,
      }
    );

    return NextResponse.json({
      overall: {
        total: overallTotal,
        present: overallPresent,
        percent: overallPercent,
        shortage: overallShortage,

        isBelowThreshold:
          parseFloat(overallPercent) < 75,
      },

      monthlyAlerts,

      status: "success",
    });
  } catch (err) {
    console.error(
      "Attendance alert error:",
      err
    );

    return NextResponse.json(
      {
        status: "error",
        error: "Server error",
      },
      { status: 500 }
    );
  }
}