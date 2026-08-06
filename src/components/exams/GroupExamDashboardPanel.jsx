//src/components/exams/GroupExamDashboardPanel.jsx
"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { BarChart3, ClipboardList, Medal, TrendingUp } from "lucide-react";
import {
  isReportAbsent,
  isReportPass,
} from "@/lib/examUtils";

const fetcher = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch exam data");
  }
  return response.json();
};

const UNIT_EXAMS = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];

function normalizeExamStream(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalized) return "";
  if (normalized === "BIPC") return "BIPC";
  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";
  if (normalized === "M&AT" || normalized === "M@AT" || normalized === "MANDAT") {
    return "M&AT";
  }

  return String(value || "").trim();
}

function formatExamLabel(value) {
  return String(value || "")
    .replace("HALFYEARLY", "Half Yearly")
    .replace("QUARTERLY", "Quarterly")
    .replace("PRE-PUBLIC-1", "Pre-Public - 1")
    .replace("PRE-PUBLIC-2", "Pre-Public - 2")
    .replace("UNIT-", "Unit - ");
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-CA");
}

function normalizeAcademicYear(value) {
  return String(value || "").trim().toUpperCase();
}

function normalizeYearOfStudy(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "first year" || normalized === "1st year" || normalized === "1 year") {
    return "First Year";
  }
  if (normalized === "second year" || normalized === "2nd year" || normalized === "2 year") {
    return "Second Year";
  }
  return String(value || "").trim();
}

function getExamEventKey(report) {
  return [
    String(report?.examType || "").trim().toUpperCase(),
    normalizeAcademicYear(report?.academicYear),
    normalizeYearOfStudy(report?.yearOfStudy),
  ]
    .filter(Boolean)
    .join("_");
}

function getStudentKey(report) {
  return String(report?.studentId?._id || report?.studentId || report?.student?._id || report?._id || "");
}








