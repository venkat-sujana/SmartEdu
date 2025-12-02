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
  const [fnRecords, setFnRecords] = useState([]);
  const [anRecords, setAnRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState("");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const groups = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
  const years = ["First Year", "Second Year"];

  const { data: session } = useSession();
  const [collegeName, setCollegeName] = useState("");
  
 

  
  
  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  if (!session?.user?.collegeId) {
    toast.error("Session expired. Please login again.");
    return null;
  }

  // Fetch FN and AN separately using session param
  const fetchData = async () => {
    if (!group || !year) {
      toast.error("Please select Group and Year");
      return;
    }

    const base = `/api/attendance/individual?group=${encodeURIComponent(
      group
    )}&year=${encodeURIComponent(year)}${
      startDate && endDate ? `&start=${startDate}&end=${endDate}` : ""
    }`;

    try {
      // FN
      const fnRes = await fetch(`${base}&session=FN`);
      if (!fnRes.ok) throw new Error("Failed to fetch FN records");
      const fnJson = await fnRes.json();
      const fnData = fnJson.data || [];
      setFnRecords(fnData);

      // AN
      const anRes = await fetch(`${base}&session=AN`);
      if (!anRes.ok) throw new Error("Failed to fetch AN records");
      const anJson = await anRes.json();
      const anData = anJson.data || [];
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

  // Delete by id and refresh
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );
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

  // Print
  const handlePrint = () => window.print();

  // Export excel (combined FN + AN) - includes session column
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

  return (
    <div className="max-w-7xl mx-auto p-6 mt-24">
      <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
        🏫 {collegeName || "Loading..."}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Individual Student Attendance Report
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end justify-center mb-6">
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-1 rounded text-sm"
        />

        <button
          onClick={fetchData}
          className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700"
        >
          📝 Get Report
        </button>

        <button
          onClick={handlePrint}
          className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
        >
          <Printer className="inline mr-1" size={16} /> Print
        </button>

        <button
          onClick={handleExportExcel}
          className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm hover:bg-yellow-600"
        >
          <FileSpreadsheet className="inline mr-1" size={16} /> Excel
        </button>
      </div>

      

      {/* FN Session */}
      <h3 className="text-lg font-semibold mb-2">
        Forenoon (FN) Session —{" "}
        <span className="text-blue-600 font-bold text-sm">
          {startDate || "..."} to {endDate || "..."}
        </span>
      </h3>

      <div className="overflow-x-auto mb-8">
        {fnRecords.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-center rounded-lg overflow-hidden shadow-md text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 w-10">S.No</th>
                <th className="border px-2 py-1 w-36">Student</th>
                <th className="border px-2 py-1 w-16">Present</th>
                <th className="border px-2 py-1 w-16">Absent</th>
                <th className="border px-2 py-1 w-20">Actions</th>
              </tr>
            </thead>

            <tbody>
              {fnRecords.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 w-10">{i + 1}</td>
                  <td className="border px-2 py-1 w-36">{r.student}</td>
                  <td className="border px-2 py-1 w-16 text-green-600">
                    {r.present ? "✅" : ""}
                  </td>
                  <td className="border px-2 py-1 w-16 text-red-600">
                    {r.absent ? "❌" : ""}
                  </td>

                  <td className="border px-2 py-1 w-full flex gap-2 justify-center">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            No Forenoon session records found.
          </p>
        )}
      </div>

      {/* AN Session */}
      <h3 className="text-lg font-semibold mb-2">
        Afternoon (AN) Session —{" "}
        <span className="text-blue-600 font-bold text-sm">
          {startDate || "..."} to {endDate || "..."}
        </span>
      </h3>

      <div className="overflow-x-auto mb-8">
        {anRecords.length > 0 ? (
          <table className="min-w-full border border-gray-300 text-center rounded-lg overflow-hidden shadow-md text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 w-10">S.No</th>
                <th className="border px-2 py-1 w-36">Student</th>
                <th className="border px-2 py-1 w-16">Present</th>
                <th className="border px-2 py-1 w-16">Absent</th>
                <th className="border px-2 py-1 w-10">Actions</th>
              </tr>
            </thead>

            <tbody>
              {anRecords.map((r, i) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1 w-10">{i + 1}</td>
                  <td className="border px-2 py-1 w-36">{r.student}</td>
                  <td className="border px-2 py-1 w-16 text-green-600">
                    {r.present ? "✅" : ""}
                  </td>
                  <td className="border px-2 py-1 w-16 text-red-600">
                    {r.absent ? "❌" : ""}
                  </td>

                  <td className="border px-2 py-1 w-full flex gap-2 justify-center">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            No Afternoon session records found.
          </p>
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