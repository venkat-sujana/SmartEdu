//app/components/attendance-shortage-table/page.jsx

import React from "react";

export default function AttendanceShortageTable({ absentees }) {
  // Group & Year wise grouping
  const groupedData = absentees.reduce((acc, student) => {
    const key = `${student.group} - ${student.yearOfStudy}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(student.name);
    return acc;
  }, {});

  const keys = Object.keys(groupedData);

  if (keys.length === 0) {
    return <p className="text-center text-gray-500">No absentees data available.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {keys.map((groupYearKey) => (
        <div key={groupYearKey} className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-center bg-red-600 text-white rounded p-2">
            {groupYearKey} - Absentees
          </h3>
          <table className="w-full table-auto border border-gray-300 shadow-sm">
            <thead>
              <tr className="bg-red-700 text-white">
                <th className="border border-gray-300 p-2 w-12">S.No</th>
                <th className="border border-gray-300 p-2 text-left">Name</th>
              </tr>
            </thead>
            <tbody>
              {groupedData[groupYearKey].map((name, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-300 p-2 text-center">{idx + 1}</td>
                  <td className="border border-gray-300 p-2">{name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
