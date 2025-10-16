
//app/components/groupwise-attendance-table/page.jsx
'use client';
import { useEffect, useState } from 'react';

const groupIcons = {
  MPC: '📘',
  BiPC: '🧬',
  CEC: '💼',
  HEC: '🍽️',
  'M&AT': '🧮',
  MLT: '🧪',
  CET: '⚙️',
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 print:p-0 print:bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* <h2 className="text-2xl font-bold text-center">
          🏫 {collegeName || 'College'} - Group wise - Year wise Attendance Summary
        </h2> */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-1"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      {Object.entries(data).map(([group, yearData]) => (
        <div key={group} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {groupIcons[group] || '📘'} {group}
          </h3>

                  <p className="text-sm text-gray-600 mb-2">
          Attendance Recorded by:{" "}
          <span className="font-medium text-blue-700">
            {Object.values(yearData)[0]?.lecturerName || "—"}
          </span>
        </p>



          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-2 px-3 text-left border">Year</th>
                  <th className="py-2 px-3 text-center border">✅ Present</th>
                  <th className="py-2 px-3 text-center border">❌ Absent</th>
                  <th className="py-2 px-3 text-center border">📊 %</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(yearData).map(([year, stats], idx) => (
                  <tr
                    key={`${group}-${year}`}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-2 px-3 border">{year}</td>
                    <td className="py-2 px-3 text-center border text-green-700 font-semibold">
                      {stats.present}
                    </td>
                    <td className="py-2 px-3 text-center border text-red-700 font-semibold">
                      {stats.absent}
                    </td>
                    <td className="py-2 px-3 text-center border text-blue-700 font-semibold">
                      {stats.percent}%
                    </td>
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
