'use client'
import { useEffect, useState } from 'react'
import { useSession } from "next-auth/react";

const groupIcons = {
  MPC: "📘",
  BiPC: "🧬",
  CEC: "💼",
  HEC: "🍽️",
  "M&AT": "🧮",
  MLT: "🧪",
  CET: "⚙️",
};

export default function GroupWiseAttendanceTable() {
  const [data, setData] = useState({})
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return;

    async function fetchData() {
      const res = await fetch(`/api/attendance/group-wise-today?collegeId=${session.user.collegeId}`);
      const result = await res.json();
      console.log("Fetched:", result.groupWise);
      setData(result.groupWise || {});
    }

    fetchData();
  }, [session]);

  return (
    <div className="p-4">
      {/* College Name */}
      <h2 className="text-2xl font-bold text-center mb-2">
        {session?.user?.collegeName || 'College Name'}
      </h2>

      <h3 className="text-xl font-semibold text-center mb-4">
        📊 Group & Year-wise Attendance Summary
      </h3>

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4 text-left">Group</th>
              <th className="py-2 px-4 text-left">Year</th>
              <th className="py-2 px-4 text-center">✅ Present</th>
              <th className="py-2 px-4 text-center">❌ Absent</th>
              <th className="py-2 px-4 text-center">📊 %</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([group, years]) => {
              const yearEntries = Object.entries(years);
              return yearEntries.map(([year, stats], index) => (
                <tr key={`${group}-${year}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {/* Show group only in the first row */}
                  {index === 0 ? (
                    <td className="py-2 px-4 font-medium" rowSpan={yearEntries.length}>
                      {groupIcons[group] || "📘"} {group}
                    </td>
                  ) : null}
                  <td className="py-2 px-4">{year}</td>
                  <td className="py-2 px-4 text-center text-green-700 font-semibold">{stats.present}</td>
                  <td className="py-2 px-4 text-center text-red-700 font-semibold">{stats.absent}</td>
                  <td className="py-2 px-4 text-center text-blue-700 font-semibold">{stats.percent}%</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
