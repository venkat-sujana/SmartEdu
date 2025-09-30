"use client"
export const dynamic = "force-dynamic"; // ✅ disable prerendering

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AttendanceShortageSummary() {
  const { data: session, status } = useSession();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch attendance shortage data based on session collegeId
  useEffect(() => {
    if (!session?.user?.collegeId) return;

    const fetchShortage = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/attendance/shortage-summary?collegeId=${session.user.collegeId}`
        );
        if (!res.ok) throw new Error("Failed to fetch shortage summary");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShortage();
  }, [session]);

  if (loading)
    return <div className="p-4 text-center text-gray-600">Loading...</div>;
  if (error)
    return <div className="p-4 text-center text-red-600">{error}</div>;
  if (!students.length)
    return (
      <div className="p-4 text-center text-gray-500">
        No students with &lt;75% attendance
      </div>
    );

  // Group-Year తో students summary గ్రూప్ చేయండి
  const groupSummary = {};
  students.forEach((student) => {
    const key = `${student.group}||${student.yearOfStudy}`;
    if (!groupSummary[key]) groupSummary[key] = [];
    groupSummary[key].push(student);
  });

  // Year-wise counts summary
  const yearCounts = students.reduce((acc, curr) => {
    const year = curr.yearOfStudy;
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="rounded-lg shadow-lg p-4 bg-white w-full md:w-2/3 mx-auto my-6 max-w-4xl">
      <h3 className="text-lg font-semibold mb-4 text-green-700 text-center">
        Attendance Shortage Summary (&lt;75%)
      </h3>

      <div className="flex justify-center gap-8 my-4 font-bold text-green-800">
        <div>
          First Year:{" "}
          <span className="text-red-600">{yearCounts["First Year"] || 0}</span>
        </div>
        <div>
          Second Year:{" "}
          <span className="text-red-600">{yearCounts["Second Year"] || 0}</span>
        </div>
        <div>
          Total:{" "}
          <span className="text-blue-700">
            {(yearCounts["First Year"] || 0) +
              (yearCounts["Second Year"] || 0)}
          </span>
        </div>
      </div>

      <table className="w-full max-w-5xl mx-auto text-sm border border-gray-300 rounded">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="p-2 border-r">Group</th>
            <th className="p-2 border-r">Year</th>
            <th className="p-2 border-r">Student Names</th>
            <th className="p-2">Percentages (%)</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupSummary).map(([key, students], idx) => {
            const [group, year] = key.split("||");
            return (
              <tr className="even:bg-green-50" key={idx}>
                <td className="p-2 border-r text-center">{group}</td>
                <td className="p-2 border-r text-center">{year}</td>
                <td className="p-2 border-r">
                  {students.map((s, i) => (
                    <div key={i}>{s.name}</div>
                  ))}
                </td>
                <td className="p-2">
                  {students.map((s, i) => (
                    <div key={i} className="text-red-600 font-semibold">
                      {s.percentage.toFixed(2)}%
                    </div>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
