"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
};

function formatDisplayDate(value) {
  if (!value) return "Date not provided";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getDayKey(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(
    parsed.getDate()
  ).padStart(2, "0")}`;
}

function buildNormalizedDateFromParam(dateParam) {
  if (!dateParam) return "";

  const [year, month, day] = dateParam.split("-").map(Number);
  if (!year || !month || !day) return "";

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function AbsentReasonPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params?.id;
  const dateParam = searchParams.get("date") || "";

  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedDate = useMemo(
    () => buildNormalizedDateFromParam(dateParam),
    [dateParam]
  );

  async function loadReason(studentId, date) {
  const res = await fetch(
    `/api/attendance/reason?studentId=${studentId}&date=${date}`
  );

  const data = await res.json();

  return data.reason || "";
}

  useEffect(() => {
    
    if (!studentId) return;

    let isMounted = true;

    const fetchDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const [studentRes, dailyRes] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          fetch(`/api/attendance/student/${studentId}/daily`),
        ]);

        const [studentJson, dailyJson] = await Promise.all([
          studentRes.json(),
          dailyRes.json(),
        ]);

        if (!studentRes.ok || studentJson?.status !== "success") {
          throw new Error(studentJson?.message || "Failed to load student details");
        }

        if (!dailyRes.ok || !Array.isArray(dailyJson)) {
          throw new Error("Failed to load attendance history");
        }

        if (isMounted) {
          setStudent(studentJson.data || null);
          setRecords(dailyJson || []);

          const savedReason = await loadReason(studentId, normalizedDate);

         setReason(savedReason);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load absence details");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [studentId,normalizedDate]);

  const selectedDayRecords = useMemo(() => {
    if (!normalizedDate) return [];

    return records
      .filter((record) => getDayKey(record.date) === normalizedDate)
      .sort((a, b) => String(a.session || "").localeCompare(String(b.session || "")));
  }, [normalizedDate, records]);

  const absentSessions = useMemo(
    () => selectedDayRecords.filter((record) => record.status === "Absent"),
    [selectedDayRecords]
  );

    const dayAttendanceSummary = useMemo(() => {
    const present = selectedDayRecords.filter((record) => record.status === "Present").length;
    const absent = selectedDayRecords.filter((record) => record.status === "Absent").length;

    return {
      present,
      absent,
      total: selectedDayRecords.length,
    };
  }, [selectedDayRecords]);

  if (loading) {
    return (
      <div className="mx-auto mt-24 max-w-4xl px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
            <p className="text-sm font-semibold">Loading absence details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto mt-24 max-w-4xl px-4 pb-10">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-sm">
          <p className="text-lg font-black text-rose-700">Unable to load absence details</p>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <Link
            href="/attendance-records/attendance-calendar"
            className="mt-4 inline-flex rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Back to Calendar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-24 max-w-5xl px-4 pb-10">
      <div className="rounded-[28px] border border-slate-200 bg-linear-to-br from-white via-rose-50 to-amber-50 shadow-sm">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
                Absence Detail
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                {formatDisplayDate(normalizedDate || dateParam)}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Session-wise absence breakdown for the selected student
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/attendance-records/attendance-calendar"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Calendar
              </Link>
              {studentId && (
                <Link
                  href={`/attendance-records/individual?studentId=${studentId}`}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Full Attendance
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-5 py-5 xl:grid-cols-[1.2fr_1.8fr] sm:px-6">
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {student?.photo ? (
                  <Image
                    src={student.photo}
                    alt={student.name || "Student"}
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-slate-100"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200 text-xl font-black text-slate-600">
                    {student?.name?.[0] || "S"}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Student
                  </p>
                  <h2 className="truncate text-lg font-black text-slate-900">
                    {student?.name || "Unknown Student"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {student?.yearOfStudy || "-"} • {student?.group || "-"}
                  </p>
                  {student?.admissionNo && (
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Admission No: {student.admissionNo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-3xl bg-rose-100 px-3 py-3 text-rose-800 shadow-sm">
                <p className="text-2xl font-black leading-none">
                  {dayAttendanceSummary.absent}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
                  Absent Sessions
                </p>
              </div>
              <div className="rounded-3xl bg-emerald-100 px-3 py-3 text-emerald-800 shadow-sm">
                <p className="text-2xl font-black leading-none">
                  {dayAttendanceSummary.present}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
                  Present Sessions
                </p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-3 py-3 text-slate-800 shadow-sm">
                <p className="text-2xl font-black leading-none">
                  {dayAttendanceSummary.total}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide">
                  Marked
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-sm font-black text-amber-900">Reason Status</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Attendance record currently does not include a stored absent reason field.
                This page shows the full absence context for the selected date.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {absentSessions.length > 0 ? (
              absentSessions.map((record, index) => (
                <div
                  key={`${record._id || record.session}-${index}`}
                  className="rounded-3xl border border-rose-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="inline-flex rounded-full bg-rose-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                        {sessionLabels[record.session] || record.session || "Session"}
                      </span>
                      <h3 className="mt-3 text-lg font-black text-slate-900">
                        Marked Absent
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Attendance was recorded as absent for this session.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                      Status: {record.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Marked By
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {record.lecturerName || "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Marked Time
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {formatTime(record.markedAt)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Group
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {record.group || student?.group || "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Year of Study
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-800">
                        {record.yearOfStudy || student?.yearOfStudy || "Not available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                      Reason Note
                    </p>
                    <p className="mt-2 text-sm font-semibold text-rose-900">
                      Reason not recorded yet
                    </p>
                    <p className="mt-1 text-sm leading-6 text-rose-700">
                      You can use this section as the student absence explanation area once a
                      dedicated reason field is added to attendance records.
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <p className="text-lg font-black text-slate-900">
                  No absent session found for this date
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  The selected day either has no attendance record or the student was not marked
                  absent in any session.
                </p>
              </div>
            )}

            {selectedDayRecords.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-black text-slate-900">Day Timeline</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {selectedDayRecords.map((record, index) => (
                    <div
                      key={`${record.session}-${index}`}
                      className={`rounded-2xl px-3 py-3 ${
                        record.status === "Absent"
                          ? "bg-rose-50 text-rose-800"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold">
                          {sessionLabels[record.session] || record.session || "Session"}
                        </p>
                        <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold">
                          {record.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs font-semibold opacity-80">
                        Marked at {formatTime(record.markedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
