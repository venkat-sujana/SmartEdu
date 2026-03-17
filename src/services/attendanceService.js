// services/attendanceService.js
import connectMongoDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import { startOfDay, endOfDay } from "date-fns";
import mongoose from "mongoose";
import {
  buildAttendanceSessionReadFilter,
  normalizeAttendanceSession,
} from "@/validations/attendanceValidation";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

export async function getTodayAttendancePercent(collegeId) {
  await connectMongoDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayRecords = await Attendance.find({
    collegeId,
    date: { $gte: today, $lt: tomorrow },
    ...buildAttendanceSessionReadFilter(),
  });

  const presentCount = todayRecords.filter(
    (rec) => rec.status === "Present"
  ).length;

  const totalStudents = await Student.countDocuments({
    collegeId,
    status: "Active",
  });

  const percent =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  return percent;
}





export async function getTodayAttendanceStats(collegeId, date) {

  await connectMongoDB();

  const start = new Date(date);
  start.setHours(0,0,0,0);

  const end = new Date(date);
  end.setHours(23,59,59,999);

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);

  const result = await Attendance.aggregate([
    {
      $match: {
        collegeId: collegeObjectId,
        date: { $gte: start, $lte: end },
        ...buildAttendanceSessionReadFilter(),
      }
    },
    {
      $group: {
        _id: null,
        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
          }
        },
        totalRecords: { $sum: 1 }
      }
    }
  ]);

  const totalStudents = await Student.countDocuments({
    collegeId: collegeObjectId,
    status: "Active"
  });

  const present = result[0]?.present || 0;
  const absent = totalStudents - present;

  const percent =
    totalStudents > 0
      ? Math.round((present / totalStudents) * 100)
      : 0;

  return {
    percent,
    present,
    absent,
    totalStudents
  };
}




export async function getTodayAttendanceList(collegeId, date) {

  await connectMongoDB();

  const start = new Date(date);
  start.setHours(0,0,0,0);

  const end = new Date(date);
  end.setHours(23,59,59,999);

  const records = await Attendance.aggregate([
    {
      $match: {
        collegeId: new mongoose.Types.ObjectId(collegeId),
        date: { $gte: start, $lte: end },
        ...buildAttendanceSessionReadFilter(),
      }
    },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student"
      }
    },
    { $unwind: "$student" },

    {
      $project: {
        name: "$student.name",
        group: "$group",
        yearOfStudy: "$yearOfStudy",
        status: 1
      }
    }
  ]);

  const grouped = {};

  for (const r of records) {

    if (!grouped[r.group]) {
      grouped[r.group] = { Present: [], Absent: [] };
    }

    grouped[r.group][r.status].push({
      name: r.name,
      year: r.yearOfStudy
    });

  }

  return grouped;
}





export async function getTodayAttendanceBreakdown(collegeId) {
  await connectMongoDB();

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const result = await Attendance.aggregate([
  {
    $match:{
      collegeId:new mongoose.Types.ObjectId(collegeId),
      status:"Present",
      date:{ $gte:todayStart, $lte:todayEnd },
      ...buildAttendanceSessionReadFilter()
    }
  },
  {
    $group:{
      _id:"$yearOfStudy",
      count:{ $sum:1 }
    }
  }
])

  const firstYear = todayPresent.filter(
    (a) => a.yearOfStudy === "First Year"
  ).length;

  const secondYear = todayPresent.filter(
    (a) => a.yearOfStudy === "Second Year"
  ).length;

  const totalPresent = firstYear + secondYear;

  const totalStudents = await Student.countDocuments({
    collegeId,
    status: "Active",
  });

  const collegePercent =
    totalStudents > 0
      ? Math.round((totalPresent / totalStudents) * 100)
      : 0;

  return {
    firstYear,
    secondYear,
    total: totalPresent,
    percent: collegePercent,
  };
}





export async function getTodayAbsentees(collegeId) {
  await connectMongoDB();

  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const todayRecords = await Attendance.find({
    collegeId,
    date: { $gte: start, $lte: end },
    ...buildAttendanceSessionReadFilter(),
  }).populate("studentId", "name yearOfStudy group");

  if (todayRecords.length === 0) {
    return {
      status: "no-data",
      message: "No attendance recorded today",
    };
  }

  const sessions = ["FN", "AN"];
  const normalizedRecords = todayRecords.map((record) => ({
    ...record.toObject(),
    session: normalizeAttendanceSession(record.session),
  }));

  const sessionWiseAbsentees = {};
  const sessionWisePresent = {};

  let grandTotal = 0;
  let grandAbsent = 0;
  let grandPresent = 0;

  for (const session of sessions) {
    const absentees = normalizedRecords.filter(
      (r) => r.session === session && r.status === "Absent"
    );

    const presentStudents = normalizedRecords.filter(
      (r) => r.session === session && r.status === "Present"
    );

    const total = normalizedRecords.filter(
      (r) => r.session === session
    ).length;

    sessionWiseAbsentees[session] = absentees.map((r) => ({
      name: r.studentId?.name || "Unknown",
      yearOfStudy: r.yearOfStudy || r.studentId?.yearOfStudy,
      group: normalizeAttendanceGroup(r.group || r.studentId?.group),
      session: r.session,
      lecturerName: r.lecturerName || "—",
      markedAt: r.markedAt || r.updatedAt || null,
    }));

    sessionWisePresent[session] = presentStudents.map((r) => ({
      name: r.studentId?.name || "Unknown",
      yearOfStudy: r.yearOfStudy || r.studentId?.yearOfStudy,
      group: normalizeAttendanceGroup(r.group || r.studentId?.group),
      session: r.session,
      lecturerName: r.lecturerName || "—",
      markedAt: r.markedAt || r.updatedAt || null,
    }));

    grandTotal += total;
    grandAbsent += absentees.length;
    grandPresent += presentStudents.length;
  }

  return {
    status: "success",
    sessions,
    sessionWiseAbsentees,
    sessionWisePresent,
    summary: {
      grandTotal,
      grandAbsent,
      grandPresent,
      percentage:
        grandTotal > 0
          ? ((grandPresent / grandTotal) * 100).toFixed(2)
          : "0.00",
    },
  };
}



