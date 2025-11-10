"use client";
import { useState, useEffect } from "react";
import { Printer, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from "next/link";
import AttendanceEditForm from "@/app/attendance-edit-form/page";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export default function IndividualReport() {
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
  const years = ["First Year", "Second Year"];

  const { data: session } = useSession();

  const [collegeId, setCollegeId] = useState("");
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId);
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  if (!session?.user?.collegeId) {
    toast.error("Session expired. Please login again.");
    return null;
  }

  const fetchData = async () => {
    let query = `/api/attendance/individual?group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}`;
    if (startDate && endDate) query += `&start=${startDate}&end=${endDate}`;

    try {
      const res = await fetch(query);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const text = await res.text();
      const data = text ? JSON.parse(text) : { data: [] };
      setRecords(data.data || []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setRecords([]);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this attendance record?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted successfully", { id: toastId });
        fetchData();
      } else {
        toast.error("Failed to delete", { id: toastId });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting record", { id: toastId });
    }
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((r) => ({
        Student: r.student,
        Present: r.present,
        Absent: r.absent,
        Session: r.session,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "attendance_report.xlsx");
  };

  // Separate FN and AN session records
  const fnRecords = records.filter(r => r.session === "FN");
  const anRecords = records.filter(r => r.session === "AN");

  return (
    <div className="max-w-7xl mx-auto p-6 mt-24">
      <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
        <span className="font-semibold">🏫</span> {collegeName || "Loading..."}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Individual Student Attendance Report</h2>

      <div className="flex flex-wrap gap-4 items-end justify-center mb-6">
        <select value={group} onChange={e => setGroup(e.target.value)} className="border px-4 py-2 rounded">
          <option value="">Select Group</option>
          {groups.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <select value={year} onChange={e => setYear(e.target.value)} className="border px-4 py-2 rounded">
          <option value="">Select Year</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border px-4 py-2 rounded" />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border px-4 py-2 rounded" />

        <button onClick={fetchData} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          📝&nbsp; Get Report
        </button>

        <button onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          <Printer className="inline mr-2" /> Print
        </button>

        <button onClick={handleExportExcel} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
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

      {/* FN Session Table */}
      <h3 className="text-xl font-semibold mb-2">Forenoon (FN) Session</h3>
      <div className="overflow-x-auto mb-8">
        {fnRecords.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-center rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2">S.No</th>
                <th className="border px-4 py-2">Student</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
  {fnRecords.map((r, i) => (
    <tr key={r._id || i} className="hover:bg-gray-50">
      <td className="border px-4 py-2">{i + 1}</td>
      <td className="border px-4 py-2">{r.student}</td>
      {/* Present as green tick */}
      <td className="border px-4 py-2 text-center">{r.present ? <span className="text-green-600">✅</span> : null}</td>
      {/* Absent as red cross */}
      <td className="border px-4 py-2 text-center">{r.absent ? <span className="text-red-600">❌</span> : null}</td>
      <td className="border px-4 py-2">{new Date(r.date).toLocaleDateString()}</td>
      <td className="border px-4 py-2 flex gap-2 justify-center">
        <button onClick={() => setSelectedRecord(r)} className="text-blue-600 hover:text-blue-800">
          <Pencil size={18} />
        </button>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        ) : (
          <p className="text-center text-gray-500">No Forenoon session records found.</p>
        )}
      </div>

      {/* AN Session Table */}
      <h3 className="text-xl font-semibold mb-2">Afternoon (AN) Session</h3>
      <div className="overflow-x-auto mb-8">
        {anRecords.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-center rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2">S.No</th>
                <th className="border px-4 py-2">Student</th>
                <th className="border px-4 py-2">Present</th>
                <th className="border px-4 py-2">Absent</th>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
<tbody>
  {fnRecords.map((r, i) => (
    <tr key={r._id || i} className="hover:bg-gray-50">
      <td className="border px-4 py-2">{i + 1}</td>
      <td className="border px-4 py-2">{r.student}</td>
      {/* Present as green tick */}
      <td className="border px-4 py-2 text-center">{r.present ? <span className="text-green-600">✅</span> : null}</td>
      {/* Absent as red cross */}
      <td className="border px-4 py-2 text-center">{r.absent ? <span className="text-red-600">❌</span> : null}</td>
      <td className="border px-4 py-2">{new Date(r.date).toLocaleDateString()}</td>
      <td className="border px-4 py-2 flex gap-2 justify-center">
        <button onClick={() => setSelectedRecord(r)} className="text-blue-600 hover:text-blue-800">
          <Pencil size={18} />
        </button>
        <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800">
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        ) : (
          <p className="text-center text-gray-500">No Afternoon session records found.</p>
        )}
      </div>

      {selectedRecord && (
        <AttendanceEditForm
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
