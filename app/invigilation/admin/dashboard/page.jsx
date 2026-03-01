"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

function formatDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export default function AdminInvigilationDashboardPage() {
  const [lecturers, setLecturers] = useState([]);
  const [exams, setExams] = useState([]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [lecturerForm, setLecturerForm] = useState({
    name: "",
    designation: "",
    institutionName: "",
    phone: "",
    password: "",
  });
  const [examForm, setExamForm] = useState({
    date: "",
    session: "FN",
    subject: "",
    hallNo: "",
  });
  const [dutyForm, setDutyForm] = useState({ examScheduleId: "", lecturerId: "" });
  const [filters, setFilters] = useState({ date: "", lecturerId: "", session: "" });

  const fetchAll = async (activeFilters = filters) => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      if (activeFilters.date) qp.set("date", activeFilters.date);
      if (activeFilters.lecturerId) qp.set("lecturerId", activeFilters.lecturerId);
      if (activeFilters.session) qp.set("session", activeFilters.session);

      const [lRes, eRes, dRes] = await Promise.all([
        fetch("/api/invigilation/lecturers", { cache: "no-store" }),
        fetch("/api/invigilation/exams", { cache: "no-store" }),
        fetch(`/api/invigilation/duties?${qp.toString()}`, { cache: "no-store" }),
      ]);

      const [lData, eData, dData] = await Promise.all([lRes.json(), eRes.json(), dRes.json()]);
      if (!lRes.ok || !eRes.ok || !dRes.ok) {
        throw new Error(lData.message || eData.message || dData.message || "Failed to load");
      }
      setLecturers(lData.data || []);
      setExams(eData.data || []);
      setDuties(dData.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateLecturer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invigilation/lecturers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lecturerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add lecturer");
      toast.success(`Lecturer added. Login ID: ${data.loginId} | Temp password: ${data.tempPassword}`);
      setLecturerForm({ name: "", designation: "", institutionName: "", phone: "", password: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to add lecturer");
    }
  };

  const onCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/invigilation/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create exam");
      toast.success("Exam schedule created");
      setExamForm({ date: "", session: "FN", subject: "", hallNo: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to create exam");
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
      if (!res.ok) throw new Error(data.message || "Failed to assign duty");
      toast.success("Duty assigned");
      setDutyForm({ examScheduleId: "", lecturerId: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Failed to assign duty");
    }
  };

  const onAutoAssignDuties = async () => {
    try {
      const res = await fetch("/api/invigilation/duties/auto-assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: filters.date || undefined,
          session: filters.session || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Auto allocation failed");
      toast.success(`${data.message}: Assigned ${data.assigned}, Skipped ${data.skipped}`);
      fetchAll();
    } catch (err) {
      toast.error(err.message || "Auto allocation failed");
    }
  };

  const applyFilters = async () => fetchAll(filters);

  const exportRows = useMemo(
    () =>
      duties.map((d, idx) => ({
        SNo: idx + 1,
        Date: d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "",
        Session: d.examScheduleId?.session || "",
        Subject: d.examScheduleId?.subject || "",
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
    const generatedAt = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text("Invigilation Duty Assignment Report", 14, 14);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 14, 20);
    doc.text(
      `Filters -> Date: ${filters.date || "All"} | Lecturer: ${
        lecturers.find((l) => l.id === filters.lecturerId)?.name || "All"
      } | Session: ${filters.session || "All"}`,
      14,
      26
    );

    doc.autoTable({
      startY: 32,
      head: [["Date", "Session", "Subject", "Hall", "Lecturer", "Availability"]],
      body: exportRows.map((r) => [r.Date, r.Session, r.Subject, r.HallNo, r.Lecturer, r.Availability]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { left: 10, right: 10 },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290, { align: "right" });
    }
    doc.save(`invigilation-duties-${Date.now()}.pdf`);
  };

  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <InvigilationShell user={user} title="Admin - Invigilation Duty Management">
          <div className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-3">
              <form onSubmit={onCreateLecturer} className="rounded-lg border p-3">
                <h3 className="mb-2 text-sm font-semibold">Add Lecturer</h3>
                <div className="space-y-2">
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Name" required value={lecturerForm.name} onChange={(e)=>setLecturerForm((s)=>({...s,name:e.target.value}))} />
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Designation" required value={lecturerForm.designation} onChange={(e)=>setLecturerForm((s)=>({...s,designation:e.target.value}))} />
                  <input className="w-full rounded border px-2 py-1.5" placeholder="School / College Name" required value={lecturerForm.institutionName} onChange={(e)=>setLecturerForm((s)=>({...s,institutionName:e.target.value}))} />
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Phone" required value={lecturerForm.phone} onChange={(e)=>setLecturerForm((s)=>({...s,phone:e.target.value}))} />
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Password (optional)" value={lecturerForm.password} onChange={(e)=>setLecturerForm((s)=>({...s,password:e.target.value}))} />
                  <button className="w-full rounded bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Create Lecturer</button>
                </div>
              </form>

              <form onSubmit={onCreateExam} className="rounded-lg border p-3">
                <h3 className="mb-2 text-sm font-semibold">Create Exam Schedule</h3>
                <div className="space-y-2">
                  <input className="w-full rounded border px-2 py-1.5" type="date" required value={examForm.date} onChange={(e)=>setExamForm((s)=>({...s,date:e.target.value}))} />
                  <select className="w-full rounded border px-2 py-1.5" value={examForm.session} onChange={(e)=>setExamForm((s)=>({...s,session:e.target.value}))}>
                    <option value="FN">FN</option><option value="AN">AN</option><option value="EN">EN</option>
                  </select>
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Subject" required value={examForm.subject} onChange={(e)=>setExamForm((s)=>({...s,subject:e.target.value}))} />
                  <input className="w-full rounded border px-2 py-1.5" placeholder="Hall No" required value={examForm.hallNo} onChange={(e)=>setExamForm((s)=>({...s,hallNo:e.target.value}))} />
                  <button className="w-full rounded bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Create Schedule</button>
                </div>
              </form>

              <form onSubmit={onAssignDuty} className="rounded-lg border p-3">
                <h3 className="mb-2 text-sm font-semibold">Assign Duty</h3>
                <div className="space-y-2">
                  <select className="w-full rounded border px-2 py-1.5" required value={dutyForm.examScheduleId} onChange={(e)=>setDutyForm((s)=>({...s,examScheduleId:e.target.value}))}>
                    <option value="">Select Exam</option>
                    {exams.map((e)=>(
                      <option key={e._id} value={e._id}>{formatDate(e.date)} | {e.session} | {e.subject} | Hall {e.hallNo}</option>
                    ))}
                  </select>
                  <select className="w-full rounded border px-2 py-1.5" required value={dutyForm.lecturerId} onChange={(e)=>setDutyForm((s)=>({...s,lecturerId:e.target.value}))}>
                    <option value="">Select Lecturer</option>
                    {lecturers.map((l)=>(
                      <option key={l.id} value={l.id}>{l.name} ({l.designation})</option>
                    ))}
                  </select>
                  <button className="w-full rounded bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Assign</button>
                </div>
              </form>
            </div>

            <div className="rounded-lg border p-3">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input type="date" className="rounded border px-2 py-1.5 text-sm" value={filters.date} onChange={(e)=>setFilters((s)=>({...s,date:e.target.value}))} />
                <select className="rounded border px-2 py-1.5 text-sm" value={filters.lecturerId} onChange={(e)=>setFilters((s)=>({...s,lecturerId:e.target.value}))}>
                  <option value="">All Lecturers</option>
                  {lecturers.map((l)=><option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
                <select className="rounded border px-2 py-1.5 text-sm" value={filters.session} onChange={(e)=>setFilters((s)=>({...s,session:e.target.value}))}>
                  <option value="">All Sessions</option><option value="FN">FN</option><option value="AN">AN</option><option value="EN">EN</option>
                </select>
                <button onClick={applyFilters} className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white">Apply Filters</button>
                <button onClick={onAutoAssignDuties} className="rounded bg-indigo-700 px-3 py-1.5 text-sm text-white">Auto Assign Duties</button>
                <button onClick={exportExcel} className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white">Export Excel</button>
                <button onClick={exportPdf} className="rounded bg-rose-600 px-3 py-1.5 text-sm text-white">Export PDF</button>
              </div>

              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-left">Session</th>
                      <th className="px-2 py-2 text-left">Subject</th>
                      <th className="px-2 py-2 text-left">Hall</th>
                      <th className="px-2 py-2 text-left">Lecturer</th>
                      <th className="px-2 py-2 text-left">Availability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((d) => (
                      <tr key={d._id} className="border-t">
                        <td className="px-2 py-2">{d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.session || "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.subject || "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.hallNo || "-"}</td>
                        <td className="px-2 py-2">{d.lecturerId?.name || "-"}</td>
                        <td className="px-2 py-2">{d.availability}</td>
                      </tr>
                    ))}
                    {duties.length === 0 && (
                      <tr><td className="px-2 py-4 text-center text-slate-500" colSpan={6}>{loading ? "Loading..." : "No assignments found"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}
