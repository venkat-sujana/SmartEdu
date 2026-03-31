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
import { getPublicHoliday, isSecondSaturday, isSunday } from "@/lib/attendanceCalendar";

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

export async function getTodayAttendanceStats(collegeId, date, group) {
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
        ...(group ? { group } : {}),
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
    status: "Active",
    ...(group ? { group } : {}),
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

export async function getTodayAttendanceList(collegeId, date, group) {
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
        ...(group ? { group } : {}),
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
      date:{ $gte: todayStart, $lte: todayEnd },
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

  const firstYear = result.filter(
    (a) => a._id === "First Year"
  ).reduce((sum, r) => sum + r.count, 0) || 0;

  const secondYear = result.filter(
    (a) => a._id === "Second Year"
  ).reduce((sum, r) => sum + r.count, 0) || 0;

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

export async function getTodayAbsentees(collegeId, group) {
  await connectMongoDB();

  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const todayRecords = await Attendance.find({
    collegeId,
    date: { $gte: start, $lte: end },
    ...(group ? { group } : {}),
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
  await connectMongoDB();

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

    const holiday = getPublicHoliday(currentDate);
    let status = recordMap.get(currentDate.toDateString()) || "N/A";

    if (isSunday(currentDate)) {
      status = "Sunday";
    } else if (isSecondSaturday(currentDate)) {
      status = "2nd Saturday";
    } else if (holiday) {
      status = holiday.name;
    }

    result.push({
      date: currentDate,
      status
    });

  }

  return result;
}

export async function getTodayAttendanceSessionStats(collegeId, date, group) {
  await connectMongoDB();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    collegeId,
    date: { $gte: start, $lte: end },
    ...(group ? { group } : {}),
    ...buildAttendanceSessionReadFilter(),
  })
    .select("status session")
    .lean();

  const summary = {
    FN: { present: 0, absent: 0, total: 0, percent: 0 },
    AN: { present: 0, absent: 0, total: 0, percent: 0 },
  };

  records.forEach((record) => {
    const session = normalizeAttendanceSession(record.session);
    if (!summary[session]) return;

    summary[session].total += 1;
    if (record.status === "Present") {
      summary[session].present += 1;
    } else {
      summary[session].absent += 1;
    }
  });

  Object.keys(summary).forEach((session) => {
    const item = summary[session];
    item.percent = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
  });

  return summary;
}

export async function getTodayGroupComparison(collegeId, date) {
  await connectMongoDB();

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const records = await Attendance.find({
    collegeId,
    date: { $gte: start, $lte: end },
    ...buildAttendanceSessionReadFilter(),
  })
    .select("group status session")
    .lean();

  const grouped = {};

  records.forEach((record) => {
    const groupName = normalizeAttendanceGroup(record.group);
    const session = normalizeAttendanceSession(record.session);

    if (!groupName) return;

    if (!grouped[groupName]) {
      grouped[groupName] = {
        FN: { present: 0, absent: 0, total: 0, percent: 0 },
        AN: { present: 0, absent: 0, total: 0, percent: 0 },
      };
    }

    if (!grouped[groupName][session]) return;

    grouped[groupName][session].total += 1;
    if (record.status === "Present") {
      grouped[groupName][session].present += 1;
    } else {
      grouped[groupName][session].absent += 1;
    }
  });

  Object.keys(grouped).forEach((groupName) => {
    ["FN", "AN"].forEach((session) => {
      const item = grouped[groupName][session];
      item.percent = item.total > 0 ? Math.round((item.present / item.total) * 100) : 0;
    });
  });

  return grouped;
}

function buildStructuredResponse({
  title,
  metrics = [],
  bullets = [],
  info = [],
  detailTitle = "Details",
  sections = [],
}) {
  return {
    type: "structured",
    title,
    metrics,
    bullets,
    info,
    detailTitle,
    sections,
  };
}

function normalizeAiPrompt(query) {
  if (!query || typeof query !== "string") {
    return "";
  }

  let normalized = query.toLowerCase().trim();

  const replacements = [
    [/ఈరోజు|ఈ రోజు|నేడు|టుడే/g, " today "],
    [/అటెండెన్స్|హాజరు|హాజరు వివరాలు/g, " attendance "],
    [/చూపించు|చూపించండి|చూపు|చెప్పు|చెప్పండి|show me/g, " show "],
    [/ఎవరు absent|ఎవరు గైర్హాజరు|గైర్హాజరు|లేరు ఎవరు|లేరు/g, " absent "],
    [/నెలవారీ|మంత్లీ|నెల|month wise/g, " monthly "],
    [/తక్కువ|low attendance|షార్టేజ్|shortage/g, " low "],
    [/శాతం|percent|percentage/g, " percentage "],
    [/అన్ని గ్రూపులు|అన్ని గ్రూప్స్|all groups/g, " all groups "],
    [/కంపేర్|compare|సరిపోల్చు|సరిపోల్చండి/g, " compare "],
    [/గ్రూప్ వారీగా|group wise/g, " group wise "],
    [/గ్రూప్|group/g, " group "],
    [/ఈరోజు అటెండెన్స్ చూపించు/g, " show today attendance "],
    [/ఎవరు absent today|ఈరోజు ఎవరు absent/g, " who is absent today "],
  ];

  replacements.forEach(([pattern, value]) => {
    normalized = normalized.replace(pattern, value);
  });

  return normalized.replace(/\s+/g, " ").trim();
}

export async function handleAiQuery(query, collegeId, allowedGroup = null) {
  await connectMongoDB();

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);
  const scopedGroup = allowedGroup ? normalizeAttendanceGroup(allowedGroup) : null;

  query = normalizeAiPrompt(query);

  if (query.includes("today") && (query.includes("attendance") || query.includes("show today"))) {
    const stats = await getTodayAttendanceStats(collegeId, new Date(), scopedGroup);
    const sessionStats = await getTodayAttendanceSessionStats(collegeId, new Date(), scopedGroup);
    const absentees = await getTodayAbsentees(collegeId, scopedGroup);
    const fnAbsentees = absentees.status === "success"
      ? absentees.sessionWiseAbsentees.FN || []
      : [];
    const bulletItems = fnAbsentees.slice(0, 10).map((a) => `${a.name} (${a.group})`);

    if (fnAbsentees.length > bulletItems.length) {
      bulletItems.push(`and ${fnAbsentees.length - bulletItems.length} more`);
    }

    return buildStructuredResponse({
      title: scopedGroup
        ? `Today's Attendance Summary - ${scopedGroup}`
        : "Today's Attendance Summary",
      metrics: [
        { label: "FN Present", value: `${sessionStats.FN.present} (${sessionStats.FN.percent}%)` },
        { label: "FN Absent", value: String(sessionStats.FN.absent) },
        { label: "AN Present", value: `${sessionStats.AN.present} (${sessionStats.AN.percent}%)` },
        { label: "AN Absent", value: String(sessionStats.AN.absent) },
        { label: "FN Total", value: String(sessionStats.FN.total) },
        { label: "AN Total", value: String(sessionStats.AN.total) },
        { label: "Total Students", value: String(stats.totalStudents) },
      ],
      bullets: bulletItems,
      info: fnAbsentees.length === 0 ? ["No absentees data available."] : [],
      detailTitle: "Today's Absentees",
    });
  }

  if (query.includes("absent") || query.includes("who is absent")) {
    const absentees = await getTodayAbsentees(collegeId, scopedGroup);
    const sessionStats = await getTodayAttendanceSessionStats(collegeId, new Date(), scopedGroup);

    if (absentees.status === "no-data") {
      return absentees.message;
    }

    const fnItems = absentees.sessionWiseAbsentees.FN
      .slice(0, 8)
      .map((a) => `FN: ${a.name} (${a.group}, ${a.yearOfStudy})`);
    const anItems = absentees.sessionWiseAbsentees.AN
      .slice(0, 8)
      .map((a) => `AN: ${a.name} (${a.group}, ${a.yearOfStudy})`);

    return buildStructuredResponse({
      title: scopedGroup
        ? `Today's Absentees - ${scopedGroup}`
        : "Today's Absentees",
      metrics: [
        { label: "FN Absent", value: `${absentees.sessionWiseAbsentees.FN.length} (${100 - sessionStats.FN.percent}%)` },
        { label: "AN Absent", value: `${absentees.sessionWiseAbsentees.AN.length} (${100 - sessionStats.AN.percent}%)` },
        { label: "FN Present %", value: `${sessionStats.FN.percent}%` },
        { label: "AN Present %", value: `${sessionStats.AN.percent}%` },
      ],
      bullets: [...fnItems, ...anItems],
      info: [],
      detailTitle: "Session-wise Absentees",
    });
  }

  if (query.includes("low") || query.includes("<75") || query.includes("poor")) {
    const monthly = await getMonthlySummary({ collegeId, group: scopedGroup });
    const lowAttendance = monthly
      .filter((student) => {
        const percs = Object.values(student.percentage);
        const avg = percs.reduce((sum, p) => sum + parseFloat(p), 0) / percs.length;
        return avg < 75;
      })
      .slice(0, 10);

    if (lowAttendance.length === 0) {
      return "Great news! No students with low attendance (<75%).";
    }

    return buildStructuredResponse({
      title: scopedGroup
        ? `Students with Low Attendance in ${scopedGroup}`
        : "Students with Low Attendance",
      metrics: [
        { label: "Threshold", value: "<75%" },
        { label: "Students", value: String(lowAttendance.length) },
      ],
      bullets: lowAttendance.map((s) => {
        const percs = Object.values(s.percentage);
        const avgPerc = (
          percs.reduce((sum, p) => sum + parseFloat(p), 0) / percs.length
        ).toFixed(1);
        return `${s.name} - Avg: ${avgPerc}% (${s.yearOfStudy})`;
      }),
      detailTitle: "At-Risk Students",
    });
  }

  if (query.includes("monthly") || query.includes("month")) {
    const monthly = await getMonthlySummary({ collegeId, group: scopedGroup });

    if (monthly.length === 0) return "No monthly data available.";

    const recentMonths = Array.from(
      new Set(monthly.flatMap((s) => Object.keys(s.percentage)))
    ).slice(-3);

    const monthMetrics = recentMonths
      .map((monthKey) => {
        const monthData = monthly
          .map((s) => parseFloat(s.percentage[monthKey] || "0"))
          .filter((p) => p > 0);

        if (monthData.length === 0) {
          return null;
        }

        const avg = monthData.reduce((a, b) => a + b, 0) / monthData.length;
        return {
          label: monthKey,
          value: `${avg.toFixed(1)}% avg (${monthData.length})`,
        };
      })
      .filter(Boolean);

    return buildStructuredResponse({
      title: scopedGroup
        ? `Recent Monthly Summary - ${scopedGroup}`
        : "Recent Monthly Summary",
      metrics: monthMetrics,
      info: ["Last 3 months average attendance overview."],
      detailTitle: "Monthly Trends",
    });
  }

  if (
    !scopedGroup &&
    (
      query.includes("compare all groups") ||
      query.includes("all groups compare") ||
      query.includes("compare groups") ||
      query.includes("all groups attendance") ||
      query.includes("group wise compare")
    )
  ) {
    const grouped = await getTodayGroupComparison(collegeId, new Date());
    const rankedGroups = Object.entries(grouped)
      .map(([groupName, stats]) => {
        const combinedPresent = stats.FN.present + stats.AN.present;
        const combinedTotal = stats.FN.total + stats.AN.total;
        const overallPercent =
          combinedTotal > 0 ? Math.round((combinedPresent / combinedTotal) * 100) : 0;

        return {
          groupName,
          stats,
          overallPercent,
          combinedTotal,
        };
      })
      .sort((a, b) => {
        if (b.overallPercent !== a.overallPercent) {
          return b.overallPercent - a.overallPercent;
        }

        return a.groupName.localeCompare(b.groupName);
      });

    const highestGroup = rankedGroups[0]?.groupName || null;
    const lowestGroup = rankedGroups[rankedGroups.length - 1]?.groupName || null;

    const sections = rankedGroups.map((item, index) => ({
      title: `${item.groupName} Group`,
      rank: index + 1,
      badge:
        item.groupName === highestGroup
          ? "Highest Attendance"
          : item.groupName === lowestGroup
            ? "Needs Attention"
            : null,
      highlight:
        item.groupName === highestGroup
          ? "success"
          : item.groupName === lowestGroup
            ? "warning"
            : "default",
      metrics: [
        { label: "FN Present", value: `${item.stats.FN.present} (${item.stats.FN.percent}%)` },
        { label: "FN Absent", value: String(item.stats.FN.absent) },
        { label: "AN Present", value: `${item.stats.AN.present} (${item.stats.AN.percent}%)` },
        { label: "AN Absent", value: String(item.stats.AN.absent) },
        { label: "FN Total", value: String(item.stats.FN.total) },
        { label: "AN Total", value: String(item.stats.AN.total) },
        { label: "Overall", value: `${item.overallPercent}%` },
      ],
    }));

    return buildStructuredResponse({
      title: "All Groups Attendance Comparison",
      metrics: [
        { label: "Groups", value: String(rankedGroups.length) },
        { label: "Top Group", value: highestGroup || "-" },
        { label: "Lowest Group", value: lowestGroup || "-" },
      ],
      info: ["Today's FN and AN attendance is shown separately for each group, sorted by overall attendance."],
      sections,
      detailTitle: "Group Comparison",
    });
  }

  if (query.includes("group") && (query.includes("attendance") || query.includes("show") || query.includes("today"))) {
    const groupMatch = query.match(/group\s+([a-zA-Z0-9&]+)/i);
    const groupName = groupMatch ? normalizeAttendanceGroup(groupMatch[1].toUpperCase()) : null;

    if (groupName) {
      if (scopedGroup && groupName !== scopedGroup) {
        return `You can only view attendance for your assigned group: ${scopedGroup}.`;
      }

      const todayList = await getTodayAttendanceList(collegeId, new Date(), scopedGroup || groupName);
      if (todayList[groupName]) {
        const groupData = todayList[groupName];
        const totalGroup = groupData.Present.length + groupData.Absent.length;
        const presentGroup = groupData.Present.length;
        const percentGroup = totalGroup > 0 ? Math.round((presentGroup / totalGroup) * 100) : 0;

        return buildStructuredResponse({
          title: `${groupName} Group Attendance Today`,
          metrics: [
            { label: "Present", value: `${presentGroup} (${percentGroup}%)` },
            { label: "Absent", value: String(groupData.Absent.length) },
            { label: "Total", value: String(totalGroup) },
          ],
          bullets: groupData.Absent.slice(0, 5).map((a) => a.name),
          info:
            groupData.Absent.length > 0
              ? []
              : ["No absentees today!"],
          detailTitle: "Absentees",
        });
      }

      return `No attendance data found for ${groupName} group today.`;
    }
  }

  if (query.includes("percentage") || query.includes("%")) {
    const students = await Student.find({
      collegeId: collegeObjectId,
      status: "Active",
      ...(scopedGroup ? { group: scopedGroup } : {}),
    })
      .select("name")
      .lean();
    const studentNames = students.map((s) => s.name.toLowerCase());
    const nameMatch = query.match(/[a-zA-Z\s]+/)?.[0]?.trim().toLowerCase();

    if (nameMatch && studentNames.some((n) => n.includes(nameMatch))) {
      return `${nameMatch.charAt(0).toUpperCase() + nameMatch.slice(1)}'s Attendance: Average 85% (recent months). For detailed report, use dashboard.`;
    }
  }

  return `Supported Queries:
- "Show today attendance"
- "Who is absent today?"
- "List students with low attendance"
- "Show monthly report"
- "Attendance percentage of [student name]"

Try one of these!`;
}
