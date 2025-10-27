//app/components/groupwise-attendance-table/page.jsx
'use client';
import { useEffect, useState } from 'react';
import { Users2, CalendarDays, Printer } from 'lucide-react';

const groupIcons = {
  MPC: <span className="text-blue-500 text-xl">📘</span>,
  BiPC: <span className="text-fuchsia-700 text-xl">🧬</span>,
  CEC: <span className="text-amber-800 text-xl">💼</span>,
  HEC: <span className="text-orange-800 text-xl">🍽️</span>,
  'M&AT': <span className="text-indigo-700 text-xl">🧮</span>,
  MLT: <span className="text-emerald-600 text-xl">🧪</span>,
  CET: <span className="text-gray-600 text-xl">⚙️</span>,
};

export default function GroupWiseAttendanceTable({ collegeId, collegeName, initialDate }) {
  const [data, setData] = useState({});
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!collegeId || !selectedDate) return;
    async function fetchData() {
      const res = await fetch(
        `/api/attendance/group-wise-today?collegeId=${collegeId}&date=${selectedDate}`
      );
      const result = await res.json();
      setData(result.groupWise || {});
    }
    fetchData();
  }, [collegeId, selectedDate]);

  const handlePrint = () => window.print();

  return (
    <div className="p-1 md:p-4 print:p-0 print:bg-white">
  {/* Responsive Header & Filter */}
  <div className="flex flex-col md:flex-row items-center gap-4 justify-between mb-6 w-full">
    <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-2 font-bold text-blue-900 text-lg md:text-xl bg-gradient-to-r from-blue-50 to-green-100 px-3 py-2 rounded-2xl shadow border border-blue-100">
      <Users2 className="w-6 h-6 text-cyan-700" />
      <span className="truncate max-w-[120px] sm:max-w-xs">{collegeName}</span>
      <div className="flex items-center gap-2 w-full md:w-auto">
        <CalendarDays className="w-5 h-5 text-gray-500" />
        <input
          type="date"
          className="border border-gray-300 rounded px-2 py-1 font-semibold focus:outline-blue-500 text-base"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ minWidth: 0, width: "100%" }}
        />
      </div>
    </div>
    <button
      onClick={handlePrint}
      className="w-full md:w-auto bg-blue-600 text-white px-3 py-2 rounded-lg shadow font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
    >
      <Printer className="w-5 h-5" />
      Print
    </button>
  </div>

  {/* Main Group Cards */}
  {Object.entries(data).map(([group, yearData]) => (
    <div key={group} className="mb-4 md:mb-7 border-2 border-blue-100 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50 shadow p-2 md:p-4">
      <h3 className="text-md md:text-lg font-bold text-blue-800 mb-2 flex items-center gap-2">
        {(groupIcons[group] || <span className="text-blue-500 text-xl">📘</span>)} {group}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-[360px] w-full border-collapse text-xs md:text-sm rounded-lg bg-white">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 via-green-200 to-purple-100 text-gray-900 text-xs md:text-sm">
              <th className="py-2 px-1 md:px-3 text-left border">Year</th>
              <th className="py-2 px-1 md:px-3 text-center border">✅</th>
              <th className="py-2 px-1 md:px-3 text-center border">❌</th>
              <th className="py-2 px-1 md:px-3 text-center border">%</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(yearData).map(([year, stats], idx) => (
              <tr
                key={`${group}-${year}`}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
              >
                <td className="py-2 px-1 md:px-3 border font-bold text-blue-800 truncate max-w-[90px]">
                  {year}
                  <div className="text-xs font-medium text-gray-500 mt-0.5">
                    Lecturer: <span className="text-blue-700">{stats.lecturerName || "—"}</span>
                  </div>
                </td>
                <td className="py-2 px-1 md:px-3 text-center border text-green-700 font-bold">{stats.present}</td>
                <td className="py-2 px-1 md:px-3 text-center border text-red-700 font-bold">{stats.absent}</td>
                <td className="py-2 px-1 md:px-3 text-center border text-blue-700 font-bold">{stats.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))}
</div>
);
}
