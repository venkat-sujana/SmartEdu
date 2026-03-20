import mongoose from "mongoose";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import { buildAttendanceSessionReadFilter } from "@/validations/attendanceValidation";

const publicHolidays = [
  { month: 0, day: 26 },
  { month: 5, day: 7 },
  { month: 7, day: 8 },
  { month: 7, day: 15 },
];

function isHoliday(dateObj) {
  return publicHolidays.some((holiday) => holiday.month === dateObj.getMonth() && holiday.day === dateObj.getDate());
}

export function normalizeYearValue(value) {
  if (!value) return "";
  const normalized = String(value).toLowerCase().replace(/\s+/g, " ").trim();
  if (normalized.includes("1")) return "first year";
  if (normalized.includes("2")) return "second year";
  if (normalized.includes("3")) return "third year";
  return normalized;
}

function toObjectIdOrRaw(value) {
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : value;
}

export async function getAttendanceShortageSummary({
  collegeId,
  group,
  yearOfStudy,
  threshold = 75,
}) {
  if (!collegeId) {
    throw new Error("collegeId required");
  }

  const normalizedYear = yearOfStudy ? normalizeYearValue(yearOfStudy) : null;
  const studentQuery = {
    collegeId: toObjectIdOrRaw(collegeId),
    status: "Active",
  };

  if (group) {
    studentQuery.group = group;
  }

  if (normalizedYear) {
    studentQuery.yearOfStudy = new RegExp(`^${normalizedYear}$`, "i");
  }

  const students = await Student.find(studentQuery).lean();

  const attendanceQuery = {
    collegeId: toObjectIdOrRaw(collegeId),
    ...buildAttendanceSessionReadFilter(),
  };

  if (group) {
    attendanceQuery.group = group;
  }

  if (normalizedYear) {
    attendanceQuery.yearOfStudy = new RegExp(`^${normalizedYear}$`, "i");
  }

  const attendanceRecords = await Attendance.find(attendanceQuery).lean();

  return students
    .map((student) => {
      const studentId = String(student._id);
      const studentYear = normalizeYearValue(student.yearOfStudy);
      const dateOfJoining = student.dateOfJoining ? new Date(student.dateOfJoining) : null;
      const presentDates = new Set();
      const workingDates = new Set();

      attendanceRecords.forEach((record) => {
        if (String(record.studentId) !== studentId || normalizeYearValue(record.yearOfStudy) !== studentYear) {
          return;
        }

        const recordDate = new Date(record.date);
        if ((dateOfJoining && recordDate < dateOfJoining) || isHoliday(recordDate)) {
          return;
        }

        const dateKey = recordDate.toDateString();
        workingDates.add(dateKey);

        if (String(record.status || "").toLowerCase() === "present") {
          presentDates.add(dateKey);
        }
      });

      const totalWorking = workingDates.size;
      const totalPresent = presentDates.size;
      const percentage = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

      return {
        studentId,
        name: student.name,
        fatherName: student.fatherName || "",
        mobile: student.mobile || "",
        parentMobile: student.parentMobile || "",
        yearOfStudy: student.yearOfStudy,
        group: student.group,
        percentage: Number(percentage.toFixed(2)),
        totalPresent,
        totalWorking,
      };
    })
    .filter((item) => item.totalWorking > 0 && item.percentage < threshold)
    .sort((a, b) => a.percentage - b.percentage || a.name.localeCompare(b.name));
}
