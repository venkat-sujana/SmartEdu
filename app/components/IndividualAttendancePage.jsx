//app/components/IndividualAttendancePage.jsx
"use client";
import { useState, useEffect } from "react";
import { Printer, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import AttendanceEditForm from "@/app/attendance-edit-form/page";
import AttendanceTable from "@/app/components/AttendanceTable";
const years = ["First Year", "Second Year"];

export default function IndividualAttendancePage({ fixedGroup }) {
  const [fnRecords, setFnRecords] = useState([]);
  const [anRecords, setAnRecords] = useState([]);
  const [records, setRecords] = useState([]);
  const [group, setGroup] = useState(fixedGroup || "");
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { data: session } = useSession();
  const [collegeName, setCollegeName] = useState("");

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  if (!session?.user?.collegeId) {
    toast.error("Session expired. Please login again.");
    return null;
  }

  const fetchData = async () => {
  if (!group || !year) {
    toast.error("దయచేసి గ్రూప్ మరియు ఇయర్ select చేయండి");
    return;
  }

  const baseUrl = `/api/attendance/individual?group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}${startDate && endDate ? `&start=${startDate}&end=${endDate}` : ""}`;

  try {
    // FN
    const fnRes = await fetch(`${baseUrl}&session=FN`);
    const fnData = await fnRes.json();
    console.log("🌅 FN Response:", fnData);
    
    if (!fnRes.ok || fnData.success === false) {
  throw new Error(fnData.message || `FN failed: ${fnRes.status}`);
}

    setFnRecords(fnData.data || []);

    // AN  
    const anRes = await fetch(`${baseUrl}&session=AN`);
    const anData = await anRes.json();
    console.log("🌇 AN Response:", anData);
    
    if (!anRes.ok || !anData.success) {
      throw new Error(anData.message || `AN failed: ${anRes.status}`);
    }
    setAnRecords(anData.data || []);

    setRecords([...(fnData.data || []), ...(anData.data || [])]);
    toast.success(`✅ ${fnData.count || 0} FN + ${anData.count || 0} AN records loaded`);

  } catch (err) {
    console.error("❌ Fetch Error:", err);
    toast.error(`డాటా లోడ్ అవ్వలేదు: ${err.message}`);
  }
};


  const handleDelete = async (id, sessionType) => {
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
    saveAs(
      new Blob([buffer]),
      `attendance_report_${group || "all"}.xlsx`
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-24">
      <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
        🏫 {collegeName || "Loading..."}
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">
        Individual Student Attendance Report {fixedGroup && ` - ${fixedGroup}`}
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end justify-center mb-6">
        {!fixedGroup && (
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="border px-3 py-1 rounded text-sm"
          >
            <option value="">Select Group</option>
            <option value="MPC">MPC</option>
            <option value="BiPC">BiPC</option>
            <option value="CEC">CEC</option>
            <option value="HEC">HEC</option>
            <option value="CET">CET</option>
            <option value="M&AT">M&AT</option>
            <option value="MLT">MLT</option>
          </select>
        )}

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

      <div className="flex justify-center mb-8">
        <Link href="/attendance-form">
          <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold">
            📝 Attendance Form
          </button>
        </Link>
      </div>

       <AttendanceTable
        title="Forenoon (FN) Session"
        records={fnRecords}
        startDate={startDate}
        endDate={endDate}
        onEdit={(r) => setSelectedRecord(r)}
        onDelete={handleDelete}
      />

      <AttendanceTable
        title="Afternoon (AN) Session"
        records={anRecords}
        startDate={startDate}
        endDate={endDate}
        onEdit={(r) => setSelectedRecord(r)}
        onDelete={handleDelete}
      /> 
      
     
        


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
