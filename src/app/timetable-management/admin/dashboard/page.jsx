//src/app/timetable-management/admin/dashboard/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import TimetableShell from "@/app/timetable-management/components/TimetableShell";
import TimetableGrid from "@/app/timetable-management/components/TimetableGrid";
import {
  UserPlus, BookOpen, CalendarDays, Zap, FileSpreadsheet,
  FileText, Pencil, Trash2, Clock, Users, GraduationCap,
  LayoutGrid, ChevronDown, Building2, Layers, CheckCircle2,
  AlertCircle, RefreshCw, Plus
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ── Reusable UI primitives ──────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle, color = "blue" }) {
  const colors = {
    blue:   "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    emerald:"bg-emerald-100 text-emerald-600",
    amber:  "bg-amber-100 text-amber-600",
    rose:   "bg-rose-100 text-rose-600",
  };
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormInput({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <input
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        {...props}
      />
    </div>
  );
}

function FormSelect({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <div className="relative">
        <select
          className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm text-slate-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
      </div>
    </div>
  );
}

function PrimaryBtn({ children, loading, className = "", ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60 ${className}`}
      disabled={loading}
      {...props}
    >
      {loading
        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        : children}
    </button>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose:    "bg-rose-100 text-rose-700",
    amber:   "bg-amber-100 text-amber-700",
    blue:    "bg-blue-100 text-blue-700",
    slate:   "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${map[color]}`}>
      {children}
    </span>
  );
}
// ───────────────────────────────────────────────────────────────────

