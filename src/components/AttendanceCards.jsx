"use client";

import { useEffect, useState } from "react";

export default function AttendanceCards({ collegeId }) {
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      const res = await fetch(`/api/attendance/today-list?collegeId=${collegeId}`);
      const json = await res.json();
      setAttendanceData(json.data);
    };

    fetchAttendance();
  }, [collegeId]);

  if (!attendanceData) return <p className="text-gray-500">Loading attendance...</p>;

  const yearWise = {};

  for (const group in attendanceData) {
    ["Present", "Absent"].forEach((status) => {
      attendanceData[group][status].forEach((student) => {
        const year = student.year;
        if (!yearWise[year]) yearWise[year] = {};
        if (!yearWise[year][group]) yearWise[year][group] = { Present: [], Absent: [] };

        yearWise[year][group][status].push(student.name);
      });
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {Object.entries(yearWise).map(([year, groups]) =>
        Object.entries(groups).map(([group, statuses]) => (
          <div
            key={`${year}-${group}`}
            className="bg-white shadow-md rounded-2xl p-4 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-indigo-600">{group} - {year}</h2>
              <span className="text-sm text-gray-500">Today</span>
            </div>

            <div className="flex justify-between">
              <div>
                <h3 className="text-green-700 font-medium">✅ Present ({statuses.Present.length})</h3>
                <ul className="text-sm list-disc ml-5 text-gray-700">
                  {statuses.Present.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-red-700 font-medium">❌ Absent ({statuses.Absent.length})</h3>
                <ul className="text-sm list-disc ml-5 text-gray-700">
                  {statuses.Absent.map((name, idx) => (
                    <li key={idx}>{name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
