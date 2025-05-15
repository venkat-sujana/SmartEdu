"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";

export default function AttendanceRecords() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [group, setGroup] = useState("");
  
  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];

  const fetchData = async () => {
    let query = "/api/attendance?";
    if (startDate) query += `start=${startDate}&`;
    if (endDate) query += `end=${endDate}&`;
    if (group) query += `group=${group}&`;

    const res = await fetch(query);
    const data = await res.json();

    if (Array.isArray(data.data)) {
      setRecords(data.data);
    } else if (Array.isArray(data)) {
      setRecords(data);
    } else {
      console.error("Unexpected format", data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records.map((r, index) => ({
      SNo: index + 1,
      Name: r.studentId?.name || "N/A",
      Date: r.date?.slice(0, 10),
      Status: r.status,
      Group: r.group,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "AttendanceRecords.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 10);

    const tableData = records.map((r, index) => [
      index + 1,
      r.studentId?.name || "N/A",
      r.date?.slice(0, 10),
      r.status,
      r.group || "N/A",
    ]);

    autoTable(doc, {
      head: [["S.No", "Name", "Date", "Status", "Group"]],
      body: tableData,
      startY: 20,
    });

    doc.save("AttendanceRecords.pdf");
  };

  // Calculate the daily attendance summary (for each group)
  const calculateDailySummary = () => {
    const summary = {};
    let totalPresent = 0;
    let totalAbsent = 0;

    records.forEach((record) => {
      const { date, group, status } = record;

      if (!summary[date]) {
        summary[date] = {};
      }

      if (!summary[date][group]) {
        summary[date][group] = { present: 0, absent: 0 };
      }

      if (status === "Present") {
        summary[date][group].present += 1;
        totalPresent += 1;
      } else if (status === "Absent") {
        summary[date][group].absent += 1;
        totalAbsent += 1;
      }
    });

    return { summary, totalPresent, totalAbsent };
  };

  const { summary, totalPresent, totalAbsent } = calculateDailySummary();

  // Calculate the percentage of attendance
  const totalStudents = totalPresent + totalAbsent;
  const percentage = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(2) : 0;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Attendance Records</h2>

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
            Apply Filters
          </button>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={exportToExcel}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          className="bg-red-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
        >
          Export to PDF
        </button>
        
          <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 transition cursor-pointer font-bold">
            Attendance-Form
          </button>
        </Link>
        

      </div>

      {/* Records Table */}
      <table className="table-auto w-full border mb-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">S.No</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Group</th>
            <th className="border px-4 py-2">Present</th>
            <th className="border px-4 py-2">Absent</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([date, groups]) => (
            Object.entries(groups).map(([group, counts], index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{index + 1}</td>
                <td className="border px-4 py-2">{date}</td>
                <td className="border px-4 py-2">{group}</td>
                <td className="border px-4 py-2">{counts.present}</td>
                <td className="border px-4 py-2">{counts.absent}</td>
              </tr>
            ))
          ))}
          {/* Totals and Percentage Row */}
          <tr className="bg-gray-200">
            <td colSpan={3} className="border px-4 py-2 font-bold">Total</td>
            <td className="border px-4 py-2 font-bold">{totalPresent}</td>
            <td className="border px-4 py-2 font-bold">{totalAbsent}</td>
          </tr>
          <tr className="bg-gray-200">
            <td colSpan={3} className="border px-4 py-2 font-bold">%</td>
            <td colSpan={2} className="border px-4 py-2 font-bold">{percentage}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
