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








function StatCard({ icon: Icon, label, value, hint, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-700",
    blue: "border-blue-100 bg-blue-50/70 text-blue-700",
    amber: "border-amber-100 bg-amber-50/70 text-amber-700",
    emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
    rose: "border-rose-100 bg-rose-50/70 text-rose-700",
    violet: "border-violet-100 bg-violet-50/70 text-violet-700",
  };

  return (
    <div className={`rounded-xl border px-3 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:px-3.5 ${tones[tone] || tones.slate}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px]">
          {label}
        </p>
        <div className="shrink-0 rounded-lg bg-white/80 p-1.5 shadow-sm">
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <p className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{value}</p>
        <p className="hidden text-[10px] text-slate-500 sm:block">{hint}</p>
      </div>
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
      const uniqueStudents = new Set();
      let attended = 0;
      let absent = 0;
      let pass = 0;
      let fail = 0;

      rows.forEach((row) => {
        const studentKey = getStudentKey(row);
        if (!studentKey || uniqueStudents.has(studentKey)) return;
        uniqueStudents.add(studentKey);

        if (isReportAbsent(row)) {
          absent += 1;
        } else {
          attended += 1;
          if (isReportPass(row)) pass += 1;
          else fail += 1;
        }
      });

      return {
        year,
        total: uniqueStudents.size,
        attended,
        absent,
        pass,
        fail,
        passRate: attended ? `${((pass / attended) * 100).toFixed(1)}%` : "0.0%",
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
          absentCount: 0,
          passCount: 0,
          failCount: 0,
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

      if (isReportAbsent(row)) {
        grouped[key].absentCount += 1;
      } else {
        grouped[key].attendedStudents += 1;
        if (isReportPass(row)) grouped[key].passCount += 1;
        else grouped[key].failCount += 1;
      }

      grouped[key].sortDate = Math.max(
        grouped[key].sortDate,
        new Date(row.examDate || row.createdAt || Date.now()).getTime()
      );
      grouped[key].date = grouped[key].date === "-" ? dateLabel : grouped[key].date;
    });

    return Object.values(grouped)
      .map((row) => ({
        ...row,
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
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Exam Module</p>
        <h3 className="mt-1 text-xl font-black text-slate-900">{groupName} Exam Output</h3>
        <p className="mt-4 text-sm text-slate-500">No exam records are available for this group yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white/95 p-2.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:p-3 md:space-y-4 md:p-4">
      <div className="flex flex-col gap-2.5 border-b border-slate-200/80 pb-2.5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Exam Module</p>
          <h3 className="mt-0.5 text-lg font-black tracking-tight text-slate-900 sm:text-xl">
            {groupName} Exam Output Dashboard
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Group-wise exam summary, pass rate, and latest result output.
          </p>
        </div>

        <div className="w-full md:w-56">
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
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
<section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">

  <StatCard
    icon={ClipboardList}
    label="Strength"
    value={summary?.strength ?? 0}
    hint="Active Students"
    tone="slate"
  />

  <StatCard
    icon={BarChart3}
    label="Appeared"
    value={summary?.appeared ?? 0}
    hint="Exam Attended"
    tone="blue"
  />

  <StatCard
    icon={BarChart3}
    label="Absent"
    value={summary?.absent ?? 0}
    hint="A / AB"
    tone="amber"
  />

  <StatCard
    icon={TrendingUp}
    label="Pass"
    value={summary?.pass ?? 0}
    hint="Passed Students"
    tone="emerald"
  />

  <StatCard
    icon={TrendingUp}
    label="Fail"
    value={summary?.fail ?? 0}
    hint="Failed Students"
    tone="rose"
  />

  <StatCard
    icon={Medal}
    label="Pass %"
    value={`${summary?.passPercentage ?? 0}%`}
    hint="Overall Result"
    tone="violet"
  />

</section>

      <section className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
        {yearWiseSummary.map((item) => (
          <div
            key={item.year}
            className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-black text-slate-900 sm:text-base">{item.year}</h4>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500 shadow-sm">
                {item.total} students
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-1.5">
              <div className="rounded-lg bg-white px-2 py-2 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Attended</p>
                <p className="mt-0.5 text-base font-black text-blue-700">{item.attended}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Pass</p>
                <p className="mt-0.5 text-base font-black text-emerald-700">{item.pass}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Fail</p>
                <p className="mt-0.5 text-base font-black text-rose-700">{item.fail}</p>
              </div>
              <div className="rounded-lg bg-white px-2 py-2 shadow-sm">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Absent</p>
                <p className="mt-0.5 text-base font-black text-amber-700">{item.absent}</p>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-100 bg-white px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-slate-500">Pass %</span>
              <span className="text-xs font-black text-violet-700">{item.passRate}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 px-3 py-2.5 sm:px-4">
          <div>
            <h4 className="text-sm font-black text-slate-900 sm:text-base">Latest Exam Results</h4>
            <p className="text-[10px] text-slate-500 sm:text-xs">Recent output for {groupName} students</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
            {latestResults.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-500">
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide">Exam</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide">Year</th>
                <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide">Date</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide">Students</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-emerald-700">Pass</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-rose-700">Fail</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-amber-700">Absent</th>
                <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wide text-violet-700">Pass %</th>
              </tr>
            </thead>
            <tbody>
              {latestResults.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-xs text-slate-500">
                    No exam results available.
                  </td>
                </tr>
              ) : (
                latestResults.map((row) => (
                  <tr
                    key={`${row.examType}_${row.academicYear}_${row.yearOfStudy}`}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-3 py-2.5 font-bold text-slate-900">{formatExamLabel(row.examType)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.yearOfStudy}</td>
                    <td className="px-3 py-2.5 text-slate-600">{row.date}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{row.totalStudents}</td>
                    <td className="px-3 py-2.5 text-right font-black text-emerald-700">{row.passCount}</td>
                    <td className="px-3 py-2.5 text-right font-black text-rose-700">{row.failCount}</td>
                    <td className="px-3 py-2.5 text-right font-black text-amber-700">{row.absentCount}</td>
                    <td className="px-3 py-2.5 text-right font-black text-violet-700">{row.passRate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-black text-slate-900 sm:text-base">Students Needing Attention</h4>
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