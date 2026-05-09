//src/comoponents/attendance/IndividualReport.jsx
"use client";

import { useState, useEffect } from "react";
import { Printer, FileSpreadsheet, Pencil, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import AttendanceEditForm from "@/app/attendance-edit-form/page";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const years = ["First Year", "Second Year"];

export default function IndividualReport({
  showTitle = true,
  className = "",
  groupName = "",
}) {
  const [fnRecords, setFnRecords] = useState([]);
  const [anRecords, setAnRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [collegeName, setCollegeName] = useState("");

  // ✅ Also get status to know when session is loading
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  useEffect(() => {
    if (groupName) setGroup(groupName);
  }, [groupName]);

  // ✅ Check moved here — NEVER do early returns before all hooks
  const fetchData = async () => {
    if (status === "loading") {
      toast.error("Session is still loading, please wait.");
      return;
    }

    if (!session?.user?.collegeId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    if (!group || !year) {
      toast.error("Please select Group and Year");
      return;
    }

    const base = `/api/attendance/individual?group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}${
      startDate && endDate ? `&start=${startDate}&end=${endDate}` : ""
    }`;

    try {
      const [fnRes, anRes] = await Promise.all([
        fetch(`${base}&session=FN`),
        fetch(`${base}&session=AN`),
      ]);

      if (!fnRes.ok) throw new Error("Failed to fetch FN records");
      if (!anRes.ok) throw new Error("Failed to fetch AN records");

      const [fnJson, anJson] = await Promise.all([fnRes.json(), anRes.json()]);

      const fnData = fnJson.data || [];
      const anData = anJson.data || [];

      console.log("FN records:", fnData);
      console.log("AN records:", anData);

      setFnRecords(fnData);
      setAnRecords(anData);
      setRecords([...fnData, ...anData]);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Error fetching attendance");
      setFnRecords([]);
      setAnRecords([]);
      setRecords([]);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this attendance record?");
    if (!confirmed) return;

    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully", { id: toastId });
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
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
        Date: r.date ? new Date(r.date).toLocaleDateString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `attendance_report_${group || "all"}.xlsx`);
  };

  // ✅ Show loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-10 text-gray-500">
        Loading session...
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-7xl p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-center rounded border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-800 shadow-sm">
        🏫 {collegeName || "Loading..."}
      </div>

      {showTitle && (
        <h2 className="mb-6 text-center text-2xl font-bold">
          Individual Student Attendance Report
        </h2>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end justify-center gap-4">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          disabled={Boolean(groupName)}
          className="rounded border px-3 py-1 text-sm"
        >
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded border px-3 py-1 text-sm"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded border px-3 py-1 text-sm"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded border px-3 py-1 text-sm"
        />

        <button
          onClick={fetchData}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          📝 Get Report
        </button>

        <button
          onClick={handlePrint}
          className="rounded bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700"
        >
          <Printer className="mr-1 inline" size={16} /> Print
        </button>

        <button
          onClick={handleExportExcel}
          className="rounded bg-yellow-500 px-4 py-1.5 text-sm text-white hover:bg-yellow-600"
        >
          <FileSpreadsheet className="mr-1 inline" size={16} /> Excel
        </button>
      </div>

      {/* FN Session */}
      <h3 className="mb-2 text-lg font-semibold">
        Forenoon (FN) Session —{" "}
        <span className="text-sm font-bold text-blue-600">
          {startDate || "..."} to {endDate || "..."}
        </span>
      </h3>

      <div className="mb-8 overflow-x-auto">
        {fnRecords.length > 0 ? (
          <table className="min-w-full overflow-hidden rounded-lg border border-gray-300 text-center text-sm shadow-md">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="w-10 border px-2 py-1">S.No</th>
                <th className="w-36 border px-2 py-1">Student</th>
                <th className="w-16 border px-2 py-1">Present</th>
                <th className="w-16 border px-2 py-1">Absent</th>
                <th className="w-20 border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fnRecords.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{r.student || "N/A"}</td>
                  <td className="border px-2 py-1 text-green-600">{r.present ? "✅" : ""}</td>
                  <td className="border px-2 py-1 text-red-600">{r.absent ? "❌" : ""}</td>
                  <td className="flex justify-center gap-2 border px-2 py-1">
                    <button onClick={() => setSelectedRecord(r)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-sm text-gray-500">No Forenoon session records found.</p>
        )}
      </div>

      {/* AN Session */}
      <h3 className="mb-2 text-lg font-semibold">
        Afternoon (AN) Session —{" "}
        <span className="text-sm font-bold text-blue-600">
          {startDate || "..."} to {endDate || "..."}
        </span>
      </h3>

      <div className="mb-8 overflow-x-auto">
        {anRecords.length > 0 ? (
          <table className="min-w-full overflow-hidden rounded-lg border border-gray-300 text-center text-sm shadow-md">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="w-10 border px-2 py-1">S.No</th>
                <th className="w-36 border px-2 py-1">Student</th>
                <th className="w-16 border px-2 py-1">Present</th>
                <th className="w-16 border px-2 py-1">Absent</th>
                <th className="w-10 border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {anRecords.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{r.student || "N/A"}</td>
                  <td className="border px-2 py-1 text-green-600">{r.present ? "✅" : ""}</td>
                  <td className="border px-2 py-1 text-red-600">{r.absent ? "❌" : ""}</td>
                  <td className="flex justify-center gap-2 border px-2 py-1">
                    <button onClick={() => setSelectedRecord(r)} className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-sm text-gray-500">No Afternoon session records found.</p>
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