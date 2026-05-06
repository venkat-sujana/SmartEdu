import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";
import {
  getMonthlySummary,
  getTodayAbsentees,
  getTodayAttendanceList,
  getTodayAttendanceSessionStats,
  getTodayAttendanceStats,
  getTodayGroupComparison,
} from "@/services/attendanceService";

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

function sortMonthKeys(keys = []) {
  return [...keys].sort((a, b) => {
    const [monthA, yearA] = String(a).split("-").map(Number);
    const [monthB, yearB] = String(b).split("-").map(Number);
    return (yearA * 100 + monthA) - (yearB * 100 + monthB);
  });
}

function extractGroupMention(query) {
  const normalized = String(query || "").toUpperCase().replace(/\s+/g, "");

  if (normalized.includes("M&AT") || normalized.includes("MANDAT")) return "M&AT";
  if (normalized.includes("BIPC")) return "BiPC";
  if (normalized.includes("MPC")) return "MPC";
  if (normalized.includes("CEC")) return "CEC";
  if (normalized.includes("HEC")) return "HEC";
  if (normalized.includes("CET")) return "CET";
  if (normalized.includes("MLT")) return "MLT";

  return null;
}

function extractYearFilter(query) {
  const normalized = String(query || "").toLowerCase();

  if (/(first year|1st year|1 year|year 1|1st)/.test(normalized)) {
    return "First Year";
  }
  if (/(second year|2nd year|2 year|year 2|2nd)/.test(normalized)) {
    return "Second Year";
  }

  return null;
}

function extractThreshold(query, fallback = 75) {
  const explicitMatch =
    query.match(/(?:below|under|less than|<)\s*(\d{1,3})\s*%?/) ||
    query.match(/(\d{1,3})\s*%?\s*(?:below|under)/);

  if (explicitMatch) {
    return Math.min(Math.max(Number(explicitMatch[1]), 1), 100);
  }

  return fallback;
}

function extractLimit(query, fallback = 10) {
  const match =
    query.match(/(?:top|first|show|list)\s+(\d{1,2})/) ||
    query.match(/(\d{1,2})\s*(?:students|records|items)/);

  if (!match) return fallback;
  return Math.min(Math.max(Number(match[1]), 1), 25);
}

