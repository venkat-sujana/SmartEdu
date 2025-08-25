"use client";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

// -----------------------------
// Reusable UI bits
// -----------------------------
function StatCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

// -----------------------------
// Attendance Table Component
// -----------------------------
function MonthlyAttendanceTable({ attendance = [] }) {
  const months = ["JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR"];

  const attendanceByMonth = useMemo(() => (
    months.map((mon) => {
      const m = attendance.find((a) => a.month === mon) || {};
      const workingDays = Number(m.workingDays) || 0;
      const present = Number(m.present) || 0;
      const percent = workingDays ? ((present / workingDays) * 100).toFixed(1) : "";
      return { workingDays: workingDays || "", present: present || "", percent };
    })
  ), [attendance]);

  const totals = useMemo(() => {
    const working = attendanceByMonth.reduce((s, x) => s + (parseInt(x.workingDays) || 0), 0);
    const present = attendanceByMonth.reduce((s, x) => s + (parseInt(x.present) || 0), 0);
    const percent = working ? ((present / working) * 100).toFixed(1) : "";
    return { working, present, percent };
  }, [attendanceByMonth]);

  return (
    <section className="mx-auto mb-8 max-w-5xl rounded-2xl border bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-2xl font-bold text-teal-700">Monthly Attendance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="border border-teal-400 px-3 py-2">Month</th>
              {months.map((m) => (
                <th key={m} className="border border-teal-400 px-3 py-2">{m}</th>
              ))}
              <th className="border border-teal-400 px-3 py-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border bg-teal-100 px-3 py-2 font-semibold">Working Days</td>
              {attendanceByMonth.map((m, i) => (
                <td key={months[i]} className="border px-3 py-2">{m.workingDays || ""}</td>
              ))}
              <td className="border bg-teal-100 px-3 py-2 font-bold">{totals.working || ""}</td>
            </tr>
            <tr className="bg-teal-50">
              <td className="border px-3 py-2 font-semibold">Present</td>
              {attendanceByMonth.map((m, i) => (
                <td key={months[i]} className="border px-3 py-2 font-semibold text-green-700">
                  {m.present || ""}
                </td>
              ))}
              <td className="border px-3 py-2 font-bold">{totals.present || ""}</td>
            </tr>
            <tr>
              <td className="border bg-teal-100 px-3 py-2 font-semibold">Percent</td>
              {attendanceByMonth.map((m, i) => (
                <td
                  key={months[i]}
                  className={`border px-3 py-2 font-semibold ${
                    !m.percent ? "" : Number(m.percent) >= 75 ? "text-green-700" : "text-red-500"
                  }`}
                >
                  {m.percent ? `${m.percent}%` : ""}
                </td>
              ))}
              <td
                className={`border bg-teal-100 px-3 py-2 font-bold ${
                  !totals.percent ? "" : Number(totals.percent) >= 75 ? "text-green-700" : "text-red-500"
                }`}
              >
                {totals.percent ? `${totals.percent}%` : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

// -----------------------------
// Skeleton loaders
// -----------------------------
function Line() {
  return <div className="h-3 w-full animate-pulse rounded bg-gray-200" />;
}
function CardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <Line />
      <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// -----------------------------
// Helper
// -----------------------------
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// -----------------------------
// Main Dashboard
// -----------------------------
export default function StudentDashboard() {
  // ALL hooks at the top level, in the same order!
  const { data: session, status } = useSession();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collegeName, setCollegeName] = useState('');

  useEffect(() => {
    if (status !== "authenticated") return;

    (async () => {
      try {
        console.log("Fetching data...");
        setLoading(true);
        setError("");
        const id = session.user.id;

        const [studentRes, examsRes, attRes] = await Promise.all([
          fetchJSON(`/api/students/${id}`),
          fetchJSON(`/api/exams/student/${id}`),
          fetchJSON(`/api/attendance/student/${id}`),
        ]);

        console.log("Response:", studentRes, examsRes, attRes);

        setStudent(studentRes?.data ?? null);
        setExams(examsRes?.data ?? []);
        setAttendance(attRes?.data ?? []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, session]);

  // useMemo always called, regardless of early returns
  const overallPercent = useMemo(() => {
    const working = attendance.reduce((s, x) => s + (x.workingDays || 0), 0);
    const present = attendance.reduce((s, x) => s + (x.present || 0), 0);
    return working ? ((present / working) * 100).toFixed(1) : "0.0";
  }, [attendance]);

  // Render logic below. Early returns are **after** hooks.
  if (status === "loading" || loading) {
    console.log("Loading...");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Line key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    console.log("Not logged in");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">You are not logged in.</p>
      </div>
    );
  }

  if (!student) {
    console.log("No student data found");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-red-500">No student data found.</p>
      </div>
    );
  }

  // Main UI
  console.log("Rendering UI...");
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-700">Welcome, {student?.name || "Student"}</h1>
      </header>

      {/* Top Stats */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Overall Attendance" value={`${overallPercent}%`} hint="Target ≥ 75%" />
        <StatCard title="Total Working Days" value={attendance.reduce((s, x) => s + (x.workingDays || 0), 0)} />
        <StatCard title="Total Presents" value={attendance.reduce((s, x) => s + (x.present || 0), 0)} />
      </section>

      {/* Profile */}
{/* Profile */}
<section className="mx-auto mt-6 max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-2xl font-semibold">Profile Details</h2>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
       Name: <span className="text-gray-700">{student.name || "—"}</span>
    </div>
    <div>
      Father Name: <span className="text-gray-700">{student.fatherName || "—"}</span>
    </div>
    <div>
     
      Mobile:<span className="text-gray-700">{student.mobile || "—"}</span>
      
    </div>
    <div>
      Group:<span className="text-gray-700">{student.group || "—"}</span>
     
    </div>
    <div>
     Caste:<span className="text-gray-700">{student.caste || "—"}</span>
      
    </div>
    <div>
      Date of Birth:<span className="text-gray-700">{student.dob ? new Date(student.dob).toLocaleDateString() : "—"}</span>
    
    </div>
    <div>
      Gender:<span className="text-gray-700">{student.gender || "—"}</span>
      
    </div>
    <div>
      Admission No:<span className="text-gray-700">{student.admissionNo || "—"}</span>
     
    </div>
    <div>
      Year of Study:<span className="text-gray-700">{student.yearOfStudy || "—"}</span>
      
    </div>
    <div>
      Admission Year:<span className="text-gray-700">{student.admissionYear || "—"}</span>
    
    
    </div>
    <div>
      Address:<span className="text-gray-700">{student.address || "—"}</span>

    
     
    </div>
    <div>
  {/* <p className="font-medium">College:</p>
<p className="text-gray-700">{student.collegeId?.name || "—"}</p> */}


</div>
    {student.photo && (
      <div className="col-span-2">
        <p className="font-medium"></p>
        <Image
          src={student.photo}
          alt="Profile"
          width={150}
          height={150}
          className="mt-2 rounded-full object-cover shadow-md"
        />
      </div>
    )}
  </div>
</section>


      {/* Exams */}
      <section className="mx-auto mt-6 max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-semibold">Exams</h2>
        {exams?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Subject</th>
                  <th className="border p-2">Marks</th>
                  <th className="border p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="odd:bg-white even:bg-gray-50">
                    <td className="border p-2">{exam.subject}</td>
                    <td className="border p-2 text-center">{exam.marks}</td>
                    <td className="border p-2 text-center">
                      {exam.date ? new Date(exam.date).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No exam records available.</p>
        )}
      </section>

      {/* Attendance */}
      <MonthlyAttendanceTable attendance={attendance} />

      {/* Error */}
      {error && (
        <div className="mx-auto max-w-5xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
