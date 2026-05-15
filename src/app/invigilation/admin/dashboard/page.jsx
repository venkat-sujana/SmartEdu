//src/app/invigilation/dashboard/page.jsx
"use client";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";
import {
  UserPlus, CalendarPlus, ClipboardCheck, Filter, Zap,
  FileSpreadsheet, FileText, Users, BookOpen, Building2,
  Phone, Shield, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, RefreshCw, Plus, LayoutDashboard, Calendar,
  Hash, GraduationCap, Search
} from "lucide-react";

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

// ── UI Primitives ────────────────────────────────────────────────────
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
    violet: "bg-violet-100 text-violet-600",
    amber:  "bg-amber-100 text-amber-600",
    rose:   "bg-rose-100 text-rose-600",
    slate:  "bg-slate-100 text-slate-600",
  };
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">{icon}</span>
        )}
        <input
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 ${icon ? "pl-9" : "pl-3"}`}
          {...props}
        />
      </div>
    </div>
  );
}

function FormSelect({ label, icon, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">{icon}</span>
        )}
        <select
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 text-sm text-slate-700 transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 ${icon ? "pl-9" : "pl-3"}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
      </div>
    </div>
  );
}

function SubmitBtn({ children, color = "blue", loading }) {
  const colors = {
    blue:   "bg-blue-600 hover:bg-blue-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    emerald:"bg-emerald-600 hover:bg-emerald-700",
    violet: "bg-violet-600 hover:bg-violet-700",
  };
  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 ${colors[color]}`}
    >
      {loading
        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        : children}
    </button>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    emerald:"bg-emerald-100 text-emerald-700",
    rose:   "bg-rose-100 text-rose-700",
    amber:  "bg-amber-100 text-amber-700",
    blue:   "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    violet: "bg-violet-100 text-violet-700",
    slate:  "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${map[color]}`}>
      {children}
    </span>
  );
}

function SessionBadge({ session }) {
  const map = { FN: "amber", AN: "blue", EN: "violet" };
  return <Badge color={map[session] || "slate"}>{session}</Badge>;
}

function AvailabilityBadge({ value }) {
  if (!value) return <Badge color="slate">—</Badge>;
  const low = value.toLowerCase();
  if (low === "available")   return <Badge color="emerald"><CheckCircle2 size={10}/> Available</Badge>;
  if (low === "unavailable") return <Badge color="rose"><XCircle size={10}/> Unavailable</Badge>;
  return <Badge color="amber"><AlertCircle size={10}/> {value}</Badge>;
}
// ────────────────────────────────────────────────────────────────────

