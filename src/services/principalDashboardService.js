import mongoose from "mongoose";

import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Lecturer from "@/models/Lecturer";
import Student from "@/models/Student";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getYearLabel(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "first year" || normalized === "1" || normalized === "first") {
    return "First Year";
  }

  if (normalized === "second year" || normalized === "2" || normalized === "second") {
    return "Second Year";
  }

  return value || "Unknown";
}

function getGroupLabel(value) {
  const normalized = String(value || "").trim().toUpperCase();

  if (normalized === "BIPC") {
    return "BiPC";
  }

  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";
  if (normalized === "M&AT") return "M&AT";

  return value || "Unknown";
}

export async function getPrincipalDashboardOverview(collegeId) {
  await connectMongoDB();

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);
  const { start, end } = getTodayRange();

  const [studentCounts, totalLecturers, todayAttendance] = await Promise.all([
    Student.aggregate([
      {
        $match: {
          collegeId: collegeObjectId,
          status: "Active",
        },
      },
      {
        $group: {
          _id: {
            group: "$group",
            normalizedYear: {
              $ifNull: ["$yearOfStudy", "$year"],
            },
          },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          group: "$_id.group",
          year: "$_id.normalizedYear",
          totalStudents: 1,
        },
      },
      {
        $sort: {
          year: 1,
          group: 1,
        },
      },
    ]),
    Lecturer.countDocuments({ collegeId: collegeObjectId }),
    Attendance.aggregate([
      {
        $match: {
          collegeId: collegeObjectId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$studentId",
          group: { $first: "$group" },
          normalizedYear: {
            $first: {
              $ifNull: ["$yearOfStudy", "$year"],
            },
          },
          presentFlag: {
            $max: {
              $cond: [{ $eq: ["$status", "Present"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          group: 1,
          year: "$normalizedYear",
          isPresent: "$presentFlag",
        },
      },
    ]),
  ]);

  const normalizedStudentCounts = Array.from(
    studentCounts.reduce((map, item) => {
      const group = getGroupLabel(item.group);
      const year = getYearLabel(item.year);
      const key = `${year}::${group}`;
      const current = map.get(key);

      if (current) {
        current.totalStudents += item.totalStudents;
        return map;
      }

      map.set(key, {
        group,
        year,
        totalStudents: item.totalStudents,
      });

      return map;
    }, new Map()).values()
  );

  const normalizedTodayAttendance = todayAttendance.map((item) => ({
    ...item,
    group: getGroupLabel(item.group),
    year: getYearLabel(item.year),
  }));

  const totalStudents = normalizedStudentCounts.reduce((sum, item) => sum + item.totalStudents, 0);
  const totalGroups = new Set(normalizedStudentCounts.map((item) => item.group).filter(Boolean)).size;
  const presentStudentIds = new Set(
    normalizedTodayAttendance
      .filter((item) => item.isPresent === 1)
      .map((item) => String(item.studentId))
  );

  const totalPresentToday = presentStudentIds.size;
  const totalAbsenteesToday = Math.max(totalStudents - totalPresentToday, 0);
  const attendancePercentage =
    totalStudents > 0 ? Number(((totalPresentToday / totalStudents) * 100).toFixed(1)) : 0;

  const attendanceByKey = normalizedTodayAttendance.reduce((map, item) => {
    if (item.isPresent !== 1) {
      return map;
    }

    const key = `${item.year}::${item.group}`;
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map());

  const buildYearRows = (targetYear) =>
    normalizedStudentCounts
      .filter((item) => item.year === targetYear)
      .map((item) => {
        const key = `${targetYear}::${item.group}`;
        const total = item.totalStudents;
        const presentCount = attendanceByKey.get(key) || 0;
        const absentCount = Math.max(total - presentCount, 0);

        return {
          group: item.group,
          totalStudents: total,
          present: presentCount,
          absent: absentCount,
          percentage: total > 0 ? Number(((presentCount / total) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group));

  return {
    summary: {
      totalStudents,
      totalLecturers,
      totalGroups,
      attendancePercentage,
      totalAbsenteesToday,
      totalPresentToday,
    },
    attendanceOverview: {
      firstYear: buildYearRows("First Year"),
      secondYear: buildYearRows("Second Year"),
    },
    generatedAt: start.toISOString(),
  };
}
