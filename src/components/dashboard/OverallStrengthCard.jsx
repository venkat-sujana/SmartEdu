"use client";

import {
  Activity,
  CheckCircle2,
  UsersRound,
  XCircle,
} from "lucide-react";

export default function OverallStrengthCard({
  sessionWisePresent,
  sessionWiseAbsentees,
}) {
  const sessions = ["FN", "AN"];

  function sessionStats(session) {
    const present = sessionWisePresent[session]?.length || 0;
    const absent = sessionWiseAbsentees[session]?.length || 0;
    const strength = present + absent;
    const percent = strength > 0 ? Math.round((present / strength) * 100) : 0;

    return { present, absent, strength, percent };
  }

  const stats = sessions.map(session => ({
    session,
    ...sessionStats(session),
  }));

  const totalStrength = stats.reduce((sum, entry) => sum + entry.strength, 0);
  const totalPresent = stats.reduce((sum, entry) => sum + entry.present, 0);
  const totalAbsent = stats.reduce((sum, entry) => sum + entry.absent, 0);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-indigo-800 via-violet-700 to-fuchsia-700 px-5 py-5 text-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Session Snapshot
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">
              Overall Strength
            </h3>
            <p className="mt-1 text-sm text-violet-100">
              Present, absent, and attendance percentage by session.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryStat label="Strength" value={totalStrength} />
            <SummaryStat label="Present" value={totalPresent} />
            <SummaryStat label="Absent" value={totalAbsent} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:grid-cols-3 md:p-5">
        {stats.map(entry => (
          <article
            key={entry.session}
            className="rounded-3xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Session
                </p>
                <h4 className="mt-1 text-xl font-bold text-slate-900">
                  {entry.session}
                </h4>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <StrengthRow
                icon={<UsersRound className="h-4 w-4" />}
                label="Strength"
                value={entry.strength}
                tone="slate"
              />
              <StrengthRow
                icon={<CheckCircle2 className="h-4 w-4" />}
                label="Present"
                value={entry.present}
                tone="emerald"
              />
              <StrengthRow
                icon={<XCircle className="h-4 w-4" />}
                label="Absent"
                value={entry.absent}
                tone="rose"
              />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Attendance Percentage
              </p>
              <p className="mt-1 text-2xl font-black">{entry.percent}%</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SummaryStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-violet-100">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function StrengthRow({ icon, label, value, tone }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`rounded-xl p-2 ${tones[tone]}`}>{icon}</span>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <span className="text-base font-bold text-slate-900">{value}</span>
    </div>
  );
}