export default function AdminInvigilationDashboardPage() {
  const [lecturers, setLecturers] = useState([]);
  const [exams,     setExams]     = useState([]);
  const [duties,    setDuties]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  const [lecturerForm, setLecturerForm] = useState({ name: "", designation: "", institutionName: "", phone: "", password: "" });
  const [examForm,     setExamForm]     = useState({ date: "", session: "FN", subject: "", hallNo: "" });
  const [dutyForm,     setDutyForm]     = useState({ examScheduleId: "", lecturerId: "" });
  const [filters,      setFilters]      = useState({ date: "", lecturerId: "", session: "" });

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchAll = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (activeFilters.date)       qp.set("date",       activeFilters.date);
      if (activeFilters.lecturerId) qp.set("lecturerId", activeFilters.lecturerId);
      if (activeFilters.session)    qp.set("session",    activeFilters.session);

      const [lRes, eRes, dRes] = await Promise.all([
        fetch("/api/invigilation/lecturers", { cache: "no-store" }),
        fetch("/api/invigilation/exams",     { cache: "no-store" }),
        fetch(`/api/invigilation/duties?${qp}`, { cache: "no-store" }),
      ]);
      const [lData, eData, dData] = await Promise.all([lRes.json(), eRes.json(), dRes.json()]);
      if (!lRes.ok || !eRes.ok || !dRes.ok) throw new Error(lData.message || eData.message || dData.message || "Failed");
      setLecturers(lData.data || []);
      setExams(eData.data     || []);
      setDuties(dData.data    || []);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Handlers ─────────────────────────────────────────────────────
  const onCreateLecturer = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/invigilation/lecturers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lecturerForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Lecturer added. Login: ${data.loginId} | Pass: ${data.tempPassword}`);
      setLecturerForm({ name: "", designation: "", institutionName: "", phone: "", password: "" });
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const onCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/invigilation/exams", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(examForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Exam schedule created");
      setExamForm({ date: "", session: "FN", subject: "", hallNo: "" });
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const onAssignDuty = async (e) => {
    e.preventDefault();
    try {
      const res  = await fetch("/api/invigilation/duties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dutyForm) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Duty assigned");
      setDutyForm({ examScheduleId: "", lecturerId: "" });
      fetchAll();
    } catch (err) { toast.error(err.message || "Failed"); }
  };

  const onAutoAssign = async () => {
    setAutoLoading(true);
    try {
      const res  = await fetch("/api/invigilation/duties/auto-assign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: filters.date || undefined, session: filters.session || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${data.message} — Assigned: ${data.assigned}, Skipped: ${data.skipped}`);
      fetchAll();
    } catch (err) { toast.error(err.message || "Auto failed"); }
    finally { setAutoLoading(false); }
  };

  // ── Export ────────────────────────────────────────────────────────
  const exportRows = useMemo(() =>
    duties.map((d, idx) => ({
      SNo: idx + 1,
      Date:         d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "",
      Session:      d.examScheduleId?.session  || "",
      Subject:      d.examScheduleId?.subject  || "",
      HallNo:       d.examScheduleId?.hallNo   || "",
      Lecturer:     d.lecturerId?.name         || "",
      Availability: d.availability,
    })), [duties]);

  const exportExcel = () => {
    const ws = utils.json_to_sheet(exportRows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Duties");
    writeFile(wb, `invigilation-duties-${Date.now()}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invigilation Duty Assignment Report", 14, 14);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);
    doc.text(`Filters → Date: ${filters.date||"All"} | Lecturer: ${lecturers.find((l)=>l.id===filters.lecturerId)?.name||"All"} | Session: ${filters.session||"All"}`, 14, 26);
    doc.autoTable({
      startY: 32,
      head: [["Date","Session","Subject","Hall","Lecturer","Availability"]],
      body: exportRows.map((r) => [r.Date, r.Session, r.Subject, r.HallNo, r.Lecturer, r.Availability]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30,64,175], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241,245,249] },
      margin: { left: 10, right: 10 },
    });
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) { doc.setPage(i); doc.setFontSize(9); doc.text(`Page ${i} of ${pages}`, 180, 290, { align: "right" }); }
    doc.save(`invigilation-duties-${Date.now()}.pdf`);
  };

  // ── Stats ─────────────────────────────────────────────────────────
  const stats = [
    { label: "Lecturers",    value: lecturers.length, icon: <Users size={16}/>,         color: "blue"    },
    { label: "Exam Slots",   value: exams.length,     icon: <Calendar size={16}/>,      color: "indigo"  },
    { label: "Duties",       value: duties.length,    icon: <ClipboardCheck size={16}/>,color: "violet"  },
    {
      label: "Available",
      value: duties.filter((d) => d.availability?.toLowerCase() === "available").length,
      icon: <CheckCircle2 size={16}/>,
      color: "emerald"
    },
  ];

  // ── Render ────────────────────────────────────────────────────────
  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <InvigilationShell user={user} title="Admin — Invigilation Duty Management">
          <div className="min-h-screen space-y-6 bg-slate-50 p-6">

            {/* ── Page Header ── */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
                  <Shield size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">Invigilation Management</h1>
                  <p className="text-xs font-medium text-slate-400">Manage exams, lecturers & duty assignments</p>
                </div>
              </div>
              <button
                onClick={() => fetchAll()}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map(({ label, value, icon, color }) => {
                const bg  = { blue:"bg-blue-100 text-blue-600", indigo:"bg-indigo-100 text-indigo-600", violet:"bg-violet-100 text-violet-600", emerald:"bg-emerald-100 text-emerald-600" };
                const val = { blue:"text-blue-700",             indigo:"text-indigo-700",             violet:"text-violet-700",             emerald:"text-emerald-700" };
                return (
                  <Card key={label} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg[color]}`}>{icon}</div>
                    </div>
                    <p className={`text-2xl font-black ${val[color]}`}>{value}</p>
                  </Card>
                );
              })}
            </div>

            {/* ── Three Forms ── */}
            <div className="grid gap-5 lg:grid-cols-3">

              {/* Add Lecturer */}
              <Card>
                <CardHeader icon={<UserPlus size={16}/>} title="Add Lecturer" subtitle="Register new invigilator" color="blue" />
                <form onSubmit={onCreateLecturer} className="space-y-3 p-5">
                  <FormInput label="Full Name"    icon={<GraduationCap size={14}/>} placeholder="e.g. Dr. K. Ramesh" required value={lecturerForm.name}            onChange={(e)=>setLecturerForm((s)=>({...s,name:e.target.value}))} />
                  <FormInput label="Designation"  icon={<Shield size={14}/>}        placeholder="e.g. Professor"      required value={lecturerForm.designation}     onChange={(e)=>setLecturerForm((s)=>({...s,designation:e.target.value}))} />
                  <FormInput label="Institution"  icon={<Building2 size={14}/>}     placeholder="School / College"    required value={lecturerForm.institutionName} onChange={(e)=>setLecturerForm((s)=>({...s,institutionName:e.target.value}))} />
                  <FormInput label="Phone"        icon={<Phone size={14}/>}         placeholder="10-digit mobile"     required value={lecturerForm.phone}           onChange={(e)=>setLecturerForm((s)=>({...s,phone:e.target.value}))} />
                  <FormInput label="Password"     icon={<Shield size={14}/>}        placeholder="Leave blank for auto" type="password" value={lecturerForm.password} onChange={(e)=>setLecturerForm((s)=>({...s,password:e.target.value}))} />
                  <SubmitBtn color="blue"><Plus size={15}/> Add Lecturer</SubmitBtn>
                </form>
              </Card>

              {/* Create Exam */}
              <Card>
                <CardHeader icon={<CalendarPlus size={16}/>} title="Create Exam Schedule" subtitle="Add new exam slot" color="indigo" />
                <form onSubmit={onCreateExam} className="space-y-3 p-5">
                  <FormInput   label="Exam Date"   icon={<Calendar size={14}/>}  type="date" required value={examForm.date}    onChange={(e)=>setExamForm((s)=>({...s,date:e.target.value}))} />
                  <FormSelect  label="Session"     icon={<Clock size={14}/>}     value={examForm.session} onChange={(e)=>setExamForm((s)=>({...s,session:e.target.value}))}>
                    <option value="FN">FN — Forenoon</option>
                    <option value="AN">AN — Afternoon</option>
                    <option value="EN">EN — Evening</option>
                  </FormSelect>
                  <FormInput   label="Subject"     icon={<BookOpen size={14}/>}  placeholder="e.g. Mathematics" required value={examForm.subject}  onChange={(e)=>setExamForm((s)=>({...s,subject:e.target.value}))} />
                  <FormInput   label="Hall No"     icon={<Hash size={14}/>}      placeholder="e.g. H-101"        required value={examForm.hallNo}   onChange={(e)=>setExamForm((s)=>({...s,hallNo:e.target.value}))} />
                  <SubmitBtn color="indigo"><Plus size={15}/> Create Schedule</SubmitBtn>
                </form>
              </Card>

              {/* Assign Duty */}
              <Card>
                <CardHeader icon={<ClipboardCheck size={16}/>} title="Assign Duty" subtitle="Link lecturer to exam" color="violet" />
                <form onSubmit={onAssignDuty} className="space-y-3 p-5">
                  <FormSelect label="Select Exam" icon={<Calendar size={14}/>} required value={dutyForm.examScheduleId} onChange={(e)=>setDutyForm((s)=>({...s,examScheduleId:e.target.value}))}>
                    <option value="">Choose Exam Slot</option>
                    {exams.map((e) => (
                      <option key={e._id} value={e._id}>
                        {formatDate(e.date)} · {e.session} · {e.subject} · Hall {e.hallNo}
                      </option>
                    ))}
                  </FormSelect>
                  <FormSelect label="Select Lecturer" icon={<GraduationCap size={14}/>} required value={dutyForm.lecturerId} onChange={(e)=>setDutyForm((s)=>({...s,lecturerId:e.target.value}))}>
                    <option value="">Choose Lecturer</option>
                    {lecturers.map((l) => (
                      <option key={l.id} value={l.id}>{l.name} — {l.designation}</option>
                    ))}
                  </FormSelect>

                  {/* Exam & Lecturer count info */}
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl bg-indigo-50 px-3 py-2 text-center">
                      <p className="text-xs text-indigo-400 font-medium">Exams</p>
                      <p className="text-lg font-black text-indigo-700">{exams.length}</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-violet-50 px-3 py-2 text-center">
                      <p className="text-xs text-violet-400 font-medium">Lecturers</p>
                      <p className="text-lg font-black text-violet-700">{lecturers.length}</p>
                    </div>
                  </div>

                  <SubmitBtn color="violet"><ClipboardCheck size={15}/> Assign Duty</SubmitBtn>
                </form>
              </Card>
            </div>

            {/* ── Filters + Table ── */}
            <Card>
              {/* Filter Bar */}
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Date</label>
                    <div className="relative">
                      <Calendar size={13} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters((s) => ({ ...s, date: e.target.value }))}
                        className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Lecturer</label>
                    <div className="relative">
                      <Users size={13} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
                      <select
                        value={filters.lecturerId}
                        onChange={(e) => setFilters((s) => ({ ...s, lecturerId: e.target.value }))}
                        className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">All Lecturers</option>
                        {lecturers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                      <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Session</label>
                    <div className="relative">
                      <Clock size={13} className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
                      <select
                        value={filters.session}
                        onChange={(e) => setFilters((s) => ({ ...s, session: e.target.value }))}
                        className="appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">All Sessions</option>
                        <option value="FN">FN</option>
                        <option value="AN">AN</option>
                        <option value="EN">EN</option>
                      </select>
                      <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
                    </div>
                  </div>

                  <button
                    onClick={() => fetchAll(filters)}
                    className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
                  >
                    <Search size={14}/> Apply Filters
                  </button>

                  <button
                    onClick={onAutoAssign}
                    disabled={autoLoading}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
                  >
                    {autoLoading
                      ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"/>
                      : <Zap size={14}/>}
                    Auto Assign
                  </button>

                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={exportExcel}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <FileSpreadsheet size={13}/> Excel
                    </button>
                    <button
                      onClick={exportPdf}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      <FileText size={13}/> PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Duties Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      {["#","Date","Session","Subject","Hall No","Lecturer","Availability"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {duties.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            {loading
                              ? <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"/>
                              : <>
                                  <ClipboardCheck size={28} className="opacity-30"/>
                                  <p className="text-sm font-medium">No duty assignments found</p>
                                  <p className="text-xs">Filters change చేయండి లేదా Auto Assign వాడండి</p>
                                </>
                            }
                          </div>
                        </td>
                      </tr>
                    ) : (
                      duties.map((d, i) => (
                        <tr key={d._id} className={`transition-colors hover:bg-slate-50 ${i%2===0?"bg-white":"bg-slate-50/40"}`}>
                          <td className="px-5 py-3 text-xs font-bold text-slate-400">{i+1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-slate-400"/>
                              <span className="font-semibold text-slate-700">
                                {d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <SessionBadge session={d.examScheduleId?.session || "—"} />
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-700">
                            {d.examScheduleId?.subject || "—"}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <Hash size={12} className="text-slate-400"/>
                              <span className="font-mono text-xs font-semibold text-slate-600">
                                {d.examScheduleId?.hallNo || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600">
                                {d.lecturerId?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="font-semibold text-slate-700">{d.lecturerId?.name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <AvailabilityBadge value={d.availability} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Table Footer */}
                {duties.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs font-medium text-slate-400">
                    Total {duties.length} duty assignments
                    {duties.filter((d)=>d.availability?.toLowerCase()==="available").length > 0 &&
                      ` · ${duties.filter((d)=>d.availability?.toLowerCase()==="available").length} available`}
                  </div>
                )}
              </div>
            </Card>

          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}
