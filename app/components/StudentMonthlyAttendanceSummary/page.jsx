// app/components/StudentMonthlyAttendanceSummary/page.jsx

"use client";

import React, { useEffect, useState } from "react";

// Helper function: Object response to summary array
function getMonthlySummary(attendanceRecordsObj) {
  if (!attendanceRecordsObj) return [];
  return Object.entries(attendanceRecordsObj).map(([monthYear, values]) => {
    // Mapping names must match backend!
    const workingDays = values.totalWorkingDays;
    const presentDays = values.presentDays;
    const percentage = values.percent;
    const shortage = values.shortage;
    const status = values.status;
    return {
      monthYear,
      workingDays,
      presentDays,
      percentage,
      shortage,
      status,
    };
  });
}


export default function StudentMonthlyAttendanceSummary({ studentId }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) return;
    async function fetchAttendance() {
      try {
        setLoading(true);
        const res = await fetch(`/api/attendance/student/${studentId}/monthly`);
        const data = await res.json();
        if (res.ok) {
          setAttendanceData(data);
          setError("");
        } else {
          setError(data.error || "Failed to fetch attendance");
        }
      } catch (err) {
        setError("Server error while fetching attendance");
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [studentId]);

  const monthlySummary = getMonthlySummary(attendanceData);

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (monthlySummary.length === 0) return <p>No attendance data available.</p>;

  return (
    <div className="overflow-x-auto bg-cyan-100 rounded shadow-2xl border-1 border-blue-500 p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center flex justify-center gap-2">
        <span>📅</span> Monthly Attendance Summary
      </h2>
      <table className="w-full border border-gray-300 text-center text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border border-green-700 p-2"><span>🗓️</span> Month-Year</th>
            <th className="border border-green-700 p-2"><span>⏰</span> Working Sessions</th>
            <th className="border border-green-700 p-2"><span>✅</span> Present Sessions</th>
            <th className="border border-green-700 p-2"><span>📊</span> Percentage</th>
            <th className="border border-green-700 p-2"><span>⚠️</span> Shortage (Sessions)</th>
            <th className="border border-green-700 p-2"><span>🔔</span> Status</th>
          </tr>
        </thead>
<tbody>
  {monthlySummary.map(
    (
      { monthYear, workingDays, presentDays, percentage, shortage, status }, idx
    ) => (
      <tr
        key={monthYear}
        className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
      >
        <td className="border p-2 font-semibold">{monthYear}</td>
        <td className="border p-2">{workingDays}</td>
        <td className="border p-2">{presentDays}</td>
        <td
          className={`border p-2 ${parseFloat(percentage) < 75 ? "text-red-600 font-bold" : ""}`}
        >
          {percentage}
        </td>
        <td className="border p-2">{shortage}</td>
        <td
          className={`border p-2 flex items-center gap-1 justify-center ${
            status === "RED ALERT❌"
              ? "text-red-700 font-bold"
              : "text-green-700 font-semibold"
          }`}
        >
          <span>{status === "RED ALERT❌" ? "❌" : "✅"}</span>
          <span>{status}</span>
        </td>
      </tr>
    )
  )}
</tbody>

      </table>
    </div>
  );
}
