"use client";

import React from "react";

import useSWR from "swr";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
} from "lucide-react";
import { getGroupTheme } from "@/components/dashboard/groupTheme";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

const years = ["First Year", "Second Year"];
const sessions = ["FN", "AN"];

const fetcher = url => fetch(url).then(res => res.json());

export default function GroupAttendanceCard({ groupName }) {
  const normalizedGroupName = normalizeAttendanceGroup(groupName);
  const theme = getGroupTheme(normalizedGroupName);
  const { data: absApiData } = useSWR("/api/attendance/today-absentees", fetcher);
  const sessionWisePresent = absApiData?.sessionWisePresent || {};
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {};

  const { data: studentsData } = useSWR(
    `/api/students?group=${encodeURIComponent(normalizedGroupName)}&limit=1`,
    fetcher
  );
  const groupStrength = studentsData?.totalStudents || 0;

  function stats(year, session) {
    const present =
      sessionWisePresent[session]?.filter(
        student => normalizeAttendanceGroup(student.group) === normalizedGroupName && student.yearOfStudy === year
      ).length || 0;
    const absent =
      sessionWiseAbsentees[session]?.filter(
        student => normalizeAttendanceGroup(student.group) === normalizedGroupName && student.yearOfStudy === year
      ).length || 0;
    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return { present, absent, total, percent };
  }

  const sessionSummary = sessions.map(session => {
    const firstYear = stats("First Year", session);
    const secondYear = stats("Second Year", session);
    const present = firstYear.present + secondYear.present;
    const absent = firstYear.absent + secondYear.absent;
    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return { session, present, absent, total, percent };
  });

  const overallPresent = sessionSummary.reduce((sum, item) => sum + item.present, 0);
  const overallAbsent = sessionSummary.reduce((sum, item) => sum + item.absent, 0);
  const overallTotal = overallPresent + overallAbsent;
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              <Activity className="h-4 w-4" />
              Group Snapshot
            </div>
            <h3 className="mt-3 text-xl font-black tracking-tight">{normalizedGroupName}</h3>
            <p className="mt-1 text-sm text-white/80">
              Direct session matrix for both years.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-2 2xl:grid-cols-4">
            <TopStat icon={<Users className="h-4 w-4" />} label="S" value={groupStrength} />
            <TopStat icon={<CheckCircle2 className="h-4 w-4" />} label="P" value={overallPresent} />
            <TopStat icon={<XCircle className="h-4 w-4" />} label="A" value={overallAbsent} />
            <TopStat icon={<Clock3 className="h-4 w-4" />} label="Average" value={`${overallPercent}%`} />
          </div>
        </div>
      </div>

      <div className={`space-y-5 bg-linear-to-br ${theme.soft} p-4 md:p-5`}>
        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {sessionSummary.map(item => (
            <div key={item.session} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Session
                  </p>
                  <h4 className="mt-1 text-lg font-bold text-slate-900">{item.session}</h4>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${theme.pill}`}>
                  {item.percent}%
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <MiniBox label="P" value={item.present} tone="emerald" />
                <MiniBox label="A" value={item.absent} tone="rose" />
                <MiniBox label="T" value={item.total} tone="slate" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-4">
            <h4 className="text-lg font-bold text-slate-900">Year-wise Session Matrix</h4>
            <p className="text-sm text-slate-500">Present, absent, total and percentage in one view.</p>
          </div>

          <div className="grid gap-4 p-4 2xl:hidden">
            {years.map(year => (
              <article key={year} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h5 className="text-base font-bold text-slate-900">{year}</h5>
                <div className="mt-3 grid gap-3">
                  {sessions.map(session => {
                    const current = stats(year, session);
                    return (
                      <div key={`${year}-${session}`} className="rounded-2xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-900">{session}</span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${theme.pill}`}>
                            {current.percent}%
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <MiniBox label="P" value={current.present} tone="emerald" />
                          <MiniBox label="A" value={current.absent} tone="rose" />
                          <MiniBox label="T" value={current.total} tone="slate" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto 2xl:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="border border-slate-700 px-4 py-3 text-left">Year</th>
                  <th className="border border-slate-700 px-4 py-3 text-left">Metric</th>
                  {sessions.map(session => (
                    <th key={session} className="border border-slate-700 px-4 py-3 text-center">
                      {session}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  <React.Fragment key={year}>
                    <tr key={`${year}-present`} className="bg-white">
                      <td rowSpan={4} className="border border-slate-200 px-4 py-3 font-bold text-slate-900 align-top">
                        {year}
                      </td>
                      <td className="border border-slate-200 px-4 py-3 font-medium text-emerald-700">
                        P
                      </td>
                      {sessions.map(session => (
                        <td key={`${year}-${session}-present`} className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-900">
                          {stats(year, session).present}
                        </td>
                      ))}
                    </tr>
                    <tr key={`${year}-absent`} className="bg-slate-50">
                      <td className="border border-slate-200 px-4 py-3 font-medium text-rose-700">
                        A
                      </td>
                      {sessions.map(session => (
                        <td key={`${year}-${session}-absent`} className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-900">
                          {stats(year, session).absent}
                        </td>
                      ))}
                    </tr>
                    <tr key={`${year}-total`} className="bg-white">
                      <td className="border border-slate-200 px-4 py-3 font-medium text-slate-700">
                        T
                      </td>
                      {sessions.map(session => (
                        <td key={`${year}-${session}-total`} className="border border-slate-200 px-4 py-3 text-center font-semibold text-slate-900">
                          {stats(year, session).total}
                        </td>
                      ))}
                    </tr>
                    <tr key={`${year}-percent`} className="bg-slate-50">
                      <td className="border border-slate-200 px-4 py-3 font-medium text-blue-700">
                         %
                      </td>
                      {sessions.map(session => (
                        <td key={`${year}-${session}-percent`} className="border border-slate-200 px-4 py-3 text-center">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${theme.pill}`}>
                            {stats(year, session).percent}%
                          </span>
                        </td>
                      ))}
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function TopStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-[11px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function MiniBox({ label, value, tone }) {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-100 text-slate-700",
  };

  return (
    <div className={`rounded-2xl border px-3 py-3 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
