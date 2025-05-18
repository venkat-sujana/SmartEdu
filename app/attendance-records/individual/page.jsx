"use client";
import { useState } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from "next/link";

export default function IndividualReport() {
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];

  const fetchData = async () => {
    const encodedGroup = encodeURIComponent(group);
    let query = `/api/attendance/individual?group=${encodedGroup}`;

    if (startDate && endDate) {
      query += `&start=${startDate}&end=${endDate}`;
    }

    try {
      const res = await fetch(query);
      const data = await res.json();
      if (data.data) {
        setRecords(data.data);
      } else {
        setRecords([]);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("attendance-table").innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(records);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "attendance_report.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Group-wise Student Attendance Report</h2>

      <div className="flex flex-wrap gap-4 items-end justify-center mb-6">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-4 py-2 rounded"
        />

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
         📝&nbsp; Get Report
        </button>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Printer className="inline mr-2" /> Print
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          <FileSpreadsheet className="inline mr-2" /> Excel
        </button>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold">
            📝 Attendance Form
          </button>
        </Link>
        <Link href="/attendance-records">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">
            📋 Attendance Records
          </button>
        </Link>
      </div>

      <div id="attendance-table" className="overflow-x-auto">
        {records.length > 0 ? (
          <table className="table-auto w-full border border-gray-300 text-center">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">S.No</th>
                <th className="border px-4 py-2">Student</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">%</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{i + 1}</td>
                  <td className="border px-4 py-2">{r.student}</td>
                  <td className="border px-4 py-2">{r.present}</td>
                  <td className="border px-4 py-2">{r.absent}</td>
                  <td className="border px-4 py-2">{r.total}</td>
                  <td className="border px-4 py-2">{r.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500">No records found.</p>
        )}
      </div>
    </div>
  );
}
