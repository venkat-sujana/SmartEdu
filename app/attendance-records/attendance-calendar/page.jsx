//app/attendance-records/attendance-calendar/page.jsx

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const groupsList = ["MPC", "BiPC", "CEC", "HEC", "CET", "M&AT", "MLT"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarView() {
  const { data: session } = useSession();
  const [group, setGroup] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [collegeName, setCollegeName] = useState("");

  // 🧠 Load College Name
  useEffect(() => {
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName);
    }
  }, [session]);

  // 🧠 Load Students (filtered by collegeId, group, year)
  useEffect(() => {
    if (group && yearOfStudy && session?.user?.collegeId) {
      fetch(`/api/students?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          const filtered = data.data.filter(
            (s) => s.group === group && s.yearOfStudy === yearOfStudy
          );
          setStudents(filtered);
          setStudentId("");
        });
    } else {
      setStudents([]);
      setStudentId("");
    }
  }, [group, yearOfStudy, session]);

  // 🧠 Load Attendance (filtered by studentId)
  useEffect(() => {
    if (studentId) {
      fetch(
        `/api/attendance/monthly?studentId=${studentId}&month=${month}&year=${year}`
      )
        .then((res) => res.json())
        .then((data) => setAttendanceData(data.data || []));
    }
  }, [studentId, month, year]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const attendanceMap = Object.fromEntries(
    attendanceData.map((r) => [new Date(r.date).getDate(), r.status])
  );

  const selectedStudent = students.find((s) => s._id === studentId);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 flex items-center justify-center text-blue-500">
        {collegeName || "Your College"} Monthly Attendance Calendar - {year}
      </h1>

      <p className="mb-4">👉Note:-Select a group and student to view their attendance.</p>
      <Link href="/attendance-form">
        <button className="bg-cyan-600 text-white px-4 py-2 mb-2 rounded hover:bg-cyan-700 font-bold mr-2">
          📝 Attendance Form
        </button>
      </Link>

      <Link href="/attendance-records">
        <button className="bg-violet-700 text-white px-4 py-2 rounded hover:bg-cyan-700 font-bold mr-2">
          📝 Attendance Records
        </button>
      </Link>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select value={yearOfStudy} onChange={(e) => setYearOfStudy(e.target.value)} className="border p-2 rounded">
          <option value="">Select Year</option>
          <option value="First Year">First Year</option>
          <option value="Second Year">Second Year</option>
        </select>

        <select value={group} onChange={(e) => setGroup(e.target.value)} className="border p-2 rounded">
          <option value="">Select Group</option>
          {groupsList.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="border p-2 rounded">
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border p-2 rounded">
          {monthNames.map((m, i) => (
            <option key={m} value={i}>{m}</option>
          ))}
        </select>

        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border p-2 rounded">
          {[...Array(5)].map((_, i) => {
            const y = new Date().getFullYear() - 2 + i;
            return <option key={y} value={y}>{y}</option>;
          })}
        </select>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {[...Array(daysInMonth)].map((_, day) => {
          const date = day + 1;
          const status = attendanceMap[date] || "N/A";
          const color =
            status === "Present" ? "bg-green-300" :
            status === "Absent" ? "bg-red-300" :
            "bg-gray-200";

          return (
            <div key={date} className={`p-2 border rounded ${color}`}>
              <div className="font-bold">{date}</div>
              {status === "Present" ? (
                <img
                  src={selectedStudent?.photo || "/default-avatar.png"}
                  alt="Student Photo"
                  className="mx-auto mt-1 w-16 h-16 rounded-full object-cover border border-gray-400"
                />
              ) : (
                <div className="text-sm">{status}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
