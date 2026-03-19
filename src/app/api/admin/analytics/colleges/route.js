import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import College from "@/models/College";
import Lecturer from "@/models/Lecturer";
import Principal from "@/models/Principal";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";

function toMap(items, mapper) {
  return new Map(items.map((item) => [String(item._id), mapper(item)]));
}

function getMonthStartOffset(offset) {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() - offset);
  return date;
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const trendStartDate = getMonthStartOffset(5);

    const [
      colleges,
      studentStats,
      lecturerStats,
      principalStats,
      attendanceStats,
      monthlyAttendanceStats,
      groupStats,
      districtStats,
    ] = await Promise.all([
      College.find({}).select("name code district groups createdAt").sort({ name: 1 }).lean(),
      Student.aggregate([
        {
          $group: {
            _id: "$collegeId",
            students: { $sum: 1 },
            activeStudents: {
              $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] },
            },
            terminatedStudents: {
              $sum: { $cond: [{ $eq: ["$status", "Terminated"] }, 1, 0] },
            },
            firstYearStudents: {
              $sum: { $cond: [{ $eq: ["$yearOfStudy", "First Year"] }, 1, 0] },
            },
            secondYearStudents: {
              $sum: { $cond: [{ $eq: ["$yearOfStudy", "Second Year"] }, 1, 0] },
            },
          },
        },
      ]),
      Lecturer.aggregate([{ $group: { _id: "$collegeId", lecturers: { $sum: 1 } } }]),
      Principal.aggregate([{ $group: { _id: "$collegeId", principals: { $sum: 1 } } }]),
      Attendance.aggregate([
        {
          $group: {
            _id: "$collegeId",
            attendanceRecords: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
            },
            lastAttendanceDate: { $max: "$date" },
          },
        },
      ]),
      Attendance.aggregate([
        {
          $match: {
            date: { $gte: trendStartDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            attendanceRecords: { $sum: 1 },
            presentCount: {
              $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
      Student.aggregate([
        { $group: { _id: "$group", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 8 },
      ]),
      College.aggregate([
        {
          $group: {
            _id: { $ifNull: ["$district", "Unspecified"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 8 },
      ]),
    ]);

    const studentMap = toMap(studentStats, (item) => item);
    const lecturerMap = toMap(lecturerStats, (item) => item);
    const principalMap = toMap(principalStats, (item) => item);
    const attendanceMap = toMap(attendanceStats, (item) => item);

    const collegeMetrics = colleges
      .map((college) => {
        const key = String(college._id);
        const student = studentMap.get(key) || {};
        const lecturer = lecturerMap.get(key) || {};
        const principal = principalMap.get(key) || {};
        const attendance = attendanceMap.get(key) || {};
        const attendanceRecords = attendance.attendanceRecords || 0;
        const presentCount = attendance.presentCount || 0;
        const attendanceRate = attendanceRecords ? Math.round((presentCount / attendanceRecords) * 1000) / 10 : 0;

        return {
          collegeId: key,
          name: college.name,
          code: college.code,
          district: college.district || "-",
          groupsCount: Array.isArray(college.groups) ? college.groups.length : 0,
          students: student.students || 0,
          activeStudents: student.activeStudents || 0,
          terminatedStudents: student.terminatedStudents || 0,
          firstYearStudents: student.firstYearStudents || 0,
          secondYearStudents: student.secondYearStudents || 0,
          lecturers: lecturer.lecturers || 0,
          principals: principal.principals || 0,
          attendanceRate,
          attendanceRecords,
          presentCount,
          lastAttendanceDate: attendance.lastAttendanceDate || null,
          createdAt: college.createdAt,
        };
      })
      .sort((a, b) => b.students - a.students || a.name.localeCompare(b.name));

    const overview = collegeMetrics.reduce(
      (acc, item) => {
        acc.totalColleges += 1;
        acc.totalStudents += item.students;
        acc.activeStudents += item.activeStudents;
        acc.terminatedStudents += item.terminatedStudents;
        acc.totalLecturers += item.lecturers;
        acc.totalPrincipals += item.principals;
        acc.totalAttendanceRecords += item.attendanceRecords;
        acc.presentAttendance += item.presentCount;
        return acc;
      },
      {
        totalColleges: 0,
        totalStudents: 0,
        activeStudents: 0,
        terminatedStudents: 0,
        totalLecturers: 0,
        totalPrincipals: 0,
        totalAttendanceRecords: 0,
        presentAttendance: 0,
      }
    );

    const overallAttendanceRate = overview.totalAttendanceRecords
      ? Math.round((overview.presentAttendance / overview.totalAttendanceRecords) * 1000) / 10
      : 0;

    const monthWiseTrend = Array.from({ length: 6 }, (_, index) => {
      const date = getMonthStartOffset(5 - index);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const match = monthlyAttendanceStats.find((item) => item._id.year === year && item._id.month === month);
      const attendanceRecords = match?.attendanceRecords || 0;
      const presentCount = match?.presentCount || 0;
      const attendanceRate = attendanceRecords
        ? Math.round((presentCount / attendanceRecords) * 1000) / 10
        : 0;

      return {
        key: `${year}-${String(month).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        attendanceRecords,
        presentCount,
        attendanceRate,
      };
    });

    const rankedColleges = [...collegeMetrics]
      .filter((item) => item.students > 0 || item.attendanceRecords > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate || b.activeStudents - a.activeStudents || a.name.localeCompare(b.name));

    return NextResponse.json({
      overview: {
        ...overview,
        overallAttendanceRate,
      },
      colleges: collegeMetrics,
      monthWiseTrend,
      topPerformers: rankedColleges.slice(0, 3),
      lowPerformers: [...rankedColleges].reverse().slice(0, 3),
      groupDistribution: groupStats.map((item) => ({ group: item._id || "Unassigned", count: item.count })),
      districtDistribution: districtStats.map((item) => ({ district: item._id || "Unspecified", count: item.count })),
    });
  } catch (error) {
    console.error("Admin college analytics GET error:", error);
    return NextResponse.json({ error: "Failed to fetch college analytics" }, { status: 500 });
  }
}

