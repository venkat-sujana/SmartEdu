"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Printer, Search, Users2 } from "lucide-react";
import { getGroupTheme } from "@/components/dashboard/groupTheme";
import { useSession } from "next-auth/react";

const months = [
  { label: "JUN", year: "2025" },
  { label: "JUL", year: "2025" },
  { label: "AUG", year: "2025" },
  { label: "SEP", year: "2025" },
  { label: "OCT", year: "2025" },
  { label: "NOV", year: "2025" },
  { label: "DEC", year: "2025" },
  { label: "JAN", year: "2026" },
  { label: "FEB", year: "2026" },
  { label: "MAR", year: "2026" },
];

export default function GroupAttendanceSummary({
  group,
  yearOfStudy,
  collegeName,
}) {
  const theme = getGroupTheme(group);
  const [summaryData, setSummaryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    if (!group || !yearOfStudy) return;
    if (!session?.user?.collegeId) return;

    const fetchData = async () => {
      try {
        const url = `/api/attendance/monthly-summary?group=${encodeURIComponent(
          group
        )}&yearOfStudy=${encodeURIComponent(
          yearOfStudy
        )}&collegeId=${session.user.collegeId}`;

        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || data?.error || `Failed: ${res.status}`);
        }

        setSummaryData(data.data || []);
      } catch (error) {
        console.error("Monthly attendance fetch error:", error);
      }
    };

    fetchData();
  }, [group, yearOfStudy, session]);

  const filteredData = useMemo(
    () =>
      summaryData.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, summaryData]
  );

  const summaryStats = useMemo(() => {
    const students = filteredData.length;
    const below75 = filteredData.filter(student => {
      const totalPresent = months.reduce((sum, { label, year }) => {
        const key = `${label}-${year}`;
        return sum + (student.present?.[key] || 0);
      }, 0);
      const totalWorking = months.reduce((sum, { label, year }) => {
        const key = `${label}-${year}`;
        return sum + (student.workingDays?.[key] || 0);
      }, 0);
      return totalWorking > 0 && (totalPresent / totalWorking) * 100 < 75;
    }).length;

    return {
      students,
      safe: Math.max(students - below75, 0),
      below75,
    };
  }, [filteredData]);

  const printAreaId = `print-area-${String(group || "group").replace(/\W+/g, "-")}-${String(
    yearOfStudy || "year"
  ).replace(/\W+/g, "-")}`;

  const handlePrint = () => {
    const printContent = document.getElementById(printAreaId)?.innerHTML || "";
    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${collegeName} - ${group} Attendance</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
            th { background-color: #166534; color: white; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!group || !yearOfStudy) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Select group and year to view monthly attendance.
      </div>
    );
  }

  return (
    <section className={`overflow-hidden rounded-3xl border ${theme.softBorder} bg-white shadow-sm`}>
      <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <Users2 className="h-4 w-4" />
              Monthly Attendance
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              {group} - {yearOfStudy}
            </h2>
            <p className="mt-1 text-sm text-emerald-50">{collegeName}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Students" value={summaryStats.students} />
            <StatCard label="Eligible" value={summaryStats.safe} />
            <StatCard label="Below 75%" value={summaryStats.below75} />
          </div>
        </div>
      </div>

      <div className={`space-y-4 bg-linear-to-br ${theme.soft} p-4 md:p-5`}>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </label>

          <button
            onClick={handlePrint}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition`}
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        <div id={printAreaId} className="space-y-4">
          <div className="hidden text-center text-xl font-bold text-slate-900 print:block">
            {collegeName}
            <br />
            Central Attendance Register - {yearOfStudy} ({group})
          </div>

          {filteredData.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-16 text-center">
              <p className="text-base font-semibold text-slate-700">No data found</p>
              <p className="mt-1 text-sm text-slate-500">
                Search term మార్చి మళ్లీ చూడండి.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 lg:hidden">
                {filteredData.map((student, index) => {
                  const computed = getStudentTotals(student);

                  return (
                    <article
                      key={`${student.name}-${index}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            #{index + 1}
                          </p>
                          <h3 className="truncate text-base font-bold text-slate-900">
                            {student.name}
                          </h3>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            computed.isEligible
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {computed.isEligible ? "Eligible" : "Not Eligible"}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <MiniStat label="Working Days" value={computed.totalWorking} />
                        <MiniStat label="Present Days" value={computed.totalPresent} />
                        <MiniStat label="Overall %" value={`${computed.overallPercent}%`} />
                        <MiniStat
                          label="Shortage"
                          value={
                            computed.isEligible ? "No shortage" : `${computed.shortage} Days`
                          }
                        />
                      </div>

                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <div className="grid grid-cols-4 bg-slate-900 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white">
                          <span>Month</span>
                          <span className="text-center">Working</span>
                          <span className="text-center">Present</span>
                          <span className="text-center">%</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {months.map(({ label, year }) => {
                            const key = `${label}-${year}`;
                            const present = student.present?.[key] || 0;
                            const total = student.workingDays?.[key] || 0;
                            const percent =
                              total > 0 ? ((present / total) * 100).toFixed(0) : "-";
                            const low = total > 0 && Number(percent) < 75;

                            return (
                              <div
                                key={key}
                                className="grid grid-cols-4 px-3 py-2 text-sm text-slate-700"
                              >
                                <span className="font-semibold text-slate-900">{label}</span>
                                <span className="text-center">{total}</span>
                                <span className="text-center">{present}</span>
                                <span
                                  className={`text-center font-semibold ${
                                    low ? "text-rose-600" : "text-slate-700"
                                  }`}
                                >
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-slate-200 lg:block">
                <div className="overflow-x-auto">
                  <table className="min-w-[1280px] border-collapse text-sm">
                    <thead className="bg-slate-900 text-xs uppercase tracking-wide text-white">
                      <tr>
                        <th className="w-16 border border-slate-700 px-3 py-3 text-center">
                          S.No
                        </th>
                        <th className="sticky left-0 z-10 min-w-[220px] border border-slate-700 bg-slate-900 px-4 py-3 text-left">
                          Student Name
                        </th>
                        {months.map(({ label }) => (
                          <th
                            key={label}
                            className="w-20 border border-slate-700 px-2 py-3 text-center"
                          >
                            {label}
                          </th>
                        ))}
                        <th className="w-20 border border-slate-700 px-2 py-3 text-center">
                          Total
                        </th>
                        <th className="w-28 border border-slate-700 px-2 py-3 text-center">
                          Shortage
                        </th>
                        <th className="w-32 border border-slate-700 px-2 py-3 text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((student, index) => {
                        const computed = getStudentTotals(student);

                        return (
                          <React.Fragment key={`${student.name}-${index}`}>
                            <tr className="bg-slate-100 font-semibold text-slate-800">
                              <td className="border border-slate-200 text-center" />
                              <td className="sticky left-0 border border-slate-200 bg-slate-100 px-4 py-2">
                                Working Days
                              </td>
                              {months.map(({ label, year }) => {
                                const key = `${label}-${year}`;
                                return (
                                  <td
                                    key={key}
                                    className="border border-slate-200 px-2 py-2 text-center font-medium"
                                  >
                                    {student.workingDays?.[key] || 0}
                                  </td>
                                );
                              })}
                              <td className="border border-slate-200 px-2 py-2 text-center font-bold">
                                {computed.totalWorking}
                              </td>
                              <td className="border border-slate-200" />
                              <td className="border border-slate-200" />
                            </tr>

                            <tr className="bg-white">
                              <td className="border border-slate-200 px-3 py-2 text-center font-semibold">
                                {index + 1}
                              </td>
                              <td className="sticky left-0 border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900">
                                {student.name}
                              </td>
                              {months.map(({ label, year }) => {
                                const key = `${label}-${year}`;
                                return (
                                  <td
                                    key={key}
                                    className="border border-slate-200 px-2 py-2 text-center"
                                  >
                                    {student.present?.[key] || 0}
                                  </td>
                                );
                              })}
                              <td className="border border-slate-200 px-2 py-2 text-center font-bold">
                                {computed.totalPresent}
                              </td>
                              <td className="border border-slate-200" />
                              <td className="border border-slate-200" />
                            </tr>

                            <tr className="bg-emerald-50 font-semibold text-slate-800">
                              <td className="border border-slate-200 text-center" />
                              <td className="sticky left-0 border border-slate-200 bg-emerald-50 px-4 py-2">
                                Percentage
                              </td>
                              {months.map(({ label, year }) => {
                                const key = `${label}-${year}`;
                                const present = student.present?.[key] || 0;
                                const total = student.workingDays?.[key] || 0;
                                const percent =
                                  total > 0 ? ((present / total) * 100).toFixed(0) : "-";
                                const low = total > 0 && Number(percent) < 75;

                                return (
                                  <td
                                    key={key}
                                    className={`border border-slate-200 px-2 py-2 text-center ${
                                      low ? "font-bold text-rose-600" : ""
                                    }`}
                                  >
                                    {percent}%
                                  </td>
                                );
                              })}
                              <td className="border border-slate-200 px-2 py-2 text-center font-bold">
                                {computed.overallPercent}%
                              </td>
                              <td className="border border-slate-200 px-2 py-2 text-center">
                                {computed.isEligible ? (
                                  <span className="text-emerald-700">No shortage</span>
                                ) : (
                                  <span className="font-bold text-rose-600">
                                    {computed.shortage} Days
                                  </span>
                                )}
                              </td>
                              <td className="border border-slate-200 px-2 py-2 text-center">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    computed.isEligible
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-rose-100 text-rose-700"
                                  }`}
                                >
                                  {computed.isEligible ? "Eligible" : "Not Eligible"}
                                </span>
                              </td>
                            </tr>

                            <tr>
                              <td colSpan={months.length + 6} className="h-3 bg-white" />
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function getStudentTotals(student) {
  const totalPresent = months.reduce((sum, { label, year }) => {
    const key = `${label}-${year}`;
    return sum + (student.present?.[key] || 0);
  }, 0);

  const totalWorking = months.reduce((sum, { label, year }) => {
    const key = `${label}-${year}`;
    return sum + (student.workingDays?.[key] || 0);
  }, 0);

  const overallPercent =
    totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(0) : "0";
  const requiredDays = Math.ceil(totalWorking * 0.75);
  const shortage = Math.max(requiredDays - totalPresent, 0);
  const isEligible = Number(overallPercent) >= 75;

  return {
    totalPresent,
    totalWorking,
    overallPercent,
    shortage,
    isEligible,
  };
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-emerald-50">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
