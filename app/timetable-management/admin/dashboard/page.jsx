"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import TimetableShell from "@/app/timetable-management/components/TimetableShell";
import TimetableGrid from "@/app/timetable-management/components/TimetableGrid";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimeTableAdminDashboard() {
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gridData, setGridData] = useState({ timetable: null, slots: [] });
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ year: 1, semester: 1, classroom: "A101" });
  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    maxHoursPerWeek: 24,
    password: "",
  });
  const [subjectForm, setSubjectForm] = useState({
    subjectName: "",
    year: 1,
    semester: 1,
    hoursPerWeek: 4,
    lecturerId: "",
  });
  const [manualForm, setManualForm] = useState({
    day: "Monday",
    period: 1,
    subjectId: "",
    lecturerId: "",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [lRes, sRes, gRes] = await Promise.all([
        fetch("/api/timetable/lecturers", { cache: "no-store" }),
        fetch(`/api/timetable/subjects?year=${filters.year}&semester=${filters.semester}`, { cache: "no-store" }),
        fetch(
          `/api/timetable/manual?year=${filters.year}&semester=${filters.semester}&classroom=${encodeURIComponent(filters.classroom)}`,
          { cache: "no-store" }
        ),
      ]);
      const [lData, sData, gData] = await Promise.all([lRes.json(), sRes.json(), gRes.json()]);
      if (!lRes.ok || !sRes.ok || !gRes.ok) {
        throw new Error(lData.message || sData.message || gData.message || "Failed to load");
      }
      setLecturers(lData.data || []);
      setSubjects(sData.data || []);
      setGridData(gData.data || { timetable: null, slots: [] });
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.year, filters.semester, filters.classroom]);

  const createLecturer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/timetable/lecturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lecturerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create lecturer");
      const loginId = data?.meta?.loginId ? ` Login ID: ${data.meta.loginId}` : "";
      toast.success(`Lecturer created.${loginId}`);
      setLecturerForm({ name: "", maxHoursPerWeek: 24, password: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const createSubject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...subjectForm,
        year: Number(filters.year),
        semester: Number(filters.semester),
      };
      const res = await fetch("/api/timetable/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create subject");
      toast.success("Subject created");
      setSubjectForm((s) => ({ ...s, subjectName: "", lecturerId: "" }));
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const assignManual = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        year: Number(filters.year),
        semester: Number(filters.semester),
        classroom: filters.classroom,
        ...manualForm,
      };
      const res = await fetch("/api/timetable/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      toast.success("Slot assigned");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed");
    }
  };

  const runAuto = async () => {
    try {
      const res = await fetch("/api/timetable/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: Number(filters.year),
          semester: Number(filters.semester),
          classroom: filters.classroom,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Auto generation failed");
      const unallocated = data.data?.unallocatedSubjects?.length || 0;
      toast.success(`Auto timetable generated. Unallocated subjects: ${unallocated}`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Auto generation failed");
    }
  };

  const onDeleteSlot = async (slot) => {
    if (!gridData?.timetable?._id) return;
    try {
      const qs = new URLSearchParams({
        timetableId: String(gridData.timetable._id),
        day: slot.day,
        period: String(slot.period),
      });
      const res = await fetch(`/api/timetable/manual?${qs.toString()}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Slot deleted");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const onDeleteLecturer = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this lecturer profile and login?")) return;
    try {
      const res = await fetch(`/api/timetable/lecturers/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Lecturer deleted");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const onEditLecturer = async (lecturer) => {
    if (!lecturer?._id) return;
    const name = window.prompt("Lecturer name", lecturer.name || "");
    if (name === null) return;
    const maxHours = window.prompt("Max Hours/Week", String(lecturer.maxHoursPerWeek || 24));
    if (maxHours === null) return;

    try {
      const res = await fetch(`/api/timetable/lecturers/${lecturer._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          maxHoursPerWeek: Number(maxHours),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Lecturer updated");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  const onDeleteSubject = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this subject?")) return;
    try {
      const res = await fetch(`/api/timetable/subjects/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      toast.success("Subject deleted");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const onEditSubject = async (subject) => {
    if (!subject?._id) return;
    const subjectName = window.prompt("Subject name", subject.subjectName || "");
    if (subjectName === null) return;
    const hoursPerWeek = window.prompt("Hours per week", String(subject.hoursPerWeek || 1));
    if (hoursPerWeek === null) return;

    try {
      const res = await fetch(`/api/timetable/subjects/${subject._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subjectName.trim(),
          hoursPerWeek: Number(hoursPerWeek),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Subject updated");
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };

  const exportRows = useMemo(
    () =>
      (gridData?.slots || []).map((s) => ({
        Day: s.day,
        Period: s.period,
        Subject: s.subjectId?.subjectName || "",
        Lecturer: s.lecturerId?.name || "",
        Classroom: s.classroom,
      })),
    [gridData]
  );

  const exportExcel = () => {
    const ws = utils.json_to_sheet(exportRows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Timetable");
    writeFile(
      wb,
      `timetable-y${filters.year}-s${filters.semester}-${filters.classroom}-${Date.now()}.xlsx`
    );
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(15);
    doc.text(`Time Table - Year ${filters.year} Semester ${filters.semester}`, 14, 14);
    doc.setFontSize(10);
    doc.text(`Classroom: ${filters.classroom}`, 14, 20);
    doc.autoTable({
      startY: 26,
      head: [["Day", "Period", "Subject", "Lecturer", "Classroom"]],
      body: exportRows.map((r) => [r.Day, r.Period, r.Subject, r.Lecturer, r.Classroom]),
      headStyles: { fillColor: [67, 56, 202], textColor: 255 },
    });
    doc.save(`timetable-${Date.now()}.pdf`);
  };

  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <TimetableShell user={user} title="Admin - Time Table Management">
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                className="rounded border px-3 py-2"
                type="number"
                min={1}
                max={6}
                value={filters.year}
                onChange={(e) => setFilters((s) => ({ ...s, year: Number(e.target.value) }))}
                placeholder="Year"
              />
              <input
                className="rounded border px-3 py-2"
                type="number"
                min={1}
                max={2}
                value={filters.semester}
                onChange={(e) => setFilters((s) => ({ ...s, semester: Number(e.target.value) }))}
                placeholder="Semester"
              />
              <input
                className="rounded border px-3 py-2"
                value={filters.classroom}
                onChange={(e) => setFilters((s) => ({ ...s, classroom: e.target.value }))}
                placeholder="Classroom"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <form onSubmit={createLecturer} className="rounded-lg border p-3 space-y-2">
                <h3 className="text-sm font-semibold">Create Lecturer</h3>
                <input className="w-full rounded border px-2 py-1.5" placeholder="Name" required value={lecturerForm.name} onChange={(e)=>setLecturerForm((s)=>({...s,name:e.target.value}))} />
                <input className="w-full rounded border px-2 py-1.5" placeholder="Max Hours/Week" type="number" min={1} max={60} required value={lecturerForm.maxHoursPerWeek} onChange={(e)=>setLecturerForm((s)=>({...s,maxHoursPerWeek:Number(e.target.value)}))} />
                <input className="w-full rounded border px-2 py-1.5" placeholder="Password (optional)" value={lecturerForm.password} onChange={(e)=>setLecturerForm((s)=>({...s,password:e.target.value}))} />
                <button className="w-full rounded bg-indigo-600 py-1.5 text-sm text-white">Create</button>
              </form>

              <form onSubmit={createSubject} className="rounded-lg border p-3 space-y-2">
                <h3 className="text-sm font-semibold">Create Subject</h3>
                <input className="w-full rounded border px-2 py-1.5" placeholder="Subject Name" required value={subjectForm.subjectName} onChange={(e)=>setSubjectForm((s)=>({...s,subjectName:e.target.value}))} />
                <input className="w-full rounded border px-2 py-1.5" type="number" min={1} max={30} placeholder="Hours/Week" required value={subjectForm.hoursPerWeek} onChange={(e)=>setSubjectForm((s)=>({...s,hoursPerWeek:Number(e.target.value)}))} />
                <select className="w-full rounded border px-2 py-1.5" required value={subjectForm.lecturerId} onChange={(e)=>setSubjectForm((s)=>({...s,lecturerId:e.target.value}))}>
                  <option value="">Select Lecturer</option>
                  {lecturers.map((l)=><option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>)}
                </select>
                <button className="w-full rounded bg-indigo-600 py-1.5 text-sm text-white">Create</button>
              </form>

              <form onSubmit={assignManual} className="rounded-lg border p-3 space-y-2">
                <h3 className="text-sm font-semibold">Manual Slot Assignment</h3>
                <select className="w-full rounded border px-2 py-1.5" value={manualForm.day} onChange={(e)=>setManualForm((s)=>({...s,day:e.target.value}))}>
                  {DAYS.map((d)=><option key={d} value={d}>{d}</option>)}
                </select>
                <input className="w-full rounded border px-2 py-1.5" type="number" min={1} max={8} value={manualForm.period} onChange={(e)=>setManualForm((s)=>({...s,period:Number(e.target.value)}))} />
                <select className="w-full rounded border px-2 py-1.5" required value={manualForm.subjectId} onChange={(e)=>setManualForm((s)=>({...s,subjectId:e.target.value}))}>
                  <option value="">Select Subject</option>
                  {subjects.map((s)=><option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>
                <select className="w-full rounded border px-2 py-1.5" required value={manualForm.lecturerId} onChange={(e)=>setManualForm((s)=>({...s,lecturerId:e.target.value}))}>
                  <option value="">Select Lecturer</option>
                  {lecturers.map((l)=><option key={l._id || l.id} value={l._id || l.id}>{l.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button className="flex-1 rounded bg-indigo-600 py-1.5 text-sm text-white">Assign</button>
                  <button type="button" onClick={runAuto} className="flex-1 rounded bg-emerald-600 py-1.5 text-sm text-white">Auto Generate</button>
                </div>
              </form>
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-3 flex flex-wrap gap-2">
                <button onClick={exportExcel} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white">
                  Export Excel
                </button>
                <button onClick={exportPdf} className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white">
                  Export PDF
                </button>
                <span className="text-sm text-slate-600">{loading ? "Loading..." : `Slots: ${gridData?.slots?.length || 0}`}</span>
              </div>
              <TimetableGrid slots={gridData?.slots || []} onDeleteSlot={onDeleteSlot} />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-lg border p-3">
                <h3 className="mb-2 text-sm font-semibold">Lecturers</h3>
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-2 text-left">Name</th>
                        <th className="px-2 py-2 text-left">Load</th>
                        <th className="px-2 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lecturers.map((l) => (
                        <tr key={l._id} className="border-t">
                          <td className="px-2 py-2">{l.name}</td>
                          <td className="px-2 py-2">{`${l.allocatedHours || 0}/${l.maxHoursPerWeek || 0}`}</td>
                          <td className="px-2 py-2">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => onEditLecturer(l)} className="rounded bg-amber-500 px-2 py-1 text-xs text-white">
                                Edit
                              </button>
                              <button type="button" onClick={() => onDeleteLecturer(l._id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {lecturers.length === 0 && !loading && (
                        <tr>
                          <td className="px-2 py-3 text-center text-slate-500" colSpan={3}>
                            No lecturers found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <h3 className="mb-2 text-sm font-semibold">Subjects</h3>
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-2 text-left">Subject</th>
                        <th className="px-2 py-2 text-left">Hours</th>
                        <th className="px-2 py-2 text-left">Lecturer</th>
                        <th className="px-2 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((s) => (
                        <tr key={s._id} className="border-t">
                          <td className="px-2 py-2">{s.subjectName}</td>
                          <td className="px-2 py-2">{s.hoursPerWeek}</td>
                          <td className="px-2 py-2">{s.lecturerId?.name || "-"}</td>
                          <td className="px-2 py-2">
                            <div className="flex gap-2">
                              <button type="button" onClick={() => onEditSubject(s)} className="rounded bg-amber-500 px-2 py-1 text-xs text-white">
                                Edit
                              </button>
                              <button type="button" onClick={() => onDeleteSubject(s._id)} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {subjects.length === 0 && !loading && (
                        <tr>
                          <td className="px-2 py-3 text-center text-slate-500" colSpan={4}>
                            No subjects found for selected year/semester
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </TimetableShell>
      )}
    </InvigilationGuard>
  );
}
