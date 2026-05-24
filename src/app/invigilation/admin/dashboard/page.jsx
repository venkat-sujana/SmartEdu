"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";
import {
  UserPlus,
  CalendarRange,
  ClipboardCheck,
  Zap,
  FileSpreadsheet,
  FileText,
  Users,
  Building2,
  Phone,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Plus,
  Calendar,
  Hash,
  GraduationCap,
  Search,
  School,
  Layers3,
  BookOpen,
  Pencil,
  Trash2,
} from "lucide-react";

const EXAM_TYPES = [
  "UNIT-1",
  "UNIT-2",
  "UNIT-3",
  "UNIT-4",
  "QUARTERLY",
  "HALFYEARLY",
  "PRE-PUBLIC-1",
  "PRE-PUBLIC-2",
];

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatExamType(examType) {
  return String(examType || "")
    .replace(/HALFYEARLY/g, "HALF YEARLY")
    .replace(/PRE-PUBLIC/g, "PRE PUBLIC")
    .replace(/-/g, " ");
}

function getDayCount(fromDate, toDate) {
  if (!fromDate || !toDate) return 0;
  const start = new Date(fromDate);
  const end = new Date(toDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return 0;
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, subtitle, color = "blue" }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-indigo-100 text-indigo-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {subtitle ? <p className="text-xs text-slate-400">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <label className="text-xs font-semibold text-slate-500">{label}</label> : null}
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">{icon}</span> : null}
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
      {label ? <label className="text-xs font-semibold text-slate-500">{label}</label> : null}
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">{icon}</span> : null}
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
    blue: "bg-blue-600 hover:bg-blue-700",
    indigo: "bg-indigo-600 hover:bg-indigo-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    violet: "bg-violet-600 hover:bg-violet-700",
  };

  return (
    <button
      type="submit"
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 ${colors[color]}`}
    >
      {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : children}
    </button>
  );
}

function Badge({ children, color = "slate" }) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    violet: "bg-violet-100 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
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
  if (!value) return <Badge color="slate">-</Badge>;
  const low = value.toLowerCase();
  if (low === "available") return <Badge color="emerald"><CheckCircle2 size={10} /> Available</Badge>;
  if (low === "unavailable" || low === "not available") return <Badge color="rose"><XCircle size={10} /> Unavailable</Badge>;
  return <Badge color="amber"><AlertCircle size={10} /> {value}</Badge>;
}

function RoomPicker({ rooms, selectedRoomIds, onToggleRoom, onSelectAll }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-600">Select Rooms</p>
          <p className="text-[11px] text-slate-400">All selected rooms get schedules for every day in the range.</p>
        </div>
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          {selectedRoomIds.length === rooms.length && rooms.length > 0 ? "Clear All" : "Select All"}
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-xs text-slate-400">
          Create rooms first, then generate the exam schedule in one click.
        </div>
      ) : (
        <div className="grid max-h-48 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {rooms.map((room) => {
            const checked = selectedRoomIds.includes(room._id);
            return (
              <label
                key={room._id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                  checked
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleRoom(room._id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="min-w-0">
                  <span className="block font-semibold">{room.name}</span>
                  <span className="block text-xs text-slate-400">
                    {room.block || "Main Block"}{room.capacity ? ` | Capacity ${room.capacity}` : ""}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminInvigilationDashboardPage() {
  const [lecturers, setLecturers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [exams, setExams] = useState([]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    designation: "",
    institutionName: "",
    phone: "",
    password: "",
  });
  const [roomForm, setRoomForm] = useState({ name: "", block: "", capacity: "" });
  const [scheduleForm, setScheduleForm] = useState({
    fromDate: "",
    toDate: "",
    session: "FN",
    examType: "UNIT-1",
    roomIds: [],
    maxDutiesPerLecturer: "2",
    sameDayNoRepeat: true,
  });
  const [editingRoomId, setEditingRoomId] = useState("");
  const [editingScheduleId, setEditingScheduleId] = useState("");
  const [singleScheduleForm, setSingleScheduleForm] = useState({
    date: "",
    session: "FN",
    examType: "UNIT-1",
    roomId: "",
  });
  const [dutyForm, setDutyForm] = useState({ examScheduleId: "", lecturerId: "" });
  const [filters, setFilters] = useState({ date: "", lecturerId: "", session: "" });

  const fetchAll = useCallback(async (activeFilters = { date: "", lecturerId: "", session: "" }) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (activeFilters.date) qp.set("date", activeFilters.date);
      if (activeFilters.lecturerId) qp.set("lecturerId", activeFilters.lecturerId);
      if (activeFilters.session) qp.set("session", activeFilters.session);

      const [lRes, rRes, eRes, dRes] = await Promise.all([
        fetch("/api/invigilation/lecturers", { cache: "no-store" }),
        fetch("/api/invigilation/rooms", { cache: "no-store" }),
        fetch("/api/invigilation/exams", { cache: "no-store" }),
        fetch(`/api/invigilation/duties?${qp}`, { cache: "no-store" }),
      ]);

      const [lData, rData, eData, dData] = await Promise.all([
        lRes.json(),
        rRes.json(),
        eRes.json(),
        dRes.json(),
      ]);

      if (!lRes.ok || !rRes.ok || !eRes.ok || !dRes.ok) {
        throw new Error(lData.message || rData.message || eData.message || dData.message || "Failed");
      }

      setLecturers(lData.data || []);
      setRooms(rData.data || []);
      setExams(eData.data || []);
      setDuties(dData.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onCreateLecturer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invigilation/lecturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lecturerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Lecturer added. Login: ${data.loginId} | Pass: ${data.tempPassword}`);
      setLecturerForm({ name: "", designation: "", institutionName: "", phone: "", password: "" });
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const onCreateRoom = async (e) => {
    e.preventDefault();
    setRoomLoading(true);
    try {
      const isEditing = Boolean(editingRoomId);
      const res = await fetch(isEditing ? `/api/invigilation/rooms/${editingRoomId}` : "/api/invigilation/rooms", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(isEditing ? "Room updated" : "Room created");
      setRoomForm({ name: "", block: "", capacity: "" });
      setEditingRoomId("");
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setRoomLoading(false);
    }
  };

  const onCreateSchedule = async (e) => {
    e.preventDefault();
    const scheduleResult = await createScheduleBatch();
    if (!scheduleResult) return;
    setScheduleForm((prev) => ({
      ...prev,
      fromDate: "",
      toDate: "",
      roomIds: [],
    }));
  };

  const resetScheduleEditor = () => {
    setEditingScheduleId("");
    setSingleScheduleForm({
      date: "",
      session: "FN",
      examType: "UNIT-1",
      roomId: "",
    });
  };

  const createScheduleBatch = async () => {
    if (scheduleForm.roomIds.length === 0) {
      toast.error("Select at least one room");
      return null;
    }

    setScheduleLoading(true);
    try {
      const res = await fetch("/api/invigilation/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${data.message} | Created: ${data.createdCount || 0} | Skipped: ${data.skippedCount || 0}`);
      fetchAll(filters);
      return data;
    } catch (err) {
      toast.error(err.message || "Failed");
      return null;
    } finally {
      setScheduleLoading(false);
    }
  };

  const onAssignDuty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invigilation/duties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dutyForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Duty assigned");
      setDutyForm({ examScheduleId: "", lecturerId: "" });
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const onAutoAssign = async () => {
    setAutoLoading(true);
    try {
      const res = await fetch("/api/invigilation/duties/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: filters.date || undefined,
          session: filters.session || undefined,
          maxDutiesPerLecturer: Number(scheduleForm.maxDutiesPerLecturer || 0) || undefined,
          sameDayNoRepeat: scheduleForm.sameDayNoRepeat,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`${data.message} | Assigned: ${data.assigned} | Skipped: ${data.skipped}`);
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Auto assign failed");
    } finally {
      setAutoLoading(false);
    }
  };

  const onGenerateAndAssign = async () => {
    const activeSchedule = { ...scheduleForm };
    const scheduleResult = await createScheduleBatch();
    if (!scheduleResult) return;

    setAutoLoading(true);
    try {
      const res = await fetch("/api/invigilation/duties/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromDate: activeSchedule.fromDate,
          toDate: activeSchedule.toDate,
          session: activeSchedule.session,
          examType: activeSchedule.examType,
          maxDutiesPerLecturer: Number(activeSchedule.maxDutiesPerLecturer || 0) || undefined,
          sameDayNoRepeat: activeSchedule.sameDayNoRepeat,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Schedule generated and duties assigned | Assigned: ${data.assigned} | Skipped: ${data.skipped}`);
      setScheduleForm((prev) => ({
        ...prev,
        fromDate: "",
        toDate: "",
        roomIds: [],
      }));
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Auto assign failed");
    } finally {
      setAutoLoading(false);
    }
  };

  const onUpdateSingleSchedule = async (e) => {
    e.preventDefault();
    if (!editingScheduleId) return;

    setActionLoading(`schedule-save-${editingScheduleId}`);
    try {
      const res = await fetch(`/api/invigilation/exams/${editingScheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(singleScheduleForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Exam schedule updated");
      resetScheduleEditor();
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed to update schedule");
    } finally {
      setActionLoading("");
    }
  };

  const onEditRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      name: room.name || "",
      block: room.block || "",
      capacity: room.capacity ? String(room.capacity) : "",
    });
  };

  const onDeleteRoom = async (room) => {
    if (!window.confirm(`Delete room ${room.name}?`)) return;
    setActionLoading(`room-delete-${room._id}`);
    try {
      const res = await fetch(`/api/invigilation/rooms/${room._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Room deleted${data.deletedSchedules ? ` | Schedules removed: ${data.deletedSchedules}` : ""}`);
      if (editingRoomId === room._id) {
        setEditingRoomId("");
        setRoomForm({ name: "", block: "", capacity: "" });
      }
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed to delete room");
    } finally {
      setActionLoading("");
    }
  };

  const onEditSchedule = (plan) => {
    setEditingScheduleId(plan.id);
    const room = rooms.find((item) => item.name === plan.hallNo);
    setSingleScheduleForm({
      date: formatDate(plan.date),
      session: plan.session,
      examType: plan.examType,
      roomId: room?._id || "",
    });
  };

  const onDeleteSchedule = async (plan) => {
    if (!window.confirm(`Delete schedule for ${plan.hallNo} on ${formatDate(plan.date)}?`)) return;
    setActionLoading(`schedule-delete-${plan.id}`);
    try {
      const res = await fetch(`/api/invigilation/exams/${plan.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success("Exam schedule deleted");
      if (editingScheduleId === plan.id) {
        resetScheduleEditor();
      }
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed to delete schedule");
    } finally {
      setActionLoading("");
    }
  };

  const onDeleteAllSchedules = async () => {
    if (roomSeatingPlan.length === 0) {
      toast.error("No room-wise schedules available to delete");
      return;
    }

    const confirmed = window.confirm(
      `Delete ${roomSeatingPlan.length} schedules from Room-Wise Seating Plan? Linked duty assignments will also be deleted.`
    );
    if (!confirmed) return;

    setActionLoading("schedule-delete-all");
    try {
      const res = await fetch("/api/invigilation/exams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: roomSeatingPlan.map((item) => item.id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Deleted ${data.deletedCount || 0} schedules`);
      if (editingScheduleId) {
        resetScheduleEditor();
      }
      fetchAll(filters);
    } catch (err) {
      toast.error(err.message || "Failed to delete schedules");
    } finally {
      setActionLoading("");
    }
  };

  const toggleRoom = (roomId) => {
    setScheduleForm((prev) => ({
      ...prev,
      roomIds: prev.roomIds.includes(roomId)
        ? prev.roomIds.filter((id) => id !== roomId)
        : [...prev.roomIds, roomId],
    }));
  };

  const toggleAllRooms = () => {
    setScheduleForm((prev) => ({
      ...prev,
      roomIds: prev.roomIds.length === rooms.length ? [] : rooms.map((room) => room._id),
    }));
  };

  const exportRows = useMemo(
    () =>
      duties.map((d, idx) => ({
        SNo: idx + 1,
        Date: d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "",
        Session: d.examScheduleId?.session || "",
        ExamType: d.examScheduleId?.examType || d.examScheduleId?.subject || "",
        HallNo: d.examScheduleId?.hallNo || "",
        Lecturer: d.lecturerId?.name || "",
        Availability: d.availability,
      })),
    [duties]
  );

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
    doc.text(
      `Filters | Date: ${filters.date || "All"} | Lecturer: ${lecturers.find((l) => l.id === filters.lecturerId)?.name || "All"} | Session: ${filters.session || "All"}`,
      14,
      26
    );
    autoTable(doc, {
      startY: 32,
      head: [["Date", "Session", "Exam Type", "Hall", "Lecturer", "Availability"]],
      body: exportRows.map((r) => [r.Date, r.Session, r.ExamType, r.HallNo, r.Lecturer, r.Availability]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 10, right: 10 },
    });
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pages}`, 180, 290, { align: "right" });
    }
    doc.save(`invigilation-duties-${Date.now()}.pdf`);
  };

  const totalDays = useMemo(
    () => getDayCount(scheduleForm.fromDate, scheduleForm.toDate),
    [scheduleForm.fromDate, scheduleForm.toDate]
  );
  const schedulePreviewCount = totalDays * scheduleForm.roomIds.length;
  const selectedRooms = useMemo(
    () => rooms.filter((room) => scheduleForm.roomIds.includes(room._id)),
    [rooms, scheduleForm.roomIds]
  );
  const totalSelectedCapacity = useMemo(
    () => selectedRooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0),
    [selectedRooms]
  );
  const dailySeatCapacity = totalSelectedCapacity;
  const rangeSeatCapacity = dailySeatCapacity * totalDays;
  const workloadLimit = Number(scheduleForm.maxDutiesPerLecturer || 0);
  const effectiveLecturerLimit = scheduleForm.sameDayNoRepeat
    ? Math.min(workloadLimit || totalDays, totalDays)
    : workloadLimit;
  const lecturerCoverage = lecturers.length * (effectiveLecturerLimit || 0);
  const hasCoverageGap = workloadLimit > 0 && lecturerCoverage < schedulePreviewCount;

  const stats = [
    { label: "Lecturers", value: lecturers.length, icon: <Users size={16} />, color: "blue" },
    { label: "Rooms", value: rooms.length, icon: <School size={16} />, color: "emerald" },
    { label: "Exam Slots", value: exams.length, icon: <Calendar size={16} />, color: "indigo" },
    { label: "Duties", value: duties.length, icon: <ClipboardCheck size={16} />, color: "violet" },
  ];
  const roomMap = useMemo(
    () => new Map(rooms.map((room) => [String(room._id), room])),
    [rooms]
  );
  const dutyByExamId = useMemo(
    () => new Map(duties.map((duty) => [String(duty.examScheduleId?._id || ""), duty])),
    [duties]
  );
  const filteredScheduleExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesDate = !filters.date || formatDate(exam.date) === filters.date;
      const matchesSession = !filters.session || exam.session === filters.session;
      return matchesDate && matchesSession;
    });
  }, [exams, filters.date, filters.session]);
  const roomSeatingPlan = useMemo(() => {
    return filteredScheduleExams
      .map((exam) => {
        const room = exam.roomId ? roomMap.get(String(exam.roomId._id || exam.roomId)) : rooms.find((item) => item.name === exam.hallNo);
        const assignedDuty = dutyByExamId.get(String(exam._id));
        return {
          id: exam._id,
          date: exam.date,
          session: exam.session,
          examType: exam.examType || exam.subject,
          hallNo: exam.hallNo,
          block: room?.block || "-",
          capacity: Number(room?.capacity) || 0,
          lecturerName: assignedDuty?.lecturerId?.name || "",
          assigned: Boolean(assignedDuty),
          availability: assignedDuty?.availability || "",
        };
      })
      .sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.hallNo.localeCompare(b.hallNo);
      });
  }, [dutyByExamId, filteredScheduleExams, roomMap, rooms]);
  const lecturerDutySummary = useMemo(() => {
    const visibleLecturers = filters.lecturerId
      ? lecturers.filter((lecturer) => lecturer.id === filters.lecturerId)
      : lecturers;

    return visibleLecturers
      .map((lecturer) => {
        const lecturerDuties = duties.filter((duty) => String(duty.lecturerId?._id || duty.lecturerId?.id || duty.lecturerId) === String(lecturer.id));
        const uniqueDates = new Set(
          lecturerDuties
            .filter((duty) => duty.examScheduleId?.date)
            .map((duty) => formatDate(duty.examScheduleId.date))
        );
        const assignedRooms = lecturerDuties
          .map((duty) => duty.examScheduleId?.hallNo)
          .filter(Boolean);

        return {
          id: lecturer.id,
          name: lecturer.name,
          designation: lecturer.designation,
          totalDuties: lecturerDuties.length,
          pending: lecturerDuties.filter((duty) => duty.availability === "Pending").length,
          available: lecturerDuties.filter((duty) => duty.availability === "Available").length,
          unavailable: lecturerDuties.filter((duty) => duty.availability === "Not Available").length,
          activeDays: uniqueDates.size,
          rooms: [...new Set(assignedRooms)].slice(0, 4),
        };
      })
      .sort((a, b) => {
        if (b.totalDuties !== a.totalDuties) return b.totalDuties - a.totalDuties;
        return a.name.localeCompare(b.name);
      });
  }, [duties, filters.lecturerId, lecturers]);
  const assignedRoomPlans = roomSeatingPlan.filter((item) => item.assigned).length;
  const unassignedRoomPlans = roomSeatingPlan.length - assignedRoomPlans;

  const exportSeatingPlanPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Room Wise Seating Plan", 14, 14);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [["Date", "Session", "Exam Type", "Room", "Block", "Capacity", "Invigilator", "Status"]],
      body: roomSeatingPlan.map((item) => [
        formatDate(item.date),
        item.session,
        formatExamType(item.examType),
        item.hallNo,
        item.block,
        item.capacity || "-",
        item.lecturerName || "-",
        item.assigned ? item.availability || "Pending" : "Unassigned",
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [240, 253, 250] },
      margin: { left: 10, right: 10 },
    });
    doc.save(`room-wise-seating-plan-${Date.now()}.pdf`);
  };

  const exportLecturerRegisterExcel = () => {
    const rows = lecturerDutySummary.map((item, index) => ({
      SNo: index + 1,
      Lecturer: item.name,
      Designation: item.designation || "Lecturer",
      TotalDuties: item.totalDuties,
      ActiveDays: item.activeDays,
      Pending: item.pending,
      Available: item.available,
      Unavailable: item.unavailable,
      Rooms: item.rooms.join(", "),
    }));
    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Lecturer Register");
    writeFile(wb, `lecturer-duty-register-${Date.now()}.xlsx`);
  };

  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <InvigilationShell user={user} title="Admin - Invigilation Duty Management">
          <div className="min-h-screen space-y-6 bg-slate-50 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-md">
                  <Shield size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">Invigilation Management</h1>
                  <p className="text-xs font-medium text-slate-400">
                    Create rooms, generate exam schedules for 6 to 10 days, and assign invigilation duties.
                  </p>
                </div>
              </div>
              <button
                onClick={() => fetchAll(filters)}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {stats.map(({ label, value, icon, color }) => {
                const bg = {
                  blue: "bg-blue-100 text-blue-600",
                  indigo: "bg-indigo-100 text-indigo-600",
                  violet: "bg-violet-100 text-violet-600",
                  emerald: "bg-emerald-100 text-emerald-600",
                };
                const val = {
                  blue: "text-blue-700",
                  indigo: "text-indigo-700",
                  violet: "text-violet-700",
                  emerald: "text-emerald-700",
                };
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

            <div className="grid gap-5 xl:grid-cols-4">
              <Card>
                <CardHeader icon={<UserPlus size={16} />} title="Add Lecturer" subtitle="Register a new invigilator" color="blue" />
                <form onSubmit={onCreateLecturer} className="space-y-3 p-5">
                  <FormInput label="Full Name" icon={<GraduationCap size={14} />} placeholder="e.g. Dr. K. Ramesh" required value={lecturerForm.name} onChange={(e) => setLecturerForm((s) => ({ ...s, name: e.target.value }))} />
                  <FormInput label="Designation" icon={<Shield size={14} />} placeholder="e.g. Lecturer" required value={lecturerForm.designation} onChange={(e) => setLecturerForm((s) => ({ ...s, designation: e.target.value }))} />
                  <FormInput label="Institution" icon={<Building2 size={14} />} placeholder="College name" required value={lecturerForm.institutionName} onChange={(e) => setLecturerForm((s) => ({ ...s, institutionName: e.target.value }))} />
                  <FormInput label="Phone" icon={<Phone size={14} />} placeholder="10-digit mobile" required value={lecturerForm.phone} onChange={(e) => setLecturerForm((s) => ({ ...s, phone: e.target.value }))} />
                  <FormInput label="Password" icon={<Shield size={14} />} placeholder="Leave blank for auto" type="password" value={lecturerForm.password} onChange={(e) => setLecturerForm((s) => ({ ...s, password: e.target.value }))} />
                  <SubmitBtn color="blue"><Plus size={15} /> Add Lecturer</SubmitBtn>
                </form>
              </Card>

              <Card>
                <CardHeader icon={<School size={16} />} title={editingRoomId ? "Edit Room" : "Create Room"} subtitle="Build room master for this college" color="emerald" />
                <form onSubmit={onCreateRoom} className="space-y-3 p-5">
                  <FormInput label="Room Name" icon={<Hash size={14} />} placeholder="e.g. H-101" required value={roomForm.name} onChange={(e) => setRoomForm((s) => ({ ...s, name: e.target.value.toUpperCase() }))} />
                  <FormInput label="Block" icon={<Building2 size={14} />} placeholder="e.g. A Block" value={roomForm.block} onChange={(e) => setRoomForm((s) => ({ ...s, block: e.target.value }))} />
                  <FormInput label="Capacity" icon={<Users size={14} />} type="number" min="1" placeholder="e.g. 40" value={roomForm.capacity} onChange={(e) => setRoomForm((s) => ({ ...s, capacity: e.target.value }))} />
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-emerald-700">Existing Rooms</p>
                      {editingRoomId ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRoomId("");
                            setRoomForm({ name: "", block: "", capacity: "" });
                          }}
                          className="text-[11px] font-semibold text-emerald-700 underline"
                        >
                          Cancel Edit
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {rooms.length > 0 ? rooms.map((room) => (
                        <div key={room._id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-700">{room.name}</p>
                            <p className="text-[11px] text-slate-400">{room.block || "Main Block"}{room.capacity ? ` | ${room.capacity}` : ""}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => onEditRoom(room)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50">
                              <Pencil size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteRoom(room)}
                              disabled={actionLoading === `room-delete-${room._id}`}
                              className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )) : <p className="text-[11px] text-emerald-600">No rooms created yet.</p>}
                    </div>
                  </div>
                  <SubmitBtn color="emerald" loading={roomLoading}><Plus size={15} /> {editingRoomId ? "Update Room" : "Create Room"}</SubmitBtn>
                </form>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader icon={<CalendarRange size={16} />} title="Generate Exam Schedule" subtitle="Assign selected exam type to all rooms and all days in one click" color="indigo" />
                <form onSubmit={onCreateSchedule} className="space-y-4 p-5">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <FormInput label="From Date" icon={<Calendar size={14} />} type="date" required value={scheduleForm.fromDate} onChange={(e) => setScheduleForm((s) => ({ ...s, fromDate: e.target.value }))} />
                    <FormInput label="To Date" icon={<Calendar size={14} />} type="date" required value={scheduleForm.toDate} onChange={(e) => setScheduleForm((s) => ({ ...s, toDate: e.target.value }))} />
                    <FormSelect label="Exam Type" icon={<BookOpen size={14} />} value={scheduleForm.examType} onChange={(e) => setScheduleForm((s) => ({ ...s, examType: e.target.value }))}>
                      {EXAM_TYPES.map((item) => (
                        <option key={item} value={item}>{formatExamType(item)}</option>
                      ))}
                    </FormSelect>
                    <FormSelect label="Session" icon={<Clock size={14} />} value={scheduleForm.session} onChange={(e) => setScheduleForm((s) => ({ ...s, session: e.target.value }))}>
                      <option value="FN">FN - Forenoon</option>
                      <option value="AN">AN - Afternoon</option>
                      <option value="EN">EN - Evening</option>
                    </FormSelect>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <FormInput
                      label="Max Duties Per Lecturer"
                      icon={<Users size={14} />}
                      type="number"
                      min="1"
                      value={scheduleForm.maxDutiesPerLecturer}
                      onChange={(e) => setScheduleForm((s) => ({ ...s, maxDutiesPerLecturer: e.target.value }))}
                    />
                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={scheduleForm.sameDayNoRepeat}
                        onChange={(e) => setScheduleForm((s) => ({ ...s, sameDayNoRepeat: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-700">FN/AN Same Day No Repeat</span>
                        <span className="block text-xs text-slate-400">A lecturer gets only one duty per day across all sessions.</span>
                      </span>
                    </label>
                  </div>

                  <RoomPicker
                    rooms={rooms}
                    selectedRoomIds={scheduleForm.roomIds}
                    onToggleRoom={toggleRoom}
                    onSelectAll={toggleAllRooms}
                  />

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                      <p className="text-xs font-semibold text-indigo-500">Selected Rooms</p>
                      <p className="mt-1 text-2xl font-black text-indigo-700">{scheduleForm.roomIds.length}</p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="text-xs font-semibold text-blue-500">Total Days</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">{totalDays}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                      <p className="text-xs font-semibold text-violet-500">Schedules To Create</p>
                      <p className="mt-1 text-2xl font-black text-violet-700">{schedulePreviewCount}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-500">Daily Hall Capacity</p>
                      <p className="mt-1 text-2xl font-black text-emerald-700">{dailySeatCapacity}</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3">
                      <p className="text-xs font-semibold text-cyan-500">Range Seat Capacity</p>
                      <p className="mt-1 text-2xl font-black text-cyan-700">{rangeSeatCapacity}</p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold text-amber-500">Lecturer Coverage</p>
                      <p className="mt-1 text-2xl font-black text-amber-700">{lecturerCoverage}</p>
                    </div>
                    <div className={`rounded-2xl border px-4 py-3 ${hasCoverageGap ? "border-rose-100 bg-rose-50" : "border-blue-100 bg-blue-50"}`}>
                      <p className={`text-xs font-semibold ${hasCoverageGap ? "text-rose-500" : "text-blue-500"}`}>Preview Status</p>
                      <p className={`mt-1 text-sm font-black ${hasCoverageGap ? "text-rose-700" : "text-blue-700"}`}>
                        {hasCoverageGap ? "Need More Lecturers" : "Coverage Looks Good"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="indigo">{formatExamType(scheduleForm.examType)}</Badge>
                      <SessionBadge session={scheduleForm.session} />
                      <Badge color="emerald">Rooms {selectedRooms.length}</Badge>
                      <Badge color="blue">Seats/Day {dailySeatCapacity}</Badge>
                      <Badge color="amber">Workload Limit {workloadLimit || "-"}</Badge>
                      <Badge color={scheduleForm.sameDayNoRepeat ? "violet" : "slate"}>
                        {scheduleForm.sameDayNoRepeat ? "FN/AN Same Day No Repeat" : "Same Session Clash Only"}
                      </Badge>
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      {selectedRooms.length > 0
                        ? `Selected halls: ${selectedRooms.map((room) => `${room.name}${room.capacity ? ` (${room.capacity})` : ""}`).join(", ")}`
                        : "Select rooms to see hall capacity and assignment coverage preview."}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <SubmitBtn color="indigo" loading={scheduleLoading}><Layers3 size={15} /> Generate Schedule For All Rooms</SubmitBtn>
                    <button
                      type="button"
                      onClick={onGenerateAndAssign}
                      disabled={scheduleLoading || autoLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-violet-700 active:scale-95 disabled:opacity-60"
                    >
                      {scheduleLoading || autoLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Zap size={15} />
                      )}
                      Generate Schedule + Auto Assign Duties
                    </button>
                  </div>
                </form>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_2fr]">
              <Card>
                <CardHeader icon={<ClipboardCheck size={16} />} title="Assign Duty" subtitle="Map lecturer to an exam slot" color="violet" />
                <form onSubmit={onAssignDuty} className="space-y-3 p-5">
                  <FormSelect label="Select Exam" icon={<Calendar size={14} />} required value={dutyForm.examScheduleId} onChange={(e) => setDutyForm((s) => ({ ...s, examScheduleId: e.target.value }))}>
                    <option value="">Choose Exam Slot</option>
                    {exams.map((exam) => (
                      <option key={exam._id} value={exam._id}>
                        {formatDate(exam.date)} | {exam.session} | {formatExamType(exam.examType || exam.subject)} | Hall {exam.hallNo}
                      </option>
                    ))}
                  </FormSelect>
                  <FormSelect label="Select Lecturer" icon={<GraduationCap size={14} />} required value={dutyForm.lecturerId} onChange={(e) => setDutyForm((s) => ({ ...s, lecturerId: e.target.value }))}>
                    <option value="">Choose Lecturer</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.id}>{lecturer.name} - {lecturer.designation}</option>
                    ))}
                  </FormSelect>

                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl bg-indigo-50 px-3 py-2 text-center">
                      <p className="text-xs font-medium text-indigo-400">Exam Slots</p>
                      <p className="text-lg font-black text-indigo-700">{exams.length}</p>
                    </div>
                    <div className="flex-1 rounded-xl bg-violet-50 px-3 py-2 text-center">
                      <p className="text-xs font-medium text-violet-400">Lecturers</p>
                      <p className="text-lg font-black text-violet-700">{lecturers.length}</p>
                    </div>
                  </div>

                  <SubmitBtn color="violet"><ClipboardCheck size={15} /> Assign Duty</SubmitBtn>
                </form>
              </Card>

              <Card>
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
                          {lecturers.map((lecturer) => (
                            <option key={lecturer.id} value={lecturer.id}>{lecturer.name}</option>
                          ))}
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
                      <Search size={14} /> Apply Filters
                    </button>

                    <button
                      onClick={onAutoAssign}
                      disabled={autoLoading}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-60"
                    >
                      {autoLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Zap size={14} />}
                      Auto Assign
                    </button>

                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={exportExcel}
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <FileSpreadsheet size={13} /> Excel
                      </button>
                      <button
                        onClick={exportPdf}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      >
                        <FileText size={13} /> PDF
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["#", "Date", "Session", "Exam Type", "Hall No", "Lecturer", "Availability"].map((header) => (
                          <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {duties.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-14 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              {loading ? (
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                              ) : (
                                <>
                                  <ClipboardCheck size={28} className="opacity-30" />
                                  <p className="text-sm font-medium">No duty assignments found</p>
                                  <p className="text-xs">Generate schedules first, then use auto assign or manual assignment.</p>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        duties.map((duty, index) => (
                          <tr key={duty._id} className={`transition-colors hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                            <td className="px-5 py-3 text-xs font-bold text-slate-400">{index + 1}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Calendar size={13} className="text-slate-400" />
                                <span className="font-semibold text-slate-700">
                                  {duty.examScheduleId?.date ? formatDate(duty.examScheduleId.date) : "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <SessionBadge session={duty.examScheduleId?.session || "-"} />
                            </td>
                            <td className="px-5 py-3 font-medium text-slate-700">
                              {formatExamType(duty.examScheduleId?.examType || duty.examScheduleId?.subject || "-")}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <Hash size={12} className="text-slate-400" />
                                <span className="font-mono text-xs font-semibold text-slate-600">
                                  {duty.examScheduleId?.hallNo || "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-600">
                                  {duty.lecturerId?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <span className="font-semibold text-slate-700">{duty.lecturerId?.name || "-"}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <AvailabilityBadge value={duty.availability} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {duties.length > 0 ? (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-2.5 text-xs font-medium text-slate-400">
                      Total {duties.length} duty assignments
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
              <Card>
                <CardHeader
                  icon={<School size={16} />}
                  title="Room-Wise Seating Plan"
                  subtitle="Daily hall schedule with capacity and invigilator coverage"
                  color="emerald"
                />
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge color="emerald">Assigned {assignedRoomPlans}</Badge>
                    <Badge color={unassignedRoomPlans > 0 ? "rose" : "blue"}>Unassigned {unassignedRoomPlans}</Badge>
                    <Badge color="indigo">Total Seats {roomSeatingPlan.reduce((sum, item) => sum + item.capacity, 0)}</Badge>
                    {filters.date ? <Badge color="amber">{filters.date}</Badge> : null}
                    {filters.session ? <SessionBadge session={filters.session} /> : null}
                    <button
                      type="button"
                      onClick={exportSeatingPlanPdf}
                      className="ml-auto rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Print Seating Plan PDF
                    </button>
                    <button
                      type="button"
                      onClick={onDeleteAllSchedules}
                      disabled={actionLoading === "schedule-delete-all" || roomSeatingPlan.length === 0}
                      className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      {actionLoading === "schedule-delete-all" ? "Deleting..." : "Delete All"}
                    </button>
                  </div>
                </div>
                {editingScheduleId ? (
                  <form onSubmit={onUpdateSingleSchedule} className="grid gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 md:grid-cols-5">
                    <FormInput label="Exam Date" type="date" value={singleScheduleForm.date} onChange={(e) => setSingleScheduleForm((s) => ({ ...s, date: e.target.value }))} required />
                    <FormSelect label="Session" value={singleScheduleForm.session} onChange={(e) => setSingleScheduleForm((s) => ({ ...s, session: e.target.value }))}>
                      <option value="FN">FN</option>
                      <option value="AN">AN</option>
                      <option value="EN">EN</option>
                    </FormSelect>
                    <FormSelect label="Exam Type" value={singleScheduleForm.examType} onChange={(e) => setSingleScheduleForm((s) => ({ ...s, examType: e.target.value }))}>
                      {EXAM_TYPES.map((item) => <option key={item} value={item}>{formatExamType(item)}</option>)}
                    </FormSelect>
                    <FormSelect label="Room" value={singleScheduleForm.roomId} onChange={(e) => setSingleScheduleForm((s) => ({ ...s, roomId: e.target.value }))}>
                      <option value="">Choose Room</option>
                      {rooms.map((room) => <option key={room._id} value={room._id}>{room.name}</option>)}
                    </FormSelect>
                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading === `schedule-save-${editingScheduleId}`}
                        className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {actionLoading === `schedule-save-${editingScheduleId}` ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={resetScheduleEditor}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Date", "Session", "Exam Type", "Room", "Block", "Capacity", "Invigilator", "Status", "Actions"].map((header) => (
                          <th key={header} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {roomSeatingPlan.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                            No room-wise schedules found for the current filters.
                          </td>
                        </tr>
                      ) : (
                        roomSeatingPlan.map((item, index) => (
                          <tr key={item.id} className={`transition-colors hover:bg-slate-50 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                            <td className="px-5 py-3 font-semibold text-slate-700">{formatDate(item.date)}</td>
                            <td className="px-5 py-3"><SessionBadge session={item.session} /></td>
                            <td className="px-5 py-3 font-medium text-slate-700">{formatExamType(item.examType)}</td>
                            <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-600">{item.hallNo}</td>
                            <td className="px-5 py-3 text-slate-600">{item.block}</td>
                            <td className="px-5 py-3 font-semibold text-slate-700">{item.capacity || "-"}</td>
                            <td className="px-5 py-3 text-slate-700">{item.lecturerName || "-"}</td>
                            <td className="px-5 py-3">
                              {item.assigned ? <AvailabilityBadge value={item.availability || "Pending"} /> : <Badge color="rose">Unassigned</Badge>}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => onEditSchedule(item)} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50">
                                  <Pencil size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteSchedule(item)}
                                  disabled={actionLoading === `schedule-delete-${item.id}`}
                                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                                >
                                  <Trash2 size={13} />
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

              <Card>
                <CardHeader
                  icon={<Users size={16} />}
                  title="Lecturer Duty Summary"
                  subtitle="Workload, active days, and room coverage by lecturer"
                  color="blue"
                />
                <div className="space-y-3 p-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={exportLecturerRegisterExcel}
                      className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      Lecturer Duty Register Excel
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
                      <p className="text-xs font-semibold text-blue-500">Lecturers In View</p>
                      <p className="mt-1 text-2xl font-black text-blue-700">{lecturerDutySummary.length}</p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3">
                      <p className="text-xs font-semibold text-violet-500">Total Duties</p>
                      <p className="mt-1 text-2xl font-black text-violet-700">
                        {lecturerDutySummary.reduce((sum, item) => sum + item.totalDuties, 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                      <p className="text-xs font-semibold text-amber-500">Pending Duties</p>
                      <p className="mt-1 text-2xl font-black text-amber-700">
                        {lecturerDutySummary.reduce((sum, item) => sum + item.pending, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {lecturerDutySummary.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                        No lecturer duty summary available for the current filters.
                      </div>
                    ) : (
                      lecturerDutySummary.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-400">{item.designation || "Lecturer"}</p>
                            </div>
                            <Badge color={item.totalDuties > 0 ? "blue" : "slate"}>{item.totalDuties} Duties</Badge>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold text-slate-400">Active Days</p>
                              <p className="text-lg font-black text-slate-700">{item.activeDays}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold text-slate-400">Pending</p>
                              <p className="text-lg font-black text-amber-700">{item.pending}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold text-slate-400">Available</p>
                              <p className="text-lg font-black text-emerald-700">{item.available}</p>
                            </div>
                            <div className="rounded-xl bg-white px-3 py-2">
                              <p className="text-[11px] font-semibold text-slate-400">Unavailable</p>
                              <p className="text-lg font-black text-rose-700">{item.unavailable}</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Assigned Rooms</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.rooms.length > 0 ? item.rooms.map((room) => <Badge key={room} color="indigo">{room}</Badge>) : <Badge color="slate">No Rooms</Badge>}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}