function computeAveragePercentage(percentageMap = {}) {
  const values = Object.values(percentageMap)
    .map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function findStudentQueryText(query) {
  const patterns = [
    /attendance percentage of\s+(.+)/i,
    /attendance of\s+(.+)/i,
    /show\s+(.+?)\s+attendance/i,
    /for student\s+(.+)/i,
    /(.+?)'s attendance/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

function rankGroups(grouped = {}) {
  return Object.entries(grouped)
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
}

function normalizeAiPrompt(query) {
  if (!query || typeof query !== "string") {
    return "";
  }

  let normalized = query.toLowerCase().trim();
  const replacements = [
    [/\btoday\b/g, " today "],
    [/\bshow me\b/g, " show "],
    [/\bmonth wise\b/g, " monthly "],
    [/\blow attendance\b|\bshortage\b/g, " low "],
    [/\bpercent\b/g, " percentage "],
    [/\ball groups\b/g, " all groups "],
    [/\bcompare\b/g, " compare "],
    [/\bgroup wise\b/g, " group wise "],
    [/\bbest group\b|\btop group\b/g, " highest group "],
    [/\bworst group\b|\blowest group\b/g, " lowest group "],
    [/\btrend\b/g, " monthly trend "],
    [/\bat risk\b|\brisk\b/g, " low "],
  ];

  replacements.forEach(([pattern, value]) => {
    normalized = normalized.replace(pattern, value);
  });

  return normalized.replace(/\s+/g, " ").trim();
}

export async function handleAiQuery(query, collegeId, allowedGroup = null) {
  const scopedGroup = allowedGroup ? normalizeAttendanceGroup(allowedGroup) : null;
  const originalQuery = String(query || "").trim();
  const normalizedQuery = normalizeAiPrompt(query);
  const requestedGroup = extractGroupMention(`${originalQuery} ${normalizedQuery}`);
  const requestedYear = extractYearFilter(`${originalQuery} ${normalizedQuery}`);
  const threshold = extractThreshold(normalizedQuery, 75);
  const resultLimit = extractLimit(normalizedQuery, 10);

  if (requestedGroup && scopedGroup && requestedGroup !== scopedGroup) {
    return `You can only view attendance for your assigned group: ${scopedGroup}.`;
  }

  const effectiveGroup = scopedGroup || requestedGroup || null;

  if (
    !scopedGroup &&
    (
      normalizedQuery.includes("compare all groups") ||
      normalizedQuery.includes("all groups compare") ||
      normalizedQuery.includes("compare groups") ||
      normalizedQuery.includes("all groups attendance") ||
      normalizedQuery.includes("group wise compare") ||
      normalizedQuery.includes("highest group") ||
      normalizedQuery.includes("lowest group")
    )
  ) {
    const grouped = await getTodayGroupComparison(collegeId, new Date());
    const rankedGroups = rankGroups(grouped);

    if (!rankedGroups.length) {
      return "No group attendance data available for today.";
    }

    const highestGroup = rankedGroups[0]?.groupName || "-";
    const lowestGroup = rankedGroups[rankedGroups.length - 1]?.groupName || "-";

    if (normalizedQuery.includes("highest group") || normalizedQuery.includes("lowest group")) {
      const target = normalizedQuery.includes("lowest group")
        ? rankedGroups[rankedGroups.length - 1]
        : rankedGroups[0];

      return buildStructuredResponse({
        title: normalizedQuery.includes("lowest group")
          ? "Group That Needs Attention Today"
          : "Best Performing Group Today",
        metrics: [
          { label: "Group", value: target.groupName },
          { label: "Overall", value: `${target.overallPercent}%` },
          { label: "FN Present", value: `${target.stats.FN.present} (${target.stats.FN.percent}%)` },
          { label: "AN Present", value: `${target.stats.AN.present} (${target.stats.AN.percent}%)` },
        ],
        bullets: [
          `FN Absent: ${target.stats.FN.absent}`,
          `AN Absent: ${target.stats.AN.absent}`,
          `Combined records: ${target.combinedTotal}`,
        ],
        info: [
          normalizedQuery.includes("lowest group")
            ? `Lowest among ${rankedGroups.length} groups today.`
            : `Highest among ${rankedGroups.length} groups today.`,
        ],
        detailTitle: "Snapshot",
      });
    }

    return buildStructuredResponse({
      title: "All Groups Attendance Comparison",
      metrics: [
        { label: "Groups", value: String(rankedGroups.length) },
        { label: "Top Group", value: highestGroup },
        { label: "Lowest Group", value: lowestGroup },
      ],
      info: ["Today's FN and AN attendance is shown separately for each group, sorted by overall attendance."],
      sections: rankedGroups.map((item, index) => ({
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
      })),
      detailTitle: "Group Comparison",
    });
  }

  if (
    normalizedQuery.includes("percentage") ||
    /attendance of/i.test(normalizedQuery) ||
    /show .+ attendance/i.test(normalizedQuery)
  ) {
    const requestedName = findStudentQueryText(originalQuery) || findStudentQueryText(normalizedQuery);

    if (requestedName && !normalizedQuery.includes("today") && !normalizedQuery.includes("group")) {
      const monthly = await getMonthlySummary({
        collegeId,
        group: effectiveGroup,
        yearOfStudy: requestedYear,
      });
      const matches = monthly.filter((student) =>
        student.name?.toLowerCase().includes(requestedName.toLowerCase())
      );

      if (!matches.length) {
        return `I could not find a student matching "${requestedName}". Try the exact student name.`;
      }

      if (matches.length > 1) {
        return buildStructuredResponse({
          title: "Multiple Students Matched",
          metrics: [{ label: "Matches", value: String(matches.length) }],
          bullets: matches.slice(0, 8).map((student) => `${student.name} (${student.yearOfStudy})`),
          info: ["Please ask again with the exact student name."],
          detailTitle: "Possible Matches",
        });
      }

      const student = matches[0];
      const orderedMonths = sortMonthKeys(Object.keys(student.percentage));
      const recentMonths = orderedMonths.slice(-3);
      const average = computeAveragePercentage(student.percentage);
      const nonZeroMonths = orderedMonths
        .map((monthKey) => ({
          monthKey,
          percentage: Number.parseFloat(student.percentage[monthKey] || "0"),
        }))
        .filter((item) => item.percentage > 0);
      const bestMonth = [...nonZeroMonths].sort((a, b) => b.percentage - a.percentage)[0];
      const weakMonth = [...nonZeroMonths].sort((a, b) => a.percentage - b.percentage)[0];

      return buildStructuredResponse({
        title: `${student.name} Attendance Insight`,
        metrics: [
          { label: "Average", value: `${average.toFixed(1)}%` },
          { label: "Year", value: student.yearOfStudy || "-" },
          { label: "Best Month", value: bestMonth ? `${bestMonth.monthKey} (${bestMonth.percentage.toFixed(1)}%)` : "-" },
          { label: "Lowest Month", value: weakMonth ? `${weakMonth.monthKey} (${weakMonth.percentage.toFixed(1)}%)` : "-" },
        ],
        bullets: recentMonths.map((monthKey) => `${monthKey}: ${student.percentage[monthKey]}%`),
        info: average < threshold ? [`This student is below the ${threshold}% safety threshold.`] : ["This student is currently above the low-attendance threshold."],
        detailTitle: "Recent Months",
      });
    }
  }

  if (normalizedQuery.includes("today") && (normalizedQuery.includes("attendance") || normalizedQuery.includes("show today"))) {
    const stats = await getTodayAttendanceStats(collegeId, new Date(), effectiveGroup);
    const sessionStats = await getTodayAttendanceSessionStats(collegeId, new Date(), effectiveGroup);
    const absentees = await getTodayAbsentees(collegeId, effectiveGroup);
    const fnAbsentees = absentees.status === "success"
      ? absentees.sessionWiseAbsentees.FN || []
      : [];
    const bulletItems = fnAbsentees.slice(0, 10).map((student) => `${student.name} (${student.group})`);

    if (fnAbsentees.length > bulletItems.length) {
      bulletItems.push(`and ${fnAbsentees.length - bulletItems.length} more`);
    }

    return buildStructuredResponse({
      title: effectiveGroup ? `Today's Attendance Summary - ${effectiveGroup}` : "Today's Attendance Summary",
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
      info: [
        ...(effectiveGroup ? [`Scope: ${effectiveGroup}`] : []),
        ...(fnAbsentees.length === 0 ? ["No absentees data available."] : []),
      ],
      detailTitle: "Today's Absentees",
    });
  }

  if (normalizedQuery.includes("absent") || normalizedQuery.includes("who is absent")) {
    const absentees = await getTodayAbsentees(collegeId, effectiveGroup);
    const sessionStats = await getTodayAttendanceSessionStats(collegeId, new Date(), effectiveGroup);

    if (absentees.status === "no-data") {
      return absentees.message;
    }

    const fnItems = absentees.sessionWiseAbsentees.FN
      .slice(0, 8)
      .map((student) => `FN: ${student.name} (${student.group}, ${student.yearOfStudy})`);
    const anItems = absentees.sessionWiseAbsentees.AN
      .slice(0, 8)
      .map((student) => `AN: ${student.name} (${student.group}, ${student.yearOfStudy})`);

    return buildStructuredResponse({
      title: effectiveGroup ? `Today's Absentees - ${effectiveGroup}` : "Today's Absentees",
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

  if (normalizedQuery.includes("low") || normalizedQuery.includes("<75") || normalizedQuery.includes("poor")) {
    const monthly = await getMonthlySummary({
      collegeId,
      group: effectiveGroup,
      yearOfStudy: requestedYear,
    });
    const lowAttendance = monthly
      .map((student) => ({
        ...student,
        average: computeAveragePercentage(student.percentage),
      }))
      .filter((student) => student.average > 0 && student.average < threshold)
      .sort((a, b) => a.average - b.average)
      .slice(0, resultLimit);

    if (!lowAttendance.length) {
      return `Great news! No students are below ${threshold}% attendance${effectiveGroup ? ` in ${effectiveGroup}` : ""}${requestedYear ? ` for ${requestedYear}` : ""}.`;
    }

    return buildStructuredResponse({
      title: effectiveGroup ? `Students Below ${threshold}% in ${effectiveGroup}` : `Students Below ${threshold}% Attendance`,
      metrics: [
        { label: "Threshold", value: `<${threshold}%` },
        { label: "Students", value: String(lowAttendance.length) },
        { label: "Focus", value: requestedYear || "All Years" },
      ],
      bullets: lowAttendance.map((student) => {
        const recentMonths = sortMonthKeys(Object.keys(student.percentage)).slice(-2);
        const recentSnippet = recentMonths
          .map((monthKey) => `${monthKey}: ${student.percentage[monthKey]}%`)
          .join(", ");
        return `${student.name} - Avg ${student.average.toFixed(1)}% (${student.yearOfStudy})${recentSnippet ? ` | ${recentSnippet}` : ""}`;
      }),
      info: ["Students are sorted from lowest average attendance upward."],
      detailTitle: "At-Risk Students",
    });
  }

  if (normalizedQuery.includes("monthly") || normalizedQuery.includes("month")) {
    const monthly = await getMonthlySummary({
      collegeId,
      group: effectiveGroup,
      yearOfStudy: requestedYear,
    });

    if (!monthly.length) return "No monthly data available.";

    const recentMonths = sortMonthKeys(
      Array.from(new Set(monthly.flatMap((student) => Object.keys(student.percentage))))
    ).slice(-3);

    const monthMetrics = recentMonths
      .map((monthKey) => {
        const monthData = monthly
          .map((student) => parseFloat(student.percentage[monthKey] || "0"))
          .filter((value) => value > 0);

        if (!monthData.length) {
          return null;
        }

        const average = monthData.reduce((sum, value) => sum + value, 0) / monthData.length;
        return {
          label: monthKey,
          value: `${average.toFixed(1)}% avg (${monthData.length})`,
        };
      })
      .filter(Boolean);

    const rankedStudents = monthly
      .map((student) => ({
        ...student,
        average: computeAveragePercentage(student.percentage),
      }))
      .filter((student) => student.average > 0)
      .sort((a, b) => b.average - a.average);

    return buildStructuredResponse({
      title: effectiveGroup ? `Recent Monthly Summary - ${effectiveGroup}` : "Recent Monthly Summary",
      metrics: [
        ...monthMetrics,
        { label: "Top Avg", value: rankedStudents[0] ? `${rankedStudents[0].name} (${rankedStudents[0].average.toFixed(1)}%)` : "-" },
        { label: "Focus", value: requestedYear || "All Years" },
      ],
      bullets: rankedStudents.slice(0, 5).map((student) => `${student.name} - ${student.average.toFixed(1)}% average (${student.yearOfStudy})`),
      info: ["Last 3 months average attendance overview."],
      detailTitle: "Strong Performers",
    });
  }

  if (effectiveGroup && normalizedQuery.includes("group") && (normalizedQuery.includes("attendance") || normalizedQuery.includes("show") || normalizedQuery.includes("today"))) {
    const todayList = await getTodayAttendanceList(collegeId, new Date(), effectiveGroup);
    if (todayList[effectiveGroup]) {
      const groupData = todayList[effectiveGroup];
      const totalGroup = groupData.Present.length + groupData.Absent.length;
      const presentGroup = groupData.Present.length;
      const percentGroup = totalGroup > 0 ? Math.round((presentGroup / totalGroup) * 100) : 0;

      return buildStructuredResponse({
        title: `${effectiveGroup} Group Attendance Today`,
        metrics: [
          { label: "Present", value: `${presentGroup} (${percentGroup}%)` },
          { label: "Absent", value: String(groupData.Absent.length) },
          { label: "Total", value: String(totalGroup) },
        ],
        bullets: groupData.Absent.slice(0, 5).map((student) => student.name),
        info: groupData.Absent.length > 0 ? [] : ["No absentees today!"],
        detailTitle: "Absentees",
      });
    }

    return `No attendance data found for ${effectiveGroup} group today.`;
  }

  return `Supported Queries:
- "Show today attendance"
- "Who is absent today?"
- "Which group is lowest today?"
- "List students below 70% attendance"
- "Show monthly report for first year"
- "Attendance percentage of [student name]"
- "Show BiPC attendance today"

Try one of these!`;
}
