"use client";

import { useState, useEffect } from "react";
import {
  Printer, FileSpreadsheet, Pencil, Trash2,
  Search, Calendar, Users, ChevronDown,
  AlertTriangle, CheckCircle2, XCircle,
  BarChart3, ClipboardList, Sunrise, Sunset
} from "lucide-react";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName);
  }, [session]);

  useEffect(() => {
    if (groupName) setGroup(groupName);
  }, [groupName]);

  const fetchData = async () => {
    if (status === "loading") { toast.error("Session loading..."); return; }
    if (!session?.user?.collegeId) { toast.error("Session expired. Login again."); return; }
    if (!group || !year) { toast.error("Group మరియు Year select చేయండి"); return; }

    setIsLoading(true);
    const base = `/api/attendance/individual?group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}${
      startDate && endDate ? `&start=${startDate}&end=${endDate}` : ""
    }`;

    try {
      const [fnRes, anRes] = await Promise.all([
        fetch(`${base}&session=FN`),
        fetch(`${base}&session=AN`),
      ]);
      const [fnJson, anJson] = await Promise.all([fnRes.json(), anRes.json()]);
      const fnData = fnJson.data || [];
      const anData = anJson.data || [];
      setFnRecords(fnData);
      setAnRecords(anData);
      setRecords([...fnData, ...anData]);
    } catch (err) {
      toast.error("Error fetching attendance");
      setFnRecords([]); setAnRecords([]); setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("ఈ record delete చేస్తారా?");
    if (!confirmed) return;
    const toastId = toast.loading("Deleting...");
    try {
      const res = await fetch(`/api/attendance/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Deleted successfully", { id: toastId });
      await fetchData();
    } catch (err) {
      toast.error("Error deleting record", { id: toastId });
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== "DELETE") { toast.error("'DELETE' అని type చేయండి"); return; }
    if (!group || !year) { toast.error("Group మరియు Year select చేయండి"); return; }
    setIsDeleting(true);
    const toastId = toast.loading("అన్నీ delete చేస్తున్నాం...");
    try {
      const url = `/api/attendance/delete-all?group=${encodeURIComponent(group)}&year=${encodeURIComponent(year)}${
        startDate && endDate ? `&start=${startDate}&end=${endDate}` : ""
      }`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success(`✅ ${data.deletedCount} records deleted!`, { id: toastId });
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      await fetchData();
    } catch (err) {
      toast.error(err.message || "Error deleting", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((r) => ({
        Student: r.student,
        Present: r.present ? "Present" : "",
        Absent: r.absent ? "Absent" : "",
        Session: r.session,
        Date: r.date ? new Date(r.date).toLocaleDateString() : "",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), `attendance_${group || "all"}_${startDate || "all"}.xlsx`);
  };

  // Stats
  const fnPresent = fnRecords.filter((r) => r.present).length;
  const fnAbsent = fnRecords.filter((r) => r.absent).length;
  const anPresent = anRecords.filter((r) => r.present).length;
  const anAbsent = anRecords.filter((r) => r.absent).length;
  const totalPresent = fnPresent + anPresent;
  const totalAbsent = fnAbsent + anAbsent;
  const totalRecords = records.length;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 ${className}`}>

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm print:shadow-none">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
                <ClipboardList size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  {showTitle ? "Individual Attendance Report" : collegeName}
                </h1>
                <p className="text-xs text-slate-400 font-medium">🏫 {collegeName || "Loading..."}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
              >
                <FileSpreadsheet size={14} /> Excel
              </button>
              <button
                onClick={() => {
                  if (!group || !year) { toast.error("ముందు Group మరియు Year select చేయండి"); return; }
                  setShowDeleteModal(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-100"
              >
                <Trash2 size={14} /> Delete All
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">

        {/* ── Filter Card ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wide">
            <Search size={14} className="text-blue-500" /> Filters
          </p>
          <div className="flex flex-wrap items-end gap-3">

            {/* Group */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Group</label>
              <div className="relative">
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  disabled={Boolean(groupName)}
                  className="appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                >
                  <option value="">Select Group</option>
                  {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Year</label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Year</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">From Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">To Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-sm font-medium text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Get Report */}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-60"
            >
              {isLoading
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <BarChart3 size={15} />
              }
              {isLoading ? "Loading..." : "Get Report"}
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {records.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
            {[
              { label: "Total Records", value: totalRecords, icon: Users, color: "blue" },
              { label: "Total Present", value: totalPresent, icon: CheckCircle2, color: "emerald" },
              { label: "Total Absent", value: totalAbsent, icon: XCircle, color: "rose" },
              {
                label: "Attendance %",
                value: totalRecords > 0 ? `${Math.round((totalPresent / totalRecords) * 100)}%` : "0%",
                icon: BarChart3,
                color: totalRecords > 0 && (totalPresent / totalRecords) >= 0.75 ? "emerald" : "amber"
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`rounded-2xl border bg-white p-4 shadow-sm border-slate-200`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    color === "blue" ? "bg-blue-100 text-blue-600"
                    : color === "emerald" ? "bg-emerald-100 text-emerald-600"
                    : color === "rose" ? "bg-rose-100 text-rose-600"
                    : "bg-amber-100 text-amber-600"
                  }`}>
                    <Icon size={15} />
                  </div>
                </div>
                <p className={`text-2xl font-black ${
                  color === "blue" ? "text-blue-700"
                  : color === "emerald" ? "text-emerald-700"
                  : color === "rose" ? "text-rose-700"
                  : "text-amber-700"
                }`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── FN Table ── */}
        <SessionTable
          title="Forenoon Session"
          subtitle="FN"
          icon={<Sunrise size={16} className="text-amber-500" />}
          records={fnRecords}
          startDate={startDate}
          endDate={endDate}
          presentCount={fnPresent}
          absentCount={fnAbsent}
          onEdit={setSelectedRecord}
          onDelete={handleDelete}
          color="amber"
        />

        {/* ── AN Table ── */}
        <SessionTable
          title="Afternoon Session"
          subtitle="AN"
          icon={<Sunset size={16} className="text-orange-500" />}
          records={anRecords}
          startDate={startDate}
          endDate={endDate}
          presentCount={anPresent}
          absentCount={anAbsent}
          onEdit={setSelectedRecord}
          onDelete={handleDelete}
          color="orange"
        />
      </div>

      {/* ── Edit Modal ── */}
      {selectedRecord && (
        <AttendanceEditForm
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={fetchData}
        />
      )}

      {/* ── Delete All Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Delete All Records</h2>
                <p className="text-xs text-slate-500">ఈ action reversible కాదు!</p>
              </div>
            </div>

            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Group</span>
                <span className="font-bold text-slate-800">{group}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Year</span>
                <span className="font-bold text-slate-800">{year}</span>
              </div>
              {startDate && endDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Date Range</span>
                  <span className="font-bold text-slate-800">{startDate} → {endDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Sessions</span>
                <span className="font-bold text-red-600">FN + AN అన్నీ</span>
              </div>
            </div>

            <p className="mb-2 text-sm text-slate-600">
              Confirm చేయడానికి{" "}
              <span className="rounded bg-red-100 px-1.5 py-0.5 font-mono font-bold text-red-600">DELETE</span>{" "}
              అని type చేయండి:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mb-5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm font-bold tracking-widest focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition ${
                  deleteConfirmText === "DELETE" && !isDeleting
                    ? "bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg"
                    : "cursor-not-allowed bg-red-300"
                }`}
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </span>
                ) : "🗑️ Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reusable Session Table ── */
function SessionTable({ title, subtitle, icon, records, startDate, endDate, presentCount, absentCount, onEdit, onDelete, color }) {
  const borderColor = color === "amber" ? "border-amber-200" : "border-orange-200";
  const bgColor = color === "amber" ? "bg-amber-50" : "bg-orange-50";
  const textColor = color === "amber" ? "text-amber-700" : "text-orange-700";
  const badgeBg = color === "amber" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700";

  return (
    <div className={`rounded-2xl border bg-white shadow-sm overflow-hidden ${borderColor}`}>
      {/* Table Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${bgColor} ${borderColor}`}>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className={`font-bold ${textColor}`}>{title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badgeBg}`}>{subtitle}</span>
          {(startDate || endDate) && (
            <span className="rounded-full bg-white/80 border px-2 py-0.5 text-xs text-slate-500 font-medium">
              {startDate || "..."} → {endDate || "..."}
            </span>
          )}
        </div>
        <div className="flex gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 size={13} /> {presentCount} Present
          </span>
          <span className="flex items-center gap-1 text-rose-600">
            <XCircle size={13} /> {absentCount} Absent
          </span>
        </div>
      </div>

      {/* Table Body */}
      {records.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="w-12 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">S.No</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Student Name</th>
                <th className="w-28 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-400">Status</th>
                <th className="w-24 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-slate-400 print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r, i) => (
                <tr key={r._id} className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="px-4 py-3 text-xs font-bold text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-700">{r.student || "N/A"}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.present ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={11} /> Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
                        <XCircle size={11} /> Absent
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 print:hidden">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onEdit(r)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-600 transition hover:bg-blue-100 hover:shadow-sm"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${bgColor}`}>
            {icon}
          </div>
          <p className="font-semibold text-slate-400">No {subtitle} Records Found</p>
          <p className="mt-1 text-xs text-slate-300">
            {!startDate ? "Date select చేసి Get Report నొక్కండి" : "ఈ range లో records లేవు"}
          </p>
        </div>
      )}

      {/* Table Footer */}
      {records.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-400 font-medium flex justify-between">
          <span>Total: {records.length} students</span>
          <span>
            {records.length > 0
              ? `${Math.round((presentCount / records.length) * 100)}% attendance`
              : ""}
          </span>
        </div>
      )}
    </div>
  );
}
