"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

export default function AttendanceCards({ collegeId }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!collegeId) return;

      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/today-list?collegeId=${collegeId}`);
        const json = await res.json();
        setAttendanceData(json.data || {});
      } catch (error) {
        console.error("Attendance cards fetch error:", error);
        setAttendanceData({});
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [collegeId]);

  const cards = useMemo(() => {
    const yearWise = {};

    for (const group in attendanceData || {}) {
      ["Present", "Absent"].forEach(status => {
        (attendanceData[group]?.[status] || []).forEach(student => {
          const year = student.year;
          if (!yearWise[year]) yearWise[year] = {};
          if (!yearWise[year][group]) {
            yearWise[year][group] = { Present: [], Absent: [] };
          }

          yearWise[year][group][status].push(student.name);
        });
      });
    }

    return Object.entries(yearWise).flatMap(([year, groups]) =>
      Object.entries(groups).map(([group, statuses]) => ({
        year,
        group,
        statuses,
      }))
    );
  }, [attendanceData]);

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-12 text-sm font-medium text-slate-500 shadow-sm">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
      {cards.map(card => (
        <article
          key={`${card.year}-${card.group}`}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="bg-linear-to-r from-indigo-700 via-blue-700 to-cyan-600 px-5 py-4 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  Today
                </p>
                <h2 className="mt-2 text-xl font-black tracking-tight">
                  {card.group} - {card.year}
                </h2>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
                <p className="text-[11px] uppercase tracking-wide text-white/70">Total</p>
                <p className="mt-1 text-xl font-bold">
                  {card.statuses.Present.length + card.statuses.Absent.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-2 md:p-5">
            <StatusList
              title="Present"
              items={card.statuses.Present}
              tone="emerald"
              icon={<CheckCircle2 className="h-4 w-4" />}
            />
            <StatusList
              title="Absent"
              items={card.statuses.Absent}
              tone="rose"
              icon={<XCircle className="h-4 w-4" />}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function StatusList({ title, items, tone, icon }) {
  const toneMap = {
    emerald: {
      shell: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
    },
    rose: {
      shell: "border-rose-200 bg-rose-50",
      text: "text-rose-700",
    },
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone].shell}`}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${toneMap[tone].text}`}>
        {icon}
        {title} ({items.length})
      </div>

      {items.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {items.map((name, index) => (
            <li key={`${name}-${index}`} className="rounded-xl bg-white px-3 py-2 shadow-sm">
              {name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No students in this list.</p>
      )}
    </div>
  );
}
