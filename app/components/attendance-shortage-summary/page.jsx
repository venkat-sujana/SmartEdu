//app/components/attendance-shortage-summary/page.jsx

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
          )}&yearOfStudy=${encodeURIComponent(
            selectedYear
          )}&collegeId=${session.user.collegeId}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`);
        }
        const data = await res.json();
        setSummaryData(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, [selectedGroup, selectedYear, session?.user?.collegeId]);

  // Search filter
  const filteredData = summaryData.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👉 Shortage filter: Only <75% overall attendance
  const shortageFilteredData = filteredData.filter((student) => {
    const totalPresent = months.reduce((sum, { label, year }) => {
      const key = `${label}-${year}`;
      return sum + (student.present?.[key] || 0);
    }, 0);
    const totalWorking = months.reduce((sum, { label, year }) => {
      const key = `${label}-${year}`;
      return sum + (student.workingDays?.[key] || 0);
    }, 0);
    const overallPercent =
      totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;
    return overallPercent < 75;
  });

  const handlePrint = () => {
    const printContent = document.getElementById("print-area").innerHTML;
    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>Shortage Students</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 6px; text-align: center; font-size: 13px; }
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
    <div className="max-w-6xl mx-auto p-5 mt-20 bg-gray-100 border border-2 rounded-lg shadow-lg">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-5 rounded-lg shadow-md">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition"
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
          className="border border-gray-300 px-4 py-2 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none transition"
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
          className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition flex-grow min-w-[200px]"
        />
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Printer size={18} />
          Print
        </button>
        
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
         🧾 Attendance Shortage (&lt;75% Only)
      </h2>

      {/* Shortage Students Table */}
      <div
        id="print-area"
        className="overflow-x-auto bg-white rounded-lg shadow-lg"
      >
        {shortageFilteredData.length === 0 ? (
          <p className="text-gray-500 mt-4 text-center py-6">
            All students below 75% attendance.
          </p>
        ) : (
          <table className="table-auto w-full border border-gray-300 text-sm font-sans shadow-lg rounded-lg overflow-hidden">
            <thead className="bg-green-700 text-white text-sm uppercase tracking-wide">
              <tr>
                <th className="p-3 border-r border-green-600 w-14 text-center">S.No</th>
                <th className="p-3 border-r border-green-600 text-left">🧑‍🎓 Students</th>
                <th className="p-3 border-r border-green-600 text-center">Total Working Days</th>
                <th className="p-3 border-r border-green-600 text-center">Total Present Days</th>
                <th className="p-3 border-r border-green-600 text-center">% Attendance</th>
                <th className="p-3 border-r border-green-600 text-center">Shortage (days)</th>
                <th className="p-3 text-center w-28">Status ✅</th>
              </tr>
            </thead>
            <tbody>
              {shortageFilteredData.map((student, idx) => {
                const totalPresent = months.reduce((sum, { label, year }) => {
                  const key = `${label}-${year}`;
                  return sum + (student.present?.[key] || 0);
                }, 0);
                const totalWorking = months.reduce((sum, { label, year }) => {
                  const key = `${label}-${year}`;
                  return sum + (student.workingDays?.[key] || 0);
                }, 0);
                const percent =
                  totalWorking > 0
                    ? ((totalPresent / totalWorking) * 100).toFixed(2)
                    : "0.00";
                const requiredDays = Math.ceil(totalWorking * 0.75);
                const shortage = requiredDays - totalPresent;

                return (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-green-100 transition">
                    <td className="p-3 border border-green-200 text-center">{idx + 1}</td>
                    <td className="p-3 border border-green-200 font-semibold text-gray-900">{student.name}</td>
                    <td className="p-3 border border-green-200 text-center">{totalWorking}</td>
                    <td className="p-3 border border-green-200 text-center">{totalPresent}</td>
                    <td className="p-3 border border-green-200 text-center">{percent}%</td>
                    <td className="p-3 border border-green-200 text-center">
                      <span className="text-red-600 font-bold">{shortage}</span>
                    </td>
                    <td className="p-3 border border-green-200 text-center">
                      <span className="text-red-600 font-bold">Not Eligible ❌</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
    
  );
}