export default function TimeTableAdminDashboard() {
  const [lecturers, setLecturers]   = useState([]);
  const [subjects,  setSubjects]    = useState([]);
  const [gridData,  setGridData]    = useState({ timetable: null, slots: [] });
  const [loading,   setLoading]     = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const [filters, setFilters] = useState({ year: 1, semester: 1, classroom: "A101" });
  const [lecturerForm, setLecturerForm] = useState({ name: "", maxHoursPerWeek: 24, password: "" });
  const [subjectForm,  setSubjectForm]  = useState({ subjectName: "", year: 1, semester: 1, hoursPerWeek: 4, lecturerId: "" });
  const [manualForm,   setManualForm]   = useState({ day: "Monday", period: 1, subjectId: "", lecturerId: "" });

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lRes, sRes, gRes] = await Promise.all([
        fetch("/api/timetable/lecturers", { cache: "no-store" }),
        fetch(`/api/timetable/subjects?year=${filters.year}&semester=${filters.semester}`, { cache: "no-store" }),
        fetch(`/api/timetable/manual?year=${filters.year}&semester=${filters.semester}&classroom=${encodeURIComponent(filters.classroom)}`, { cache: "no-store" }),
      ]);
      const [lData, sData, gData] = await Promise.all([lRes.json(), sRes.json(), gRes.json()]);
      if (!lRes.ok || !sRes.ok || !gRes.ok) throw new Error(lData.message || sData.message || gData.message || "Failed to load");
      setLecturers(lData.data || []);
      setSubjects(sData.data || []);
      setGridData(gData.data || { timetable: null, slots: [] });
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, [filters.year, filters.semester, filters.classroom]);

  // ── Handlers ──────────────────────────────────────────────────────
  const createLecturer = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/timetable/lecturers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lecturerForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Lecturer created.${data?.meta?.loginId ? ` Login ID: ${data.meta.loginId}` : ""}`);
      setLecturerForm({ name: "", maxHoursPerWeek: 24, password: "" });
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/timetable/subjects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...subjectForm, year: Number(filters.year), semester: Number(filters.semester) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Subject created");
      setSubjectForm((s) => ({ ...s, subjectName: "", lecturerId: "" }));
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const assignManual = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/timetable/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: Number(filters.year), semester: Number(filters.semester), classroom: filters.classroom, ...manualForm }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Slot assigned");
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const runAuto = async () => {
    setAutoLoading(true);
    try {
      const res  = await fetch("/api/timetable/auto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ year: Number(filters.year), semester: Number(filters.semester), classroom: filters.classroom }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Auto timetable generated. Unallocated: ${data.data?.unallocatedSubjects?.length || 0}`);
      fetchAll();
    } catch (err) { toast.error(err.message || "Auto generation failed"); }
    finally { setAutoLoading(false); }
  };

  const onDeleteSlot = async (slot) => {
    if (!gridData?.timetable?._id) return;
    try {
      const qs  = new URLSearchParams({ timetableId: String(gridData.timetable._id), day: slot.day, period: String(slot.period) });
      const res = await fetch(`/api/timetable/manual?${qs}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Slot deleted");
      fetchAll();
    } catch (err) { toast.error(err.message || "Delete failed"); }
  };

  const onDeleteLecturer = async (id) => {
    if (!id || !window.confirm("Delete this lecturer?")) return;
    try {
      const res = await fetch(`/api/timetable/lecturers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Lecturer deleted"); fetchAll();
    } catch (err) { toast.error(err.message || "Delete failed"); }
  };

  const onEditLecturer = async (lecturer) => {
    if (!lecturer?._id) return;
    const name     = window.prompt("Lecturer name", lecturer.name || ""); if (name === null) return;
    const maxHours = window.prompt("Max Hours/Week", String(lecturer.maxHoursPerWeek || 24)); if (maxHours === null) return;
    try {
      const res = await fetch(`/api/timetable/lecturers/${lecturer._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), maxHoursPerWeek: Number(maxHours) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Lecturer updated"); fetchAll();
    } catch (err) { toast.error(err.message || "Update failed"); }
  };

  const onDeleteSubject = async (id) => {
    if (!id || !window.confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`/api/timetable/subjects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Subject deleted"); fetchAll();
    } catch (err) { toast.error(err.message || "Delete failed"); }
  };

  const onEditSubject = async (subject) => {
    if (!subject?._id) return;
    const subjectName  = window.prompt("Subject name", subject.subjectName || ""); if (subjectName === null) return;
    const hoursPerWeek = window.prompt("Hours per week", String(subject.hoursPerWeek || 1)); if (hoursPerWeek === null) return;
    try {
      const res = await fetch(`/api/timetable/subjects/${subject._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subjectName: subjectName.trim(), hoursPerWeek: Number(hoursPerWeek) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Subject updated"); fetchAll();
    } catch (err) { toast.error(err.message || "Update failed"); }
  };

  // ── Export ────────────────────────────────────────────────────────
  const exportRows = useMemo(() =>
    (gridData?.slots || []).map((s) => ({
      Day: s.day, Period: s.period,
      Subject: s.subjectId?.subjectName || "",
      Lecturer: s.lecturerId?.name || "",
      Classroom: s.classroom,
    })), [gridData]);

  const exportExcel = () => {
    const ws = utils.json_to_sheet(exportRows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Timetable");
    writeFile(wb, `timetable-y${filters.year}-s${filters.semester}-${filters.classroom}-${Date.now()}.xlsx`);
  };

  const exportPdf = () => {
  const doc = new jsPDF();
  doc.setFontSize(15);
  doc.text(`Time Table — Year ${filters.year} Semester ${filters.semester}`, 14, 14);
  doc.setFontSize(10);
  doc.text(`Classroom: ${filters.classroom}`, 14, 20);

  // ✅ doc.autoTable() కాదు — autoTable(doc, ...) గా వాడండి
  autoTable(doc, {
    startY: 26,
    head: [["Day", "Period", "Subject", "Lecturer", "Classroom"]],
    body: exportRows.map((r) => [r.Day, r.Period, r.Subject, r.Lecturer, r.Classroom]),
    headStyles: { fillColor: [67, 56, 202], textColor: 255 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 10, right: 10 },
  });

  doc.save(`timetable-y${filters.year}-s${filters.semester}-${filters.classroom}-${Date.now()}.pdf`);
};

  // ── Stats ─────────────────────────────────────────────────────────
  const totalSlots      = gridData?.slots?.length || 0;
  const totalLecturers  = lecturers.length;
  const totalSubjects   = subjects.length;
  const allocatedSlots  = gridData?.slots?.filter((s) => s.subjectId)?.length || 0;

  // ── Render ────────────────────────────────────────────────────────
  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <TimetableShell user={user} title="Admin — Time Table Management">
          <div className="min-h-screen space-y-6 bg-slate-50 p-6">

            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
                  <LayoutGrid size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">Time Table Management</h1>
                  <p className="text-xs text-slate-400 font-medium">Manage lecturers, subjects & schedules</p>
                </div>
              </div>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total Slots",     value: totalSlots,     icon: <CalendarDays size={16}/>, color: "blue"    },
                { label: "Lecturers",        value: totalLecturers, icon: <Users size={16}/>,        color: "indigo"  },
                { label: "Subjects",         value: totalSubjects,  icon: <BookOpen size={16}/>,     color: "emerald" },
                { label: "Allocated Slots",  value: allocatedSlots, icon: <CheckCircle2 size={16}/>, color: "amber"   },
              ].map(({ label, value, icon, color }) => {
                const bg  = { blue:"bg-blue-100 text-blue-600", indigo:"bg-indigo-100 text-indigo-600", emerald:"bg-emerald-100 text-emerald-600", amber:"bg-amber-100 text-amber-600" };
                const val = { blue:"text-blue-700", indigo:"text-indigo-700", emerald:"text-emerald-700", amber:"text-amber-700" };
                return (
                  <Card key={label} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg[color]}`}>{icon}</div>
                    </div>
                    <p className={`text-2xl font-black ${val[color]}`}>{value}</p>
                  </Card>
                );
              })}
            </div>

            {/* ── Filters ── */}
            <Card>
              <CardHeader icon={<Layers size={16}/>} title="Filters" subtitle="Year · Semester · Classroom" color="blue" />
              <div className="grid gap-4 p-5 sm:grid-cols-3">
                <FormInput
                  label="Year"
                  type="number" min={1} max={6}
                  value={filters.year}
                  onChange={(e) => setFilters((s) => ({ ...s, year: Number(e.target.value) }))}
                  placeholder="Year"
                />
                <FormInput
                  label="Semester"
                  type="number" min={1} max={2}
                  value={filters.semester}
                  onChange={(e) => setFilters((s) => ({ ...s, semester: Number(e.target.value) }))}
                  placeholder="Semester"
                />
                <FormInput
                  label="Classroom"
                  value={filters.classroom}
                  onChange={(e) => setFilters((s) => ({ ...s, classroom: e.target.value }))}
                  placeholder="e.g. A101"
                />
              </div>
            </Card>

            {/* ── Three Forms ── */}
            <div className="grid gap-5 xl:grid-cols-3">

              {/* Create Lecturer */}
              <Card>
                <CardHeader icon={<UserPlus size={16}/>} title="Create Lecturer" subtitle="Add new faculty member" color="indigo" />
                <form onSubmit={createLecturer} className="space-y-3 p-5">
                  <FormInput label="Full Name" placeholder="e.g. Dr. K. Ramesh" required value={lecturerForm.name} onChange={(e) => setLecturerForm((s) => ({ ...s, name: e.target.value }))} />
                  <FormInput label="Max Hours / Week" type="number" min={1} max={60} required value={lecturerForm.maxHoursPerWeek} onChange={(e) => setLecturerForm((s) => ({ ...s, maxHoursPerWeek: Number(e.target.value) }))} />
                  <FormInput label="Password (optional)" type="password" placeholder="Leave blank for auto" value={lecturerForm.password} onChange={(e) => setLecturerForm((s) => ({ ...s, password: e.target.value }))} />
                  <PrimaryBtn type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Plus size={15} /> Create Lecturer
                  </PrimaryBtn>
                </form>
              </Card>

              {/* Create Subject */}
              <Card>
                <CardHeader icon={<BookOpen size={16}/>} title="Create Subject" subtitle="Add subject for selected year/sem" color="emerald" />
                <form onSubmit={createSubject} className="space-y-3 p-5">
                  <FormInput label="Subject Name" placeholder="e.g. Mathematics" required value={subjectForm.subjectName} onChange={(e) => setSubjectForm((s) => ({ ...s, subjectName: e.target.value }))} />
                  <FormInput label="Hours / Week" type="number" min={1} max={30} required value={subjectForm.hoursPerWeek} onChange={(e) => setSubjectForm((s) => ({ ...s, hoursPerWeek: Number(e.target.value) }))} />
                  <FormSelect label="Assign Lecturer" required value={subjectForm.lecturerId} onChange={(e) => setSubjectForm((s) => ({ ...s, lecturerId: e.target.value }))}>
                    <option value="">Select Lecturer</option>
                    {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>)}
                  </FormSelect>
                  <PrimaryBtn type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Plus size={15} /> Create Subject
                  </PrimaryBtn>
                </form>
              </Card>

              {/* Manual Slot */}
              <Card>
                <CardHeader icon={<CalendarDays size={16}/>} title="Manual Slot Assignment" subtitle="Assign a specific period" color="amber" />
                <form onSubmit={assignManual} className="space-y-3 p-5">
                  <FormSelect label="Day" value={manualForm.day} onChange={(e) => setManualForm((s) => ({ ...s, day: e.target.value }))}>
                    {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </FormSelect>
                  <FormInput label="Period" type="number" min={1} max={8} value={manualForm.period} onChange={(e) => setManualForm((s) => ({ ...s, period: Number(e.target.value) }))} />
                  <FormSelect label="Subject" required value={manualForm.subjectId} onChange={(e) => setManualForm((s) => ({ ...s, subjectId: e.target.value }))}>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                  </FormSelect>
                  <FormSelect label="Lecturer" required value={manualForm.lecturerId} onChange={(e) => setManualForm((s) => ({ ...s, lecturerId: e.target.value }))}>
                    <option value="">Select Lecturer</option>
                    {lecturers.map((l) => <option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>)}
                  </FormSelect>
                  <div className="flex gap-2 pt-1">
                    <PrimaryBtn type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600">
                      <CalendarDays size={14} /> Assign
                    </PrimaryBtn>
                    <button
                      type="button"
                      onClick={runAuto}
                      disabled={autoLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
                    >
                      {autoLoading
                        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        : <><Zap size={14} /> Auto</>
                      }
                    </button>
                  </div>
                </form>
              </Card>
            </div>

            {/* ── Timetable Grid ── */}
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <LayoutGrid size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Timetable Grid</h3>
                    <p className="text-xs text-slate-400">
                      Year {filters.year} · Sem {filters.semester} · {filters.classroom}
                      {loading ? " · Loading..." : ` · ${totalSlots} slots`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportExcel}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <FileSpreadsheet size={13} /> Excel
                  </button>
                  <button
                    onClick={exportPdf}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <FileText size={13} /> PDF
                  </button>
                </div>
              </div>
              <div className="p-5">
                {loading ? (
                  <div className="flex items-center justify-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                      <p className="text-sm font-medium">Loading timetable...</p>
                    </div>
                  </div>
                ) : (
                  <TimetableGrid slots={gridData?.slots || []} onDeleteSlot={onDeleteSlot} />
                )}
              </div>
            </Card>

            {/* ── Lecturers & Subjects Tables ── */}
            <div className="grid gap-5 xl:grid-cols-2">

              {/* Lecturers */}
              <Card>
                <CardHeader icon={<Users size={16}/>} title="Lecturers" subtitle={`${totalLecturers} faculty members`} color="indigo" />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Load</th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {lecturers.length === 0 && !loading ? (
                        <tr>
                          <td colSpan={3} className="py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <Users size={24} className="opacity-40" />
                              <p className="text-sm font-medium">No lecturers found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        lecturers.map((l, i) => {
                          const pct = l.maxHoursPerWeek ? Math.round(((l.allocatedHours||0)/l.maxHoursPerWeek)*100) : 0;
                          const overloaded = pct >= 100;
                          return (
                            <tr key={l._id} className={`transition-colors hover:bg-slate-50 ${i%2===0?"bg-white":"bg-slate-50/40"}`}>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                                    {l.name?.[0]?.toUpperCase() || "?"}
                                  </div>
                                  <span className="font-semibold text-slate-700">{l.name}</span>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-slate-500">{l.allocatedHours||0}/{l.maxHoursPerWeek||0}h</span>
                                  <Badge color={overloaded ? "rose" : "emerald"}>
                                    {overloaded ? "Full" : "OK"}
                                  </Badge>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex gap-2">
                                  <button onClick={() => onEditLecturer(l)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100">
                                    <Pencil size={12} />
                                  </button>
                                  <button onClick={() => onDeleteLecturer(l._id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Subjects */}
              <Card>
                <CardHeader icon={<BookOpen size={16}/>} title="Subjects" subtitle={`${totalSubjects} for Year ${filters.year} · Sem ${filters.semester}`} color="emerald" />
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Subject</th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Hrs/Wk</th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Lecturer</th>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {subjects.length === 0 && !loading ? (
                        <tr>
                          <td colSpan={4} className="py-10 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <BookOpen size={24} className="opacity-40" />
                              <p className="text-sm font-medium">No subjects for this year/semester</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        subjects.map((s, i) => (
                          <tr key={s._id} className={`transition-colors hover:bg-slate-50 ${i%2===0?"bg-white":"bg-slate-50/40"}`}>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-600">
                                  {s.subjectName?.[0]?.toUpperCase() || "S"}
                                </div>
                                <span className="font-semibold text-slate-700">{s.subjectName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <Badge color="blue">{s.hoursPerWeek}h</Badge>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{s.lecturerId?.name || <span className="text-rose-400">Unassigned</span>}</td>
                            <td className="px-5 py-3">
                              <div className="flex gap-2">
                                <button onClick={() => onEditSubject(s)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100">
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => onDeleteSubject(s._id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </TimetableShell>
      )}
    </InvigilationGuard>
  );
}
