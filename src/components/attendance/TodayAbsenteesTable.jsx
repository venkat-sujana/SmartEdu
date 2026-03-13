"use client";

import { useEffect, useMemo, useState } from "react";
import { getGroupTheme } from "@/components/dashboard/groupTheme";
import {
  AlertTriangle,
  Clock3,
  Users,
  UserCheck,
} from "lucide-react";

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
  EN: "Evening",
};

const yearOptions = ["First Year", "Second Year"];

export default function TodayAbsenteesTable({
  collegeId,
  header = true,
  groupFilter = null,
}) {
  const theme = getGroupTheme(groupFilter);
  const [loading, setLoading] = useState(true);
  const [absData, setAbsData] = useState(null);

  useEffect(() => {
    const fetchAbsentees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/today-absentees`);
        const json = await res.json();
        setAbsData(json);
      } catch (error) {
        console.error("Today absentees fetch error:", error);
        setAbsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsentees();
  }, [collegeId]);

  const formatTime = timestamp => {
    if (!timestamp) return "-";

    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const preparedSessions = useMemo(() => {
    if (!absData || absData.status !== "success") return [];

    const { sessionWiseAbsentees = {}, sessionWisePresent = {}, sessions = [] } = absData;

    return sessions.map(sessionKey => {
      const yearBuckets = yearOptions.map(yearKey => {
        let yearStudents =
          sessionWiseAbsentees[sessionKey]?.filter(
            student => student.yearOfStudy === yearKey
          ) || [];

        if (groupFilter) {
          yearStudents = yearStudents.filter(student => student.group === groupFilter);
        }

        const fnPresentNames = new Set(
          (sessionWisePresent?.FN || [])
            .filter(student => student.yearOfStudy === yearKey)
            .map(student => student.name)
        );

        const groups = [...new Set(yearStudents.map(student => student.group))].map(
          groupName => {
            const groupList = yearStudents.filter(student => student.group === groupName);
            const lecturerName = groupList[0]?.lecturerName || "-";
            const markedAt = groupList[0]?.markedAt || null;

            return {
              groupName,
              lecturerName,
              markedAt,
              students: groupList.map(student => ({
                ...student,
                highlightRed:
                  sessionKey === "AN" && fnPresentNames.has(student.name),
              })),
            };
          }
        );

        return {
          yearKey,
          groups,
          totalAbsentees: yearStudents.length,
        };
      });

      const totalAbsentees = yearBuckets.reduce(
        (sum, yearBucket) => sum + yearBucket.totalAbsentees,
        0
      );
      const totalPresent = groupFilter
        ? (sessionWisePresent[sessionKey] || []).filter(
            student => student.group === groupFilter
          ).length
        : (sessionWisePresent[sessionKey] || []).length;

      return {
        sessionKey,
        totalAbsentees,
        totalPresent,
        yearBuckets,
      };
    });
  }, [absData, groupFilter]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-16">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  if (!absData || absData.status !== "success") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-12 text-center">
        <p className="text-lg font-bold text-rose-700">No attendance recorded today.</p>
      </div>
    );
  }

  return (
    <section className="mx-auto my-6 w-full max-w-6xl space-y-5">
      {header && (
        <div className="overflow-hidden rounded-3xl border border-cyan-200 bg-white shadow-sm">
          <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Daily Monitoring
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">
                  Today&apos;s Absentees
                </h2>
                <p className="mt-1 text-sm text-white/80">
                  Session-wise absentee tracking for all active groups.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {preparedSessions.map(session => (
                  <div
                    key={session.sessionKey}
                    className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-white/70">
                      {session.sessionKey}
                    </p>
                    <p className="mt-1 text-xl font-bold">{session.totalAbsentees}</p>
                    <p className="text-xs text-white/70">Absentees</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {preparedSessions.map(session => (
          <div
            key={session.sessionKey}
            className={`overflow-hidden rounded-3xl border ${theme.softBorder} bg-white shadow-sm`}
          >
            <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      {sessionLabels[session.sessionKey] || session.sessionKey}
                    </h3>
                    <p className="text-sm text-slate-300">Absentees list</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatPill
                    label="Present"
                    value={session.totalPresent}
                    tone="emerald"
                    icon={<UserCheck className="h-4 w-4" />}
                  />
                  <StatPill
                    label="Absent"
                    value={session.totalAbsentees}
                    tone="rose"
                    icon={<AlertTriangle className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 md:p-5">
              {session.yearBuckets.map(yearBucket => (
                <div
                  key={yearBucket.yearKey}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">
                        {yearBucket.yearKey}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {yearBucket.totalAbsentees} absentee(s)
                      </p>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                      {groupFilter || "All Groups"}
                    </span>
                  </div>

                  {yearBucket.groups.length > 0 ? (
                    <div className="space-y-4">
                      {yearBucket.groups.map(group => (
                        <div
                          key={group.groupName}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                          <div className="flex flex-col gap-3 border-b border-slate-200 bg-linear-to-r from-sky-50 to-cyan-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2 text-slate-900">
                              <Users className="h-5 w-5 text-blue-700" />
                              <span className="font-bold">{group.groupName}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                              <span className="rounded-full bg-white px-3 py-1">
                                Marked by:{" "}
                                <span className="font-semibold text-slate-900">
                                  {group.lecturerName}
                                </span>
                              </span>
                              <span className="rounded-full bg-white px-3 py-1">
                                Time:{" "}
                                <span className="font-semibold text-slate-900">
                                  {formatTime(group.markedAt)}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="grid gap-3 p-4 md:hidden">
                            {group.students.map((student, index) => (
                              <article
                                key={`${student.name}-${index}`}
                                className={`rounded-2xl border px-4 py-3 ${
                                  student.highlightRed
                                    ? "border-rose-200 bg-rose-50"
                                    : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      #{index + 1}
                                    </p>
                                    <h5 className="text-base font-bold text-slate-900">
                                      {student.name}
                                    </h5>
                                  </div>
                                  {student.highlightRed && (
                                    <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">
                                      FN Present → AN Absent
                                    </span>
                                  )}
                                </div>
                              </article>
                            ))}
                          </div>

                          <div className="hidden overflow-x-auto md:block">
                            <table className="min-w-full text-sm">
                              <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                <tr>
                                  <th className="px-4 py-3 text-center">S.No</th>
                                  <th className="px-4 py-3">Student Name</th>
                                  <th className="px-4 py-3 text-center">Remark</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {group.students.map((student, index) => (
                                  <tr
                                    key={`${student.name}-${index}`}
                                    className={
                                      student.highlightRed ? "bg-rose-50" : "bg-white"
                                    }
                                  >
                                    <td className="px-4 py-3 text-center font-semibold text-slate-700">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-900">
                                      {student.name}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {student.highlightRed ? (
                                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                          FN Present → AN Absent
                                        </span>
                                      ) : (
                                        <span className="text-xs text-slate-400">-</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-4 py-10 text-center">
                      <p className="font-semibold text-emerald-700">
                        No absentees in {yearBucket.yearKey}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatPill({ label, value, tone, icon }) {
  const toneMap = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${toneMap[tone]}`}
    >
      {icon}
      {label}: {value}
    </span>
  );
}
