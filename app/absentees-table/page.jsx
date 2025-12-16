//app/absentees-table/page.jsx

"use client";
import { useEffect, useState } from "react";
import {
  UserGroupIcon,
  UserIcon,
  ClockIcon,
  ArrowTrendingDownIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/solid";

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
  EN: "Evening",
};

export default function TodayAbsenteesTable({ collegeId, groupFilter }) {
  const [loading, setLoading] = useState(true);
  const [absData, setAbsData] = useState(null);

  useEffect(() => {
    const fetchAbsentees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/today-absentees`);
        const json = await res.json();
        setAbsData(json);
      } catch (err) {
        setAbsData(null);
      }
      setLoading(false);
    };
    fetchAbsentees();
  }, [collegeId]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-10">
        <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-3 shadow-md border border-blue-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600" />
          <span className="text-blue-800 font-semibold text-sm tracking-wide">
            Loading today&apos;s absentees…
          </span>
        </div>
      </div>
    );
  }

  if (!absData || absData.status !== "success") {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-5 py-3 border border-rose-200 shadow-sm">
          <ArrowTrendingDownIcon className="h-5 w-5 text-rose-500" />
          <span className="text-base font-semibold text-rose-700">
            No attendance recorded today.
          </span>
        </div>
      </div>
    );
  }

  const { sessionWiseAbsentees, sessionWisePresent, summary, sessions } = absData;

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-5xl mx-auto my-4 p-5 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 shadow-xl border border-blue-200">
      {/* Header with icon + summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 px-4 py-2 text-sm md:text-base font-extrabold text-white shadow-md tracking-wide">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <UserIcon className="h-5 w-5" />
          </span>
          Today&apos;s Absentees
          <span className="text-xs md:text-sm font-normal italic text-white/80">
            (Session-wise)
          </span>
        </h2>

        {summary && (
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 shadow border border-blue-100 text-blue-800">
              <AcademicCapIcon className="h-4 w-4 text-blue-500" />
              <span className="font-semibold">
                Present: {summary.grandPresent}/{summary.grandTotal}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 shadow border border-rose-100 text-rose-700">
              <ArrowTrendingDownIcon className="h-4 w-4" />
              <span className="font-semibold">Absent: {summary.grandAbsent}</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-7">
        {sessions.map((sessionKey) => (
          <div key={sessionKey} className="mb-2">
            {/* Session pill */}
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-5 py-1.5 rounded-2xl text-sm font-bold shadow border border-blue-300">
                <ClockIcon className="h-5 w-5 text-white" />
                {sessionLabels[sessionKey] || sessionKey}
              </span>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-white via-cyan-50 to-blue-50 shadow-lg pb-3">
              <h3 className="font-semibold text-base md:text-lg bg-gradient-to-r from-cyan-200 to-emerald-100 px-5 md:px-7 py-3 mb-1 rounded-t-3xl text-blue-900 tracking-wide border-b border-blue-200 flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-blue-700" />
                Absentees List
              </h3>

              {["First Year", "Second Year"].map((yearKey) => {
                const yearStudents =
                  sessionWiseAbsentees[sessionKey]?.filter(
                    (student) =>
                      student.yearOfStudy === yearKey &&
                      (!groupFilter ||
                        (student.group &&
                          student.group.toLowerCase() === groupFilter.toLowerCase()))
                  ) || [];

                const groups = [...new Set(yearStudents.map((s) => s.group))];

                const fnPresentNames = new Set(
                  (sessionWisePresent?.FN || [])
                    .filter((stu) => stu.yearOfStudy === yearKey)
                    .map((stu) => stu.name)
                );

                return (
                  <div
                    key={yearKey}
                    className="mb-5 px-5 md:px-7 py-4 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 rounded-2xl border border-cyan-200 shadow-sm"
                  >
                    <div className="font-semibold text-blue-800 text-base md:text-lg mb-3 flex items-center gap-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                        🎓
                      </span>
                      {yearKey}
                    </div>

                    {groups.length > 0 ? (
                      groups.map((grp) => {
                        const groupList = yearStudents.filter((s) => s.group === grp);
                        const lecturerName = groupList[0]?.lecturerName || "-";
                        const markedAt = groupList[0]?.markedAt || null;

                        return (
                          <div
                            key={grp}
                            className="mb-5 border-2 border-cyan-400 rounded-2xl bg-white shadow-md hover:shadow-2xl transition-shadow duration-300"
                          >
                            {/* Group header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-cyan-200 to-blue-100 rounded-t-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-cyan-300">
                              <span className="font-bold text-blue-900 flex items-center gap-2 text-sm md:text-base">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                                  <UserGroupIcon className="h-5 w-5 text-indigo-600" />
                                </span>
                                Group: {grp}
                              </span>
                              <span className="text-xs md:text-sm text-blue-900 flex flex-wrap items-center gap-2">
                                <span>
                                  Marked By:
                                  <span className="font-bold ml-1">{lecturerName}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[11px] md:text-xs bg-white/70 px-2 py-0.5 rounded-full border border-blue-200">
                                  <ClockIcon className="h-3 w-3 text-blue-600" />
                                  {formatTime(markedAt)}
                                </span>
                              </span>
                            </div>

                            {/* Table / list */}
                            {groupList.length > 0 ? (
                              <table className="w-full rounded-b-2xl text-sm">
                                <thead>
                                  <tr className="bg-blue-50 text-blue-900">
                                    <th className="px-2 py-2 w-12 text-center rounded-l-xl font-bold text-xs uppercase tracking-wide">
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-left font-bold text-xs uppercase tracking-wide">
                                      👤 Name
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupList.map((student, idx) => {
                                    const highlightRed =
                                      sessionKey === "AN" && fnPresentNames.has(student.name);
                                    return (
                                      <tr
                                        key={student.name + idx}
                                        className={
                                          idx % 2 === 0
                                            ? "bg-white"
                                            : "bg-blue-50 hover:bg-blue-100"
                                        }
                                      >
                                        <td className="px-2 py-2 text-center font-bold text-xs">
                                          {idx + 1}
                                        </td>
                                        <td
                                          className={`px-2 py-2 text-sm font-medium transition-colors duration-200 ${
                                            highlightRed
                                              ? "bg-red-100 text-red-600 font-extrabold animate-pulse rounded"
                                              : "text-blue-900"
                                          }`}
                                        >
                                          {student.name}
                                          {highlightRed && (
                                            <span className="ml-2 text-[10px] bg-red-200 px-2 rounded-full font-semibold text-red-700 shadow-sm inline-flex items-center gap-1">
                                              <ArrowTrendingDownIcon className="h-3 w-3" />
                                              FN Present ⮕ AN Absent
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="py-4 text-green-700 text-center font-semibold text-sm">
                                No absentees in this group
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-3 text-green-700 text-center font-semibold text-sm">
                        No absentees in {yearKey}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
