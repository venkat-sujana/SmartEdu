// src/components/StudentAttendanceAlert/StudentAttendanceAlert.jsx

"use client";

import { useEffect, useState } from "react";

export default function StudentAttendanceAlert({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    async function fetchAttendanceAlert() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/attendance/student-alert?studentId=${studentId}`,
          {
            cache: "no-store",
          }
        );

        const responseText = await res.text();

        let json;

        try {
          json = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "STUDENT ALERT JSON PARSE ERROR:",
            parseError
          );

          console.error(
            "STUDENT ALERT RESPONSE:",
            responseText
          );

          setError(
            `Attendance alert API returned an invalid response (${res.status}).`
          );

          return;
        }

        if (res.ok) {
          setData(json);
        } else {
          setError(
            json?.error ||
              json?.message ||
              "Failed to fetch attendance alert data"
          );
        }
      } catch (err) {
        console.error(
          "STUDENT ATTENDANCE ALERT ERROR:",
          err
        );

        setError("Server error while fetching attendance alert");
      } finally {
        setLoading(false);
      }
    }

    fetchAttendanceAlert();
  }, [studentId]);

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

        <span className="text-sm text-gray-500">
          Loading attendance alert...
        </span>
      </div>
    );
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );
  }

  if (!data) return null;

  const { overall, monthlyAlerts = [] } = data;

  const isCritical = Boolean(
    overall?.isBelowThreshold
  );

  const overallPercent =
    Number(overall?.percent) || 0;

  const overallPresent =
    Number(overall?.present) || 0;

  const overallTotal =
    Number(overall?.total) || 0;

  const overallShortage =
    Number(overall?.shortage) || 0;

  return (
    <div className="mx-auto max-w-5xl space-y-4">

      {/* ==================================================
          Overall Attendance Status
      ================================================== */}

      <div
        className={`rounded-2xl border-2 p-5 shadow-md transition-all ${
          isCritical
            ? "border-red-400 bg-red-50"
            : "border-green-400 bg-green-50"
        }`}
      >

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* Left side */}

          <div className="flex items-center gap-3">

            <span className="text-4xl">
              {isCritical ? "🚨" : "✅"}
            </span>

            <div>

              <p
                className={`text-lg font-extrabold ${
                  isCritical
                    ? "text-red-700"
                    : "text-green-700"
                }`}
              >
                {isCritical
                  ? "Attendance Below 75% — RED ALERT!"
                  : "Attendance is Satisfactory"}
              </p>

              {/* Day-based attendance */}

              <p className="text-sm text-gray-600">
                Overall:{" "}
                <span className="font-bold">
                  {overallPresent}
                </span>{" "}
                /{" "}
                <span className="font-bold">
                  {overallTotal}
                </span>{" "}
                present days
              </p>

            </div>
          </div>

          {/* Right side percentage */}

          <div className="text-center">

            <p
              className={`text-5xl font-black ${
                isCritical
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {overallPercent}%
            </p>

            {isCritical && (
              <p className="mt-1 text-xs font-semibold text-red-500">
                ⚠️ Need{" "}
                {overallShortage} more present day
                {overallShortage === 1 ? "" : "s"}{" "}
                to reach 75%
              </p>
            )}

          </div>
        </div>

        {/* ==================================================
            Progress Bar
        ================================================== */}

        <div className="mt-4">

          <div className="mb-1 flex justify-between text-xs text-gray-500">

            <span>0%</span>

            <span className="font-semibold text-orange-500">
              75% required
            </span>

            <span>100%</span>

          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-200">

            {/* 75% marker */}

            <div className="absolute top-0 left-[75%] z-10 h-full w-0.5 bg-orange-400" />

            {/* Fill */}

            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCritical
                  ? "bg-red-500"
                  : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(
                  overallPercent,
                  100
                )}%`,
              }}
            />

          </div>
        </div>

        {/* Day-level rule */}

        <div className="mt-4 rounded-xl border border-blue-200 bg-white/70 p-3 text-center text-xs font-semibold text-slate-600">

          ℹ️ Attendance is calculated by{" "}
          <span className="font-black text-blue-700">
            calendar days
          </span>
          . If the student is Present in at least one
          session (FN/AN), that day is counted as{" "}
          <span className="font-black text-green-700">
            Present
          </span>
          .

        </div>

      </div>

      {/* ==================================================
          Month-wise Low Attendance
      ================================================== */}

      {monthlyAlerts.some(
        (month) => month.isBelowThreshold
      ) && (
        <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 shadow">

          <h3 className="mb-3 flex items-center gap-2 font-bold text-orange-700">
            📅 Month-wise Low Attendance
          </h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">

            {monthlyAlerts
              .filter(
                (month) =>
                  month.isBelowThreshold
              )
              .map((month) => {

                const present =
                  Number(month.present) || 0;

                const total =
                  Number(month.total) || 0;

                const shortage =
                  Number(month.shortage) || 0;

                return (
                  <div
                    key={month.month}
                    className="rounded-xl border border-red-200 bg-white p-3 shadow-sm"
                  >

                    <p className="font-bold text-red-700">
                      🗓️ {month.month}
                    </p>

                    <p className="text-sm text-gray-600">
                      {present} / {total} present days
                    </p>

                    <p className="text-lg font-extrabold text-red-600">
                      {month.percent}%
                    </p>

                    {shortage > 0 && (
                      <p className="text-xs text-orange-600">
                        ⚠️ Need {shortage} more present day
                        {shortage === 1 ? "" : "s"}
                      </p>
                    )}

                  </div>
                );
              })}

          </div>
        </div>
      )}

      {/* ==================================================
          All Months Summary
      ================================================== */}

      <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white shadow">

        <table className="w-full min-w-[650px] text-center text-sm">

          <thead className="bg-blue-600 text-white">

            <tr>

              <th className="border border-blue-700 p-2">
                🗓️ Month
              </th>

              <th className="border border-blue-700 p-2">
                ✅ Present Days
              </th>

              <th className="border border-blue-700 p-2">
                📅 Working Days
              </th>

              <th className="border border-blue-700 p-2">
                📊 Attendance %
              </th>

              <th className="border border-blue-700 p-2">
                🏷️ Status
              </th>

            </tr>

          </thead>

          <tbody>

            {monthlyAlerts.map((month, index) => {

              const present =
                Number(month.present) || 0;

              const total =
                Number(month.total) || 0;

              const percent =
                Number(month.percent) || 0;

              const isBelow =
                Boolean(month.isBelowThreshold);

              return (
                <tr
                  key={month.month}
                  className={
                    isBelow
                      ? "bg-red-50"
                      : index % 2 === 0
                        ? "bg-gray-50"
                        : "bg-white"
                  }
                >

                  <td className="border p-2 font-semibold">
                    {month.month}
                  </td>

                  <td className="border p-2 font-medium text-green-700">
                    {present}
                  </td>

                  <td className="border p-2 font-medium">
                    {total}
                  </td>

                  <td
                    className={`border p-2 font-bold ${
                      isBelow
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {percent}%
                  </td>

                  <td className="border p-2 text-xs">
                    {isBelow
                      ? "🔴 Below 75%"
                      : "🟢 OK"}
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
}