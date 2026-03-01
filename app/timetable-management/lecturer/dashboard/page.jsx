"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import TimetableShell from "@/app/timetable-management/components/TimetableShell";

export default function TimetableLecturerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/timetable/lecturer-summary", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load");
      setData(json.data);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <InvigilationGuard allowRoles={["lecturer"]}>
      {(user) => (
        <TimetableShell user={user} title="Lecturer - Time Table Dashboard">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Allocated Hours / Week</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {loading ? "..." : data?.weeklyAllocatedHours ?? 0}
                </p>
              </div>
              <div className="rounded-lg border bg-blue-50 p-3">
                <p className="text-xs text-blue-700">Max Hours / Week</p>
                <p className="text-2xl font-bold text-blue-900">
                  {loading ? "..." : data?.lecturer?.maxHoursPerWeek ?? 0}
                </p>
              </div>
              <div className="rounded-lg border bg-amber-50 p-3">
                <p className="text-xs text-amber-700">Remaining Capacity</p>
                <p className="text-2xl font-bold text-amber-900">
                  {loading ? "..." : data?.remainingCapacity ?? 0}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 text-sm font-semibold">Subjects Handled</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Subject</th>
                      <th className="px-2 py-2 text-left">Code</th>
                      <th className="px-2 py-2 text-left">Year</th>
                      <th className="px-2 py-2 text-left">Semester</th>
                      <th className="px-2 py-2 text-left">Hours/Week</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.subjects || []).map((s) => (
                      <tr key={s._id} className="border-t">
                        <td className="px-2 py-2">{s.subjectName}</td>
                        <td className="px-2 py-2">{s.subjectCode}</td>
                        <td className="px-2 py-2">{s.year}</td>
                        <td className="px-2 py-2">{s.semester}</td>
                        <td className="px-2 py-2">{s.hoursPerWeek}</td>
                      </tr>
                    ))}
                    {!loading && (data?.subjects || []).length === 0 && (
                      <tr><td className="px-2 py-3 text-center text-slate-500" colSpan={5}>No subjects assigned</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <h3 className="mb-2 text-sm font-semibold">My Time Slots</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Day</th>
                      <th className="px-2 py-2 text-left">Period</th>
                      <th className="px-2 py-2 text-left">Subject</th>
                      <th className="px-2 py-2 text-left">Code</th>
                      <th className="px-2 py-2 text-left">Classroom</th>
                      <th className="px-2 py-2 text-left">Year/Sem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.slots || []).map((slot) => (
                      <tr key={slot._id} className="border-t">
                        <td className="px-2 py-2">{slot.day}</td>
                        <td className="px-2 py-2">{slot.period}</td>
                        <td className="px-2 py-2">{slot.subjectId?.subjectName || "-"}</td>
                        <td className="px-2 py-2">{slot.subjectId?.subjectCode || "-"}</td>
                        <td className="px-2 py-2">{slot.classroom}</td>
                        <td className="px-2 py-2">{`${slot.year}/${slot.semester}`}</td>
                      </tr>
                    ))}
                    {!loading && (data?.slots || []).length === 0 && (
                      <tr><td className="px-2 py-3 text-center text-slate-500" colSpan={6}>No timetable slots allocated</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TimetableShell>
      )}
    </InvigilationGuard>
  );
}

