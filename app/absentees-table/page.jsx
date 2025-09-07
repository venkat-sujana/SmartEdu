
//app/absentees-table/page.jsx
"use client";

import React from "react";

export default function AbsenteesTable({ absentees }) {
  // absentees array ని yearOfStudy మరియు group ఆధారంగా గ్రూప్ చేయడం
  const grouped = absentees.reduce((acc, item) => {
    if (!acc[item.yearOfStudy]) {
      acc[item.yearOfStudy] = {};
    }
    if (!acc[item.yearOfStudy][item.group]) {
      acc[item.yearOfStudy][item.group] = [];
    }
    acc[item.yearOfStudy][item.group].push(item);
    return acc;
  }, {});

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
          {Object.entries(grouped).map(([year, groups]) =>
            Object.entries(groups).map(([group, students]) => (
              <tr key={`${year}-${group}`}>
                <td className="border px-3 py-2 text-center">{year}</td>
                <td className="border px-3 py-2 text-center">{group}</td>
                <td className="border px-3 py-2">
                  {students.map((s) => s.name).join(", ")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