function getAveragePercentage(rows) {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + Number(row.percentage || 0), 0);
  return Number((total / rows.length).toFixed(1));
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function GroupExamDashboardPanel({ groupName }) {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("all");
  const normalizedGroup = normalizeExamStream(groupName);

  const { data, error, isLoading } = useSWR(
  `/api/exams?stream=${encodeURIComponent(normalizedGroup)}`,
  fetcher
);

// ⭐ NEW
const summaryUrl = `/api/exams/summary?stream=${encodeURIComponent(
  normalizedGroup
)}${
  selectedAcademicYear !== "all"
    ? `&academicYear=${encodeURIComponent(selectedAcademicYear)}`
    : ""
}`;

const {
  data: summaryData,
  error: summaryError,
  isLoading: summaryLoading,
} = useSWR(summaryUrl, fetcher);

const summary = summaryData?.summary;

  

  const reports = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const academicYearOptions = useMemo(() => {
    const options = Array.from(new Set(reports.map((row) => row.academicYear).filter(Boolean))).sort((a, b) =>
      b.localeCompare(a)
    );
    return ["all", ...options];
  }, [reports]);

  const filteredReports = useMemo(() => {
    if (selectedAcademicYear === "all") return reports;
    return reports.filter((row) => row.academicYear === selectedAcademicYear);
  }, [reports, selectedAcademicYear]);

  

  const yearWiseSummary = useMemo(() => {
    return ["First Year", "Second Year"].map((year) => {
      const rows = filteredReports.filter((row) => normalizeYearOfStudy(row.yearOfStudy) === year);
      const attendedRows = rows.filter((row) => !isReportAbsent(row));
      const passCount = attendedRows.filter(isReportPass).length;
      return {
        year,
        total: rows.length,
        average: `${getAveragePercentage(rows).toFixed(1)}%`,
        passRate: attendedRows.length ? `${((passCount / attendedRows.length) * 100).toFixed(1)}%` : "0.0%",
      };
    });
  }, [filteredReports]);

  const latestResults = useMemo(() => {
    const grouped = {};

    filteredReports.forEach((row) => {
      const dateLabel = formatDate(row.examDate);
      const key = getExamEventKey(row);

      if (!grouped[key]) {
        grouped[key] = {
          examType: row.examType,
          academicYear: normalizeAcademicYear(row.academicYear) || "-",
          yearOfStudy: normalizeYearOfStudy(row.yearOfStudy) || "-",
          date: dateLabel,
          totalStudents: 0,
          attendedStudents: 0,
          passCount: 0,
          percentages: [],
          sortDate: new Date(row.examDate || row.createdAt || Date.now()).getTime(),
          studentKeys: new Set(),
        };
      }

      const studentKey = getStudentKey(row);
      if (!studentKey || grouped[key].studentKeys.has(studentKey)) {
        grouped[key].sortDate = Math.max(
          grouped[key].sortDate,
          new Date(row.examDate || row.createdAt || Date.now()).getTime()
        );
        grouped[key].date = grouped[key].date === "-" ? dateLabel : grouped[key].date;
        return;
      }

      grouped[key].studentKeys.add(studentKey);
      grouped[key].totalStudents += 1;
      if (!isReportAbsent(row)) {
        grouped[key].attendedStudents += 1;
        if (isReportPass(row)) grouped[key].passCount += 1;
      }
      grouped[key].percentages.push(Number(row.percentage || 0));
      grouped[key].sortDate = Math.max(
        grouped[key].sortDate,
        new Date(row.examDate || row.createdAt || Date.now()).getTime()
      );
      grouped[key].date = grouped[key].date === "-" ? dateLabel : grouped[key].date;
    });

    return Object.values(grouped)
      .map((row) => ({
        ...row,
        averagePercentage: row.percentages.length
          ? `${(row.percentages.reduce((sum, value) => sum + value, 0) / row.percentages.length).toFixed(1)}%`
          : "0.0%",
        passRate: row.attendedStudents
          ? `${((row.passCount / row.attendedStudents) * 100).toFixed(1)}%`
          : "0.0%",
        date: formatDate(row.sortDate),
      }))
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 8);
  }, [filteredReports]);

  const strugglingStudents = useMemo(() => {
    return filteredReports
      .filter((row) => !isReportAbsent(row) && !isReportPass(row))
      .map((row) => ({
        id: row._id,
        studentName: row?.student?.name || row?.studentId?.name || "Unknown",
        examType: formatExamLabel(row.examType),
        yearOfStudy: row.yearOfStudy || "-",
        percentage: Number(row.percentage || 0),
      }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 6);
  }, [filteredReports]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Loading exam dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
        Exam data failed to load. Please try again.
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exam Module</p>
        <h3 className="mt-1 text-xl font-black text-slate-900">{groupName} Exam Output</h3>
        <p className="mt-4 text-sm text-slate-500">No exam records are available for this group yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl bg-white/95 p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exam Module</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
            {groupName} Exam Output Dashboard
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Group-wise exam summary, pass rate, and latest result output.
          </p>
        </div>

        <div className="w-full md:w-72">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Academic Year
          </label>
          <select
            value={selectedAcademicYear}
            onChange={(event) => setSelectedAcademicYear(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-500"
          >
            {academicYearOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All Academic Years" : option}
              </option>
            ))}
          </select>
        </div>
      </div>
<section className="grid grid-cols-2 gap-4 xl:grid-cols-6">

  <StatCard
    icon={ClipboardList}
    label="Strength"
    value={summary?.strength ?? 0}
    hint="Active Students"
  />

  <StatCard
    icon={BarChart3}
    label="Appeared"
    value={summary?.appeared ?? 0}
    hint="Exam Attended"
  />

  <StatCard
    icon={BarChart3}
    label="Absent"
    value={summary?.absent ?? 0}
    hint="A / AB"
  />

  <StatCard
    icon={TrendingUp}
    label="Pass"
    value={summary?.pass ?? 0}
    hint="Passed Students"
  />

  <StatCard
    icon={TrendingUp}
    label="Fail"
    value={summary?.fail ?? 0}
    hint="Failed Students"
  />

  <StatCard
    icon={Medal}
    label="Pass %"
    value={`${summary?.passPercentage ?? 0}%`}
    hint="Overall Result"
  />

</section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {yearWiseSummary.map((item) => (
          <div key={item.year} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-lg font-bold text-slate-900">{item.year}</h4>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                {item.total} records
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Average</p>
                <p className="mt-1 text-xl font-black text-slate-900">{item.average}</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500">Pass Rate</p>
                <p className="mt-1 text-xl font-black text-slate-900">{item.passRate}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Latest Exam Results</h4>
            <p className="text-xs text-slate-500">Recent output for {groupName} students</p>
          </div>
          <span className="text-xs font-medium text-slate-500">{latestResults.length} rows</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="px-4 py-3 text-left font-semibold">Exam</th>
                <th className="px-4 py-3 text-left font-semibold">Year</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Students</th>
                <th className="px-4 py-3 text-left font-semibold">Avg %</th>
                <th className="px-4 py-3 text-left font-semibold">Pass %</th>
              </tr>
            </thead>
            <tbody>
              {latestResults.map((row) => (
                <tr key={`${row.examType}_${row.academicYear}_${row.yearOfStudy}`} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatExamLabel(row.examType)}</td>
                  <td className="px-4 py-3 text-slate-700">{row.yearOfStudy}</td>
                  <td className="px-4 py-3 text-slate-700">{row.date}</td>
                  <td className="px-4 py-3 text-slate-700">{row.totalStudents}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.averagePercentage}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{row.passRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Students Needing Attention</h4>
            <p className="text-xs text-slate-500">Lowest recent exam outcomes in this dashboard</p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
            {strugglingStudents.length} students
          </span>
        </div>

        {strugglingStudents.length === 0 ? (
          <p className="mt-4 text-sm text-emerald-700">No failing records found for the selected filters.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {strugglingStudents.map((student) => (
              <div key={student.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-900">{student.studentName}</p>
                <p className="mt-1 text-xs text-slate-500">{student.yearOfStudy}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{student.examType}</span>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    {student.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
