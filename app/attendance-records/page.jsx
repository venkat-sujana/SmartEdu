"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import {
  FileDown,
  FileSpreadsheet,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [group, setGroup] = useState("");

  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];

  const fetchData = async () => {
    let query = "/api/attendance/summary/daily-group?";
    if (startDate) query += `start=${startDate}&`;
    if (endDate) query += `end=${endDate}&`;
    if (group) query += `group=${encodeURIComponent(group)}&`; // ✅ fixed here

    try {
      const res = await fetch(query);
      if (!res.ok) {
        const text = await res.text();
        console.error("API Error Response:", text);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data.data)) {
        setRecords(data.data);
      } else {
        console.error("Unexpected response format", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((r, i) => ({
        SNo: i + 1,
        Date: r.date,
        Group: r.group,
        Present: r.present,
        Absent: r.absent,
        Total: r.total,
        Percentage: `${r.percentage.toFixed(2)}%`,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Summary");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "GroupwiseAttendanceSummary.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Group-wise Attendance Summary", 14, 10);
    const tableData = records.map((r, i) => [
      i + 1,
      r.date,
      r.group,
      r.present,
      r.absent,
      r.total,
      `${r.percentage.toFixed(2)}%`,
    ]);

    autoTable(doc, {
      head: [["S.No", "Date", "Group", "Present", "Absent", "Total", "%"]],
      body: tableData,
      startY: 20,
    });

    doc.save("GroupwiseAttendanceSummary.pdf");
  };

  // Calculate totals
  const totalPresent = records.reduce((sum, r) => sum + (r.present || 0), 0);
  const totalAbsent = records.reduce((sum, r) => sum + (r.absent || 0), 0);
  const totalAll = totalPresent + totalAbsent;
  const collegePercentage =
    totalAll === 0 ? 0 : ((totalPresent / totalAll) * 100).toFixed(2);

  // Inside AttendanceRecords component
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
        
        🧾Group-wise Daily Attendance Summary-2025
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
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
          >
            🧃&nbsp;Apply Filters
          </button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-4">
        <button
          onClick={exportToExcel}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          <FileSpreadsheet className="inline mr-2" />
          Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          <FileDown className="inline mr-2" />
          Export to PDF
        </button>
        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer">
           📝&nbsp; Attendance Form
          </button>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          <Printer className="inline mr-2" /> Print Table
        </button>

        <Link href="/attendance-records/individual">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer">
            👤&nbsp;Individual Attendance
          </button>
        </Link>

        <Link href="/attendance-records/attendance-calendar">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 cursor-pointer">
            📅&nbsp;Monthly Calendar View
          </button>
        </Link>

        <Link href="/attendance-records/monthly-summary">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2 mt-2 cursor-pointer">
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
          <table className="table-auto w-full border mb-8">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">S.No</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Group</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">%</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, i) => (
                <tr key={`${record.date}-${record.group}`}>
                  <td className="border px-4 py-2">{i + 1}</td>
                  <td className="border px-4 py-2">{record.date}</td>
                  <td className="border px-4 py-2">{record.group}</td>
                  <td className="border px-4 py-2">{record.present}</td>
                  <td className="border px-4 py-2">{record.absent}</td>
                  <td className="border px-4 py-2">{record.total}</td>
                  <td className="border px-4 py-2">
                    {record.percentage.toFixed(2)}%
                  </td>
                </tr>
              ))}

              {/* ✅ College Total Row */}
              <tr className="bg-green-100 font-semibold">
                <td colSpan={3} className="border px-4 py-2 text-right">
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