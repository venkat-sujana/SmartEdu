'use client'
import { useEffect, useState, useRef } from 'react'
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
  const [data, setData] = useState({});
  const { data: session } = useSession();
  const printRef = useRef(null);

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

  const handlePrint = () => {
    const printContents = printRef.current?.innerHTML;
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Attendance Print</title>
            <style>
              body { font-family: Arial; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #000; padding: 8px; text-align: center; }
              th { background-color: #f0f0f0; }
              h2, h3 { text-align: center; margin: 10px 0; }
            </style>
          </head>
          <body>
            ${printContents}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() { window.close(); }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("Popup blocked. Please allow popups for this site.");
    }
  };

  return (
    <div className="p-4">
      {/* Print Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🖨️ Print
        </button>
      </div>

      {/* Printable Content */}
      <div ref={printRef}>
        <h2 className="text-2xl font-bold text-center mb-2">
          {session?.user?.collegeName || 'College Name'}
        </h2>

        <h3 className="text-xl font-semibold text-center mb-4">
          📊 Group & Year-wise Attendance Summary
        </h3>

        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-2 px-4">Group</th>
              <th className="py-2 px-4">Year</th>
              <th className="py-2 px-4">✅ Present</th>
              <th className="py-2 px-4">❌ Absent</th>
              <th className="py-2 px-4">📊 %</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([group, years]) => {
              const yearEntries = Object.entries(years);
              return yearEntries.map(([year, stats], index) => (
                <tr key={`${group}-${year}`}>
                  {index === 0 && (
                    <td rowSpan={yearEntries.length} className="py-2 px-4 font-medium">
                      {groupIcons[group] || "📘"} {group}
                    </td>
                  )}
                  <td className="py-2 px-4">{year}</td>
                  <td className="py-2 px-4 text-green-700 font-semibold">{stats.present}</td>
                  <td className="py-2 px-4 text-red-700 font-semibold">{stats.absent}</td>
                  <td className="py-2 px-4 text-blue-700 font-semibold">{stats.percent}%</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
