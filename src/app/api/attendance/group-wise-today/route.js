//src/app/api/attendance/group-wise-today/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  buildAttendanceSessionReadFilter,
  normalizeAttendanceSession,
} from "@/validations/attendanceValidation";
import { getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";

function getRecordPriority(record) {
  if (record?.lateComer) return 3;
  if (record?.status === "Present") return 2;
  if (record?.status === "Absent") return 1;
  return 0;
}

function dedupeAttendanceRecords(records = []) {
  const recordMap = new Map();

  for (const record of records) {
    const studentId = record.studentId?.toString?.();
    const session = normalizeAttendanceSession(record.session);

    if (!studentId || !session) continue;

    const key = `${studentId}_${session}`;
    const existingRecord = recordMap.get(key);

    if (!existingRecord) {
      recordMap.set(key, record);
      continue;
    }

    const currentPriority = getRecordPriority(record);
    const existingPriority = getRecordPriority(existingRecord);

    if (currentPriority > existingPriority) {
      recordMap.set(key, record);
      continue;
    }

    if (currentPriority === existingPriority) {
      const currentMarkedAt = new Date(record.markedAt || record.updatedAt || record.createdAt || 0).getTime();
      const existingMarkedAt = new Date(
        existingRecord.markedAt || existingRecord.updatedAt || existingRecord.createdAt || 0
      ).getTime();

      if (currentMarkedAt > existingMarkedAt) {
        recordMap.set(key, record);
      }
    }
  }

  return Array.from(recordMap.values());
}

export async function GET(req) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);

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

  const attendanceQuery = {
    date: { $gte: startOfDay, $lte: endOfDay },
    collegeId,
    ...buildAttendanceSessionReadFilter(),
  };

  if (session?.user?.role === "lecturer") {
    attendanceQuery.group = getLecturerGroupFromSubject(session.user.subject);
  }

  const attendanceRecords = await Attendance.find(attendanceQuery)
    .select("studentId group yearOfStudy status lecturerName session lateComer markedAt updatedAt")
    .lean();
  const uniqueRecords = dedupeAttendanceRecords(attendanceRecords);

  // ==== Group by group → year → session ====
  const result = {};

  uniqueRecords.forEach((record) => {
    const { group, yearOfStudy, status, lecturerName } = record;
    const session = normalizeAttendanceSession(record.session);

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
