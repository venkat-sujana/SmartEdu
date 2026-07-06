"use client";

import { useEffect, useState } from "react";

export default function StudentAttendanceAlert({ studentId }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    (async () => {
      try {
        const res  = await fetch(
          `/api/attendance/student-alert?studentId=${studentId}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (res.ok) setData(json);
        else setError(json.error || "Failed to fetch alert data");
      } catch {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  if (loading)
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading attendance alert...</span>
      </div>
    );

  if (error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );

  if (!data) return null;

  const { overall, monthlyAlerts } = data;
  const isCritical = overall.isBelowThreshold;

  return (
    <div className="mx-auto max-w-5xl space-y-4">

      {/* ── Overall Status Banner ── */}
      <div
        className={`rounded-2xl border-2 p-5 shadow-md transition-all ${
          isCritical
            ? "border-red-400 bg-red-50"
            : "border-green-400 bg-green-50"
        }`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: icon + message */}
          <div className="flex items-center gap-3">
            <span className="text-4xl">{isCritical ? "🚨" : "✅"}</span>
            <div>
              <p className={`text-lg font-extrabold ${isCritical ? "text-red-700" : "text-green-700"}`}>
                {isCritical
                  ? "Attendance Below 75% — RED ALERT!"
                  : "Attendance is Satisfactory"}
              </p>
              <p className="text-sm text-gray-600">
                Overall: {overall.present} / {overall.total} sessions attended
              </p>
            </div>
          </div>

          {/* Right: big percentage */}
          <div className="text-center">
            <p
              className={`text-5xl font-black ${
                isCritical ? "text-red-600" : "text-green-600"
              }`}
            >
              {overall.percent}%
            </p>
            {isCritical && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                ⚠️ Need {overall.shortage} more sessions to reach 75%
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="font-semibold text-orange-500">75% required</span>
            <span>100%</span>
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">
            {/* 75% marker */}
            <div className="absolute top-0 left-[75%] z-10 h-full w-0.5 bg-orange-400" />
            {/* Fill */}
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCritical ? "bg-red-500" : "bg-green-500"
              }`}
              style={{ width: `${Math.min(parseFloat(overall.percent), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Month-wise Alerts ── */}
      {monthlyAlerts.some(m => m.isBelowThreshold) && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 shadow">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-orange-700">
            📅 Month-wise Low Attendance
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {monthlyAlerts
              .filter(m => m.isBelowThreshold)
              .map(m => (
                <div
                  key={m.month}
                  className="rounded-xl border border-red-200 bg-white p-3 shadow-sm"
                >
                  <p className="font-bold text-red-700">🗓️ {m.month}</p>
                  <p className="text-sm text-gray-600">
                    {m.present} / {m.total} sessions
                  </p>
                  <p className="text-lg font-extrabold text-red-600">
                    {m.percent}%
                  </p>
                  <p className="text-xs text-orange-600">
                    ⚠️ Need {m.shortage} more sessions
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── All months summary strip ── */}
      <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow">
        <table className="w-full text-center text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border border-blue-700 p-2">🗓️ Month</th>
              <th className="border border-blue-700 p-2">✅ Present</th>
              <th className="border border-blue-700 p-2">⏰ Total</th>
              <th className="border border-blue-700 p-2">📊 %</th>
              <th className="border border-blue-700 p-2">🏷️ Status</th>
            </tr>
          </thead>
          <tbody>
            {monthlyAlerts.map((m, i) => (
              <tr
                key={m.month}
                className={
                  m.isBelowThreshold
                    ? "bg-red-50"
                    : i % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white"
                }
              >
                <td className="border p-2 font-semibold">{m.month}</td>
                <td className="border p-2">{m.present}</td>
                <td className="border p-2">{m.total}</td>
                <td
                  className={`border p-2 font-bold ${
                    m.isBelowThreshold ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {m.percent}%
                </td>
                <td className="border p-2 text-xs">
                  {m.isBelowThreshold ? "🔴 Below 75%" : "🟢 OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}