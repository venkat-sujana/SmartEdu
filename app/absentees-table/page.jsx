"use client";

import React from "react";
import { User } from "lucide-react";

export default function AbsenteesTable({ absentees }) {
  // Ensure absentees is always an array internally
  const safeAbsentees = Array.isArray(absentees) ? absentees : [];

  // Grouping
  const grouped = safeAbsentees.reduce((acc, item) => {
    if (!item?.yearOfStudy || !item?.group) return acc; // Defensive check
    if (!acc[item.yearOfStudy]) acc[item.yearOfStudy] = {};
    if (!acc[item.yearOfStudy][item.group]) acc[item.yearOfStudy][item.group] = [];
    acc[item.yearOfStudy][item.group].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-2xl shadow-xl p-5 md:p-8 my-2">
      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex w-9 h-9 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 shadow-lg text-xl">
          <User className="w-5 h-5" />
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-blue-800 tracking-wide">Today's Absentees</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px] border border-blue-200 rounded-lg bg-white shadow">
          <thead>
            <tr>
              <th className="bg-blue-200 text-blue-900 py-2 px-3 rounded-tl-lg w-32">Year</th>
              <th className="bg-green-200 text-green-900 py-2 px-3 w-32">Group</th>
              <th className="bg-yellow-200 text-yellow-800 py-2 px-3 rounded-tr-lg w-auto">Names</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(grouped).length > 0 ? (
              Object.entries(grouped).map(([year, groups]) =>
                Object.entries(groups).map(([group, students], idx) => (
                  <tr key={`${year}-${group}`} className="even:bg-blue-50 hover:bg-green-50 transition-all">
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold 
                        ${year.toLowerCase().includes('first') ? 'bg-blue-100 text-blue-800' : year.toLowerCase().includes('second') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {year}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block rounded-full px-3 py-1 text-sm font-medium bg-green-100 text-green-900 shadow"> {group} </span>
                    </td>
                    <td className="py-2 px-3 ">
                      <div className="flex flex-wrap gap-2">
                        {students.map((s, i) => (
                          <span key={i} className="bg-gradient-to-tr from-yellow-100 to-blue-100 rounded-full px-3 py-1 text-sm text-indigo-800 font-semibold shadow">
                            {s?.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )
            ) : (
              <tr>
                <td colSpan={3} className="text-center text-gray-400 italic py-5">
                  🎉 No absentees found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
