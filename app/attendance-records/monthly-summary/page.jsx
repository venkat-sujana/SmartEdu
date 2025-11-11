//app/attendance-records/monthly-summary/page.jsx
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

  const filteredData = summaryData.filter((student) =>
  student.name.toLowerCase().includes(searchTerm.toLowerCase())
);


const shortageFilteredData = filteredData.filter((student) => {
  const totalPresent = months.reduce((sum, { label, year }) => {
    const key = `${label}-${year}`;
    return sum + (student.present?.[key] || 0);
  }, 0);
  const totalWorking = months.reduce((sum, { label, year }) => {
    const key = `${label}-${year}`;
    return sum + (student.workingDays?.[key] || 0);
  }, 0);
  const overallPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;
  return overallPercent < 75;
});



  useEffect(() => {
    if (!selectedGroup || !selectedYear) return;

    const fetchData = async () => {
      console.log("Fetching data with:", {
        group: selectedGroup,
        yearOfStudy: selectedYear,
      });

      try {
        console.log("Requesting:", `/api/attendance/monthly-summary?group=${encodeURIComponent(selectedGroup)}
        &yearOfStudy=${encodeURIComponent(selectedYear)}&collegeId=${session.user.collegeId}`);



        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(
            selectedGroup
          )}&yearOfStudy=${encodeURIComponent(selectedYear)}&collegeId=${session.user.collegeId}`
        );

        console.log("Response:", res);

        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`);
        }

        const data = await res.json();
        console.log("Data:", data);
        setSummaryData(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [selectedGroup, selectedYear]);

  

  const handlePrint = () => {
    console.log("Printing...");
    const printContent = document.getElementById("print-area").innerHTML;
    const printWindow = window.open("", "", "width=1000,height=700");
    console.log("Print window:", printWindow);
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
    console.log("Print window document:", printWindow.document);
    printWindow.document.close();
    printWindow.print();
    console.log("Printed");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 mt-20">
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
    {/* Assuming Printer is a valid React icon component */}
    <Printer size={18} />
    Print
  </button>

  <Link href="/attendance-form" passHref>
    <button className="bg-cyan-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition">
      📝 Attendance Form
    </button>
  </Link>

  <Link href="/attendance-records" passHref>
    <button className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
      🧾 Attendance Records
    </button>
  </Link>
</div>

<h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-800">
  {collegeName} 🧾 Monthly Attendance Summary - 2025
</h2>


      {/* Attendance Table */}
      <div
        id="print-area"
        className="overflow-x-auto bg-white rounded-lg shadow-lg"
      >
        {filteredData.length === 0 ? (
          <p className="text-gray-500 mt-4 text-center py-6">
            No data available.
          </p>
        ) : (
<table className="table-auto w-full border border-gray-300 text-sm font-sans shadow-lg rounded-lg overflow-hidden">
  <thead className="bg-green-700 text-white text-sm uppercase tracking-wide">
    <tr>
      <th className="p-3 border-r border-green-600 w-14 text-center">S.No</th>
      <th className="p-3 border-r border-green-600 text-left">🧑‍🎓 Students</th>
      {months.map(({ label }) => (
        <th key={label} className="p-3 border-r border-green-600 text-center">
          {label}
        </th>
      ))}
      <th className="p-3 border-r border-green-600 text-center">Total</th>
      <th className="p-3 border-r border-green-600 text-center w-32">Shortage (days)</th>
      <th className="p-3 text-center w-28">Status ✅</th>
    </tr>
  </thead>

  <tbody>
    {filteredData.map((student, idx) => {
      const totalPresent = months.reduce((sum, { label, year }) => {
        const key = `${label}-${year}`;
        return sum + (student.present?.[key] || 0);
      }, 0);
      const totalWorking = months.reduce((sum, { label, year }) => {
        const key = `${label}-${year}`;
        return sum + (student.workingDays?.[key] || 0);
      }, 0);
      const overallPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;
      const requiredDays = Math.ceil(totalWorking * 0.75);
      const shortage = requiredDays - totalPresent;
      const isEligible = overallPercent >= 75;

      return (
        <React.Fragment key={idx}>
          {/* Working Days Row */}
          <tr className="bg-gray-50 font-semibold text-gray-700">
            <td className="p-3 border border-green-200"></td>
            <td className="p-3 border border-green-200">Working Days</td>
            {months.map(({ label, year }) => {
              const key = `${label}-${year}`;
              return (
                <td key={key} className="p-3 border border-green-200 text-center">
                  {student.workingDays?.[key] || 0}
                </td>
              );
            })}
            <td className="p-3 border border-green-200 font-bold text-center">{totalWorking}</td>
            <td className="p-3 border border-green-200"></td>
            <td className="p-3 border border-green-200"></td>
          </tr>

          {/* Present Days Row */}
          <tr className="odd:bg-white even:bg-gray-50 hover:bg-green-100 transition">
            <td className="p-3 border border-green-200 text-center">{idx + 1}</td>
            <td className="p-3 border border-green-200 font-semibold text-gray-900">{student.name}</td>
            {months.map(({ label, year }) => {
              const key = `${label}-${year}`;
              return (
                <td key={key} className="p-3 border border-green-200 text-center">
                  {student.present?.[key] || 0}
                </td>
              );
            })}
            <td className="p-3 border border-green-200 font-bold text-center">{totalPresent}</td>
            <td className="p-3 border border-green-200"></td>
            <td className="p-3 border border-green-200"></td>
          </tr>

          {/* Percent + Shortage + Status Row */}
          <tr className="bg-green-50 font-semibold text-gray-800">
            <td className="p-3 border border-green-200"></td>
            <td className="p-3 border border-green-200">Percent</td>
            {months.map(({ label, year }) => {
              const key = `${label}-${year}`;
              const present = student.present?.[key] || 0;
              const total = student.workingDays?.[key] || 0;
              const percent = total > 0 ? ((present / total) * 100).toFixed(0) : "-";
              const isLow = total > 0 && percent < 75;

              return (
                <td
                  key={key}
                  className={`p-3 border border-green-200 text-center ${
                    isLow ? "text-red-600 font-bold" : ""
                  }`}
                >
                  {percent}%
                </td>
              );
            })}
            <td className="p-3 border border-green-200 font-bold text-center">{overallPercent.toFixed(0)}%</td>

            {/* Shortage Days */}
            <td className="p-3 border border-green-200 text-center">
              {isEligible ? (
                <span className="text-green-600 font-semibold">No shortage</span>
              ) : (
                <span className="text-red-600 font-bold">{shortage} days</span>
              )}
            </td>

            {/* Status */}
            <td className="p-3 border border-green-200 text-center">
              {isEligible ? (
                <span className="text-green-700 font-bold">Eligible ✅</span>
              ) : (
                <span className="text-red-600 font-bold">Not Eligible ❌</span>
              )}
            </td>
          </tr>

          {/* Spacer */}
          <tr className="h-2">
            <td colSpan={months.length + 6}></td>
          </tr>
        </React.Fragment>
      );
    })}
  </tbody>
</table>


        )}
      </div>
    </div>
  );
}