export async function getMonthlySummary({ collegeId, group, yearOfStudy }) {

  await connectDB();

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);

  const match = {
    collegeId: collegeObjectId,
    ...buildAttendanceSessionReadFilter(),
  };

  if (group) {
    match.group = new RegExp(`^${group}$`, "i");
  }

  if (yearOfStudy) {
    if (yearOfStudy === "1" || /first/i.test(yearOfStudy)) {
      match.yearOfStudy = /first/i;
    }
    else if (yearOfStudy === "2" || /second/i.test(yearOfStudy)) {
      match.yearOfStudy = /second/i;
    }
  }

  const pipeline = [

    { $match: match },

    {
      $group: {
        _id: {
          studentId: "$studentId",
          month: "$month",
          year: "$year"
        },

        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
          }
        },

        workingDays: { $sum: 1 }
      }
    },

    {
      $lookup: {
        from: "students",
        localField: "_id.studentId",
        foreignField: "_id",
        as: "student"
      }
    },

    { $unwind: "$student" },

    {
      $project: {
        name: "$student.name",
        yearOfStudy: "$student.yearOfStudy",

        monthKey: {
          $concat: [
            { $toString: "$_id.month" },
            "-",
            { $toString: "$_id.year" }
          ]
        },

        present: 1,
        workingDays: 1,

        percentage: {
          $multiply: [
            { $divide: ["$present", "$workingDays"] },
            100
          ]
        }
      }
    }

  ];

  const results = await Attendance.aggregate(pipeline);

  const summary = {};

  for (const r of results) {

    if (!summary[r.name]) {
      summary[r.name] = {
        name: r.name,
        yearOfStudy: r.yearOfStudy,
        present: {},
        workingDays: {},
        percentage: {}
      };
    }

    summary[r.name].present[r.monthKey] = r.present;
    summary[r.name].workingDays[r.monthKey] = r.workingDays;
    summary[r.name].percentage[r.monthKey] =
      r.percentage.toFixed(2) + "%";

  }

  return Object.values(summary);
}



export async function getStudentMonthlySummary(collegeId, yearOfStudy) {

  await connectMongoDB();

  const collegeObjectId = mongoose.Types.ObjectId.isValid(collegeId)
    ? new mongoose.Types.ObjectId(collegeId)
    : collegeId;

  const pipeline = [

    {
      $match: {
        collegeId: collegeObjectId,
        ...buildAttendanceSessionReadFilter(),
        ...(yearOfStudy && { yearOfStudy })
      }
    },

    {
      $group: {
        _id: {
          month: "$month",
          year: "$year"
        },

        total: { $sum: 1 },

        present: {
          $sum: {
            $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
          }
        }
      }
    },

    {
      $project: {
        _id: 0,
        month: "$_id.month",
        year: "$_id.year",
        total: 1,
        present: 1,
        percentage: {
          $round: [
            {
              $multiply: [
                { $divide: ["$present", "$total"] },
                100
              ]
            },
            2
          ]
        }
      }
    },

    {
      $sort: { year: 1, month: 1 }
    }

  ];

  const result = await Attendance.aggregate(pipeline);

  return result;
}




export async function getStudentMonthlyCalendar({
  collegeId,
  studentId,
  month,
  year,
}) {

  await connectMongoDB();

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);
  const studentObjectId = new mongoose.Types.ObjectId(studentId);

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  const student = await Student.findOne({
    _id: studentObjectId,
    collegeId: collegeObjectId
  })
  .select("dateOfJoining yearOfStudy")
  .lean();

  if (!student) {
    throw new Error("STUDENT_NOT_FOUND");
  }

  const records = await Attendance.find({
    studentId: studentObjectId,
    collegeId: collegeObjectId,
    date: { $gte: start, $lte: end },
    ...buildAttendanceSessionReadFilter(),
  })
    .select("date status")
  .lean();

  const recordMap = new Map(
    records.map((r) => [
      new Date(r.date).toDateString(),
      r.status
    ])
  );

  const daysInMonth = end.getDate();
  const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;

  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {

    const currentDate = new Date(year, month, day);

    if (
      student.yearOfStudy?.toLowerCase().includes("first") &&
      doj &&
      currentDate < doj
    ) {
      result.push({
        date: currentDate,
        status: "🚫"
      });
      continue;
    }

    const status =
      recordMap.get(currentDate.toDateString()) || "N/A";

    result.push({
      date: currentDate,
      status
    });

  }

  return result;
}

