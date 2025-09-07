"use client";

import React from "react";

export default function AbsenteesTable({ absentees }) {
  // Ensure absentees is always an array internally
  const safeAbsentees = Array.isArray(absentees) ? absentees : [];

  console.log("AbsenteesTable: absentees:", safeAbsentees);

  const grouped = safeAbsentees.reduce((acc, item) => {
    if (!item?.yearOfStudy || !item?.group) return acc; // Defensive check

    if (!acc[item.yearOfStudy]) {
      acc[item.yearOfStudy] = {};
    }
    if (!acc[item.yearOfStudy][item.group]) {
      acc[item.yearOfStudy][item.group] = [];
    }
    acc[item.yearOfStudy][item.group].push(item);
    return acc;
  }, {});

  console.log("AbsenteesTable: grouped:", grouped);

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border px-3 py-2 bg-gray-200">Year</th>
            <th className="border px-3 py-2 bg-gray-200">Group</th>
            <th className="border px-3 py-2 bg-gray-200">Names</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([year, groups]) =>
              Object.entries(groups).map(([group, students]) => (
                <tr key={`${year}-${group}`}>
                  <td className="border px-3 py-2 text-center">{year}</td>
                  <td className="border px-3 py-2 text-center">{group}</td>
                  <td className="border px-3 py-2">
                    {students.map((s) => s?.name).join(", ")}
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan={3} className="text-center text-gray-500 py-4 border">
                No absentees found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
