"use client";
import { useEffect, useState } from "react";
import React from "react";
import Link from "next/link";
import { Printer } from "lucide-react";

const months = [
  "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR",
];
const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const years = ["First Year", "Second Year"]; // Added year options

export default function MonthlySummary() {
  const [summaryData, setSummaryData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedYear, setSelectedYear] = useState(""); // Year state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedGroup || !selectedYear) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(selectedGroup)}&yearOfStudy=${encodeURIComponent(selectedYear)}`
        );
        const data = await res.json();
        console.log("API RESPONSE:", data);
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
            th, td { border: 1px solid black; padding: 8px; text-align: center; }
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
      <h2 className="text-2xl font-bold mb-8 flex items-center justify-center">
        Monthly Attendance Summary - 2025
      </h2>

      <strong>
        <p className="mb-4">
          Features:
          <br />
          - Shows monthly columns from JUN to MAR (or April to March).
          <br />
          - Three rows: Working Days, Present Days, Percentage.
          <br />
          - Last column “TOTAL” shows cumulative values.
          <br />
          - Place and Date fields shown at the bottom.
          <br />
          - Signature area for student.
          <br />
          - Designed for A4 printing.
          <br />
        </p>
      </strong>

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
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold cursor-pointer">
            📝 Attendance Form
          </button>
        </Link>

        <Link href="/attendance-records">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold cursor-pointer">
            🧾 Attendance Records
          </button>
        </Link>
      </div>

      {/* Attendance Table */}
      <div id="print-area">
        <table className="table-auto w-full border border-gray-300 shadow text-sm">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">🧑‍🎓 Students</th>
              {months.map((month) => (
                <th key={month} className="p-2 border">
                  {month}
                </th>
              ))}
              <th className="p-2 border">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((student, idx) => (
              <React.Fragment key={idx}>
                {/* Working Days Row */}
                <tr className="bg-gray-100">
                  <td className="p-2 border font-semibold"></td>
                  <td className="p-2 border font-semibold">Working Days</td>
                  {months.map((m) => (
                    <td key={m + "-work"} className="p-2 border">
                      {student.workingDays?.[m] || 0}
                    </td>
                  ))}
                  <td className="p-2 border font-semibold">
                    {months.reduce(
                      (sum, m) => sum + (student.workingDays?.[m] || 0),
                      0
                    )}
                  </td>
                </tr>

                {/* Present Row */}
                <tr>
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">{student.name}</td>
                  {months.map((m) => (
                    <td key={m + "-present"} className="p-2 border">
                      {student.present?.[m] || 0}
                    </td>
                  ))}
                  <td className="p-2 border">
                    {months.reduce(
                      (sum, m) => sum + (student.present?.[m] || 0),
                      0
                    )}
                  </td>
                </tr>

                {/* Percent Row */}
                <tr className="bg-yellow-100 font-semibold">
                  <td className="p-2 border"></td>
                  <td className="p-2 border font-medium">Percent</td>
                  {months.map((m) => {
                    const present = student.present?.[m] || 0;
                    const total = student.workingDays?.[m] || 0;
                    const percent =
                      total > 0 ? ((present / total) * 100).toFixed(0) : "-";
                    return (
                      <td key={m + "-percent"} className="p-2 border">
                        {percent}%
                      </td>
                    );
                  })}
                  <td className="p-2 border font-medium">
                    {(() => {
                      const totalWorking = months.reduce(
                        (sum, m) => sum + (student.workingDays?.[m] || 0),
                        0
                      );
                      const totalPresent = months.reduce(
                        (sum, m) => sum + (student.present?.[m] || 0),
                        0
                      );
                      return totalWorking > 0
                        ? ((totalPresent / totalWorking) * 100).toFixed(0) + "%"
                        : "-";
                    })()}
                  </td>
                </tr>

                {/* Spacing */}
                <tr>
                  <td colSpan={months.length + 3} className="h-4"></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
