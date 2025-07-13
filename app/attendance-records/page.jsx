//app/attendance-records
"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { FileDown, FileSpreadsheet, Printer } from "lucide-react";
import { useSession } from "next-auth/react";

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [group, setGroup] = useState("");
  const { data: session } = useSession();


  const collegeName = session?.user?.collegeName || "College";

  const [attendanceData, setAttendanceData] = useState({
    "First Year": [],
    "Second Year": [],
  });

  const [yearOfStudy, setYearOfStudy] = useState("");

  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];

  const firstYearData = attendanceData["First Year"] || [];
  const secondYearData = attendanceData["Second Year"] || [];

  const combinedData = [...firstYearData, ...secondYearData];

  const totalPresent = combinedData.reduce(
    (acc, item) => acc + (item.present || 0),
    0
  );
  const totalAbsent = combinedData.reduce(
    (acc, item) => acc + (item.absent || 0),
    0
  );
  const totalAll = totalPresent + totalAbsent;

  const collegePercentage =
    totalAll > 0 ? ((totalPresent / totalAll) * 100).toFixed(2) : 0;

const fetchAttendanceRecords = async () => {
  const query = `start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&group=${encodeURIComponent(group)}&year=${encodeURIComponent(yearOfStudy)}`

  try {
    const url = `/api/attendance/summary/daily-group?${query}`;
    console.log("Requesting:", url); // ✅ Debug
    const res = await fetch(url);
    const json = await res.json();
    console.log("Response JSON:", json); // ✅ Debug

   setAttendanceData({
  "First Year": json.data?.["First Year"] || [],
  "Second Year": json.data?.["Second Year"] || [],
});
    console.log("Attendance Data:", json.data); // ✅ Debug
  } catch (error) {
    console.error("Error fetching attendance records:", error); // ✅ Check here
  }
};


  // Encode before fetch
  const query = new URLSearchParams({
    startDate,
    endDate,
    group,
    yearOfStudy,
  }).toString();

  const res = fetch(`/api/attendance/summary/daily-group?${query}`);

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      👉note: this is a computer generated report and does not require signature
      <p className="text-sm font-semibold mb-4 flex items-center justify-center">
        <span className="text-gray-600">Generated on</span>
        Date: {today} | Time: {new Date().toLocaleTimeString()}
      </p>
      <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
        {collegeName}🧾Group-wise Daily Attendance Summary-2025
      </h2>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Group</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="" >
              All Groups
            </option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Year of Study</label>
          <select
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="" >
              All Years
            </option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={fetchAttendanceRecords}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            🧃&nbsp;Apply Filters
          </button>
        </div>
      </div>
   
      <div className="mb-4">

        <Link href="/attendance-form">
          <button className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer mb-2">
            📝&nbsp; Attendance Form
          </button>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2 cursor-pointer mb-2"
        >
          <Printer className="inline mr-2" /> Print Table
        </button>

        <Link href="/attendance-records/individual">
          <button className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer mb-2">
            👤&nbsp;Edit Attendance Records
          </button>
        </Link>

        <Link href="/attendance-records/attendance-calendar">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer mb-2">
            📅&nbsp;Monthly Calendar View
          </button>
        </Link>

        <Link href="/attendance-records/monthly-summary">
          <button className="bg-slate-900 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 mt-2 cursor-pointer mb-2">
            🧾&nbsp; Monthly Summary
          </button>
        </Link>
      </div>
      {/* Global Print Style */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print-area,
          .print-area * {
            visibility: visible;
          }

          .print-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
          }
        }
      `}</style>
      <div className="print-area">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold uppercase">
            S.K.R. GOVERNMENT JUNIOR COLLEGE
          </h1>
          <p className="text-sm font-semibold">Attendance as on {today}</p>

          {/* Records Table */}
          <div className="space-y-8">
            {/* First Year Table */}
            <div>
              <h2 className="text-lg font-semibold mb-2">
                📘 First Year Attendance
              </h2>
              {attendanceData["First Year"].length > 0 ? (
                <table className="table-auto w-full border">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Group</th>
                      <th className="border px-2 py-1">Present</th>
                      <th className="border px-2 py-1">Absent</th>
                      <th className="border px-2 py-1">Total</th>
                      <th className="border px-2 py-1">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData["First Year"].map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.date}</td>
                        <td className="border px-2 py-1">{item.group}</td>
                        <td className="border px-2 py-1">{item.present}</td>
                        <td className="border px-2 py-1">{item.absent}</td>
                        <td className="border px-2 py-1">{item.total}</td>
                        <td className="border px-2 py-1">
                          {item.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No First Year data available.</p>
              )}
            </div>

            {/* Second Year Table */}
            <div>
              <h2 className="text-lg font-semibold mb-2">
                📗 Second Year Attendance
              </h2>
              {attendanceData["Second Year"].length > 0 ? (
                <table className="table-auto w-full border">
                  <thead>
                    <tr className="bg-green-100">
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Group</th>
                      <th className="border px-2 py-1">Present</th>
                      <th className="border px-2 py-1">Absent</th>
                      <th className="border px-2 py-1">Total</th>
                      <th className="border px-2 py-1">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData["Second Year"].map((item, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{item.date}</td>
                        <td className="border px-2 py-1">{item.group}</td>
                        <td className="border px-2 py-1">{item.present}</td>
                        <td className="border px-2 py-1">{item.absent}</td>
                        <td className="border px-2 py-1">{item.total}</td>
                        <td className="border px-2 py-1">
                          {item.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">No Second Year data available.</p>
              )}
            </div>
          </div>

          <table className="table-auto w-full border mt-4">
            <tbody>
              <tr className="bg-green-100 font-semibold">
                <td colSpan={2} className="border px-4 py-2 text-right">
                  College Total Attendance
                </td>
                <td className="border px-4 py-2">{totalPresent}</td>
                <td className="border px-4 py-2">{totalAbsent}</td>
                <td className="border px-4 py-2">{totalAll}</td>
                <td className="border px-4 py-2">{collegePercentage}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold">
            Note: This is a computer-generated report and does not require a
            signature.
          </p>
          <p className="text-sm font-semibold">
            For any discrepancies, please contact the administration.
          </p>
        </div>
      </div>
      {/* End of Header Section */}
    </div>
  );
}