// app/attendance-records/monthly-summary/page.jsx
"use client";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { useSession } from "next-auth/react";

const months = [
  { label: "JUN", year: "2025" },
  { label: "JUL", year: "2025" },
  { label: "AUG", year: "2025" },
  { label: "SEP", year: "2025" },
  { label: "OCT", year: "2025" },
  { label: "NOV", year: "2025" },
  { label: "DEC", year: "2025" },
  { label: "JAN", year: "2026" },
  { label: "FEB", year: "2026" },
  { label: "MAR", year: "2026" },
];

const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const years = ["First Year", "Second Year"];

export default function MonthlySummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  const collegeName = session?.user?.collegeName || "College";

  useEffect(() => {
    if (!selectedGroup || !selectedYear) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(
            selectedGroup
          )}&yearOfStudy=${encodeURIComponent(selectedYear)}`
        );
        const data = await res.json();
        setSummaryData(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [selectedGroup, selectedYear]);

  const filteredData = summaryData.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Monthly Attendance</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 6px; text-align: center; font-size: 12px; }
            th { background-color: #16a34a; color: white; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {collegeName} 🧾 Monthly Attendance Summary - 2025
      </h2>

      {/* Filters */}
      <div className="mb-4 flex gap-4 items-center flex-wrap">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="border px-3 py-2 rounded bg-white"
        >
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border px-3 py-2 rounded bg-white"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Search Student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded"
        />

        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          <Printer className="inline mr-2" /> Print
        </button>

        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded font-bold cursor-pointer">
            📝 Attendance Form
          </button>
        </Link>

        <Link href="/attendance-records">
          <button className="bg-green-600 text-white px-4 py-2 rounded font-bold cursor-pointer">
            🧾 Attendance Records
          </button>
        </Link>
      </div>

      {/* Attendance Table */}
      <div id="print-area">
        {filteredData.length === 0 ? (
          <p className="text-gray-500 mt-4 text-center">No data available.</p>
        ) : (
          <table className="table-auto w-full border border-gray-300 shadow text-sm">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="p-2 border">S.No</th>
                <th className="p-2 border">🧑‍🎓 Students</th>
                {months.map(({ label }) => (
                  <th key={label} className="p-2 border">
                    {label}
                  </th>
                ))}
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((student, idx) => (
                <React.Fragment key={idx}>
                  {/* Working Days */}
                  <tr className="bg-gray-100 font-medium">
                    <td className="p-2 border"></td>
                    <td className="p-2 border">Working Days</td>
                    {months.map(({ label, year }) => {
                      const key = `${label}-${year}`;
                      return (
                        <td key={key} className="p-2 border">
                          {student.workingDays?.[key] || 0}
                        </td>
                      );
                    })}
                    <td className="p-2 border">
                      {months.reduce((sum, { label, year }) => {
                        const key = `${label}-${year}`;
                        return sum + (student.workingDays?.[key] || 0);
                      }, 0)}
                    </td>
                  </tr>

                  {/* Present */}
                  <tr>
                    <td className="p-2 border">{idx + 1}</td>
                    <td className="p-2 border">{student.name}</td>
                    {months.map(({ label, year }) => {
                      const key = `${label}-${year}`;
                      return (
                        <td key={key} className="p-2 border">
                          {student.present?.[key] || 0}
                        </td>
                      );
                    })}
                    <td className="p-2 border">
                      {months.reduce((sum, { label, year }) => {
                        const key = `${label}-${year}`;
                        return sum + (student.present?.[key] || 0);
                      }, 0)}
                    </td>
                  </tr>

                  {/* Percent */}
                  <tr className="bg-yellow-100 font-semibold">
                    <td className="p-2 border"></td>
                    <td className="p-2 border">Percent</td>
                    {months.map(({ label, year }) => {
                      const key = `${label}-${year}`;
                      const present = student.present?.[key] ?? 0;
                      const total = student.workingDays?.[key] ?? 0;
                      const percent =
                        total > 0 ? ((present / total) * 100).toFixed(0) : "-";
                      return (
                        <td key={key} className="p-2 border">
                          {percent}%
                        </td>
                      );
                    })}
                    <td className="p-2 border">
                      {(() => {
                        const totalPresent = months.reduce((sum, { label, year }) => {
                          const key = `${label}-${year}`;
                          return sum + (student.present?.[key] || 0);
                        }, 0);
                        const totalWorking = months.reduce((sum, { label, year }) => {
                          const key = `${label}-${year}`;
                          return sum + (student.workingDays?.[key] || 0);
                        }, 0);
                        return totalWorking > 0
                          ? ((totalPresent / totalWorking) * 100).toFixed(0) + "%"
                          : "-";
                      })()}
                    </td>
                  </tr>

                  {/* Spacer Row */}
                  <tr>
                    <td colSpan={months.length + 3} className="h-4"></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
