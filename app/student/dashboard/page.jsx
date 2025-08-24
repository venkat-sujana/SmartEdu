"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

// Attendance Table component
function MonthlyAttendanceTable({ attendance }) {
  const months = [
    "JUN", "JUL", "AUG", "SEP", "OCT",
    "NOV", "DEC", "JAN", "FEB", "MAR"
  ];

  // Prepare attendance data per month
  const attendanceByMonth = months.map(month => {
    const monthData = attendance.find(a => a.month === month) || {};
    return {
      workingDays: monthData.workingDays || "",
      present: monthData.present || "",
      percent: monthData.workingDays
        ? ((monthData.present / monthData.workingDays) * 100).toFixed(1)
        : "",
    };
  });

  const totalWorkingDays = attendanceByMonth.reduce((sum, it) => sum + (parseInt(it.workingDays) || 0), 0);
  const totalPresent = attendanceByMonth.reduce((sum, it) => sum + (parseInt(it.present) || 0), 0);
  const totalPercent = totalWorkingDays
    ? ((totalPresent / totalWorkingDays) * 100).toFixed(1)
    : "";

  return (
    <section className="bg-white p-6 rounded-2xl shadow-lg max-w-4xl mx-auto border mb-8">
      <h2 className="text-2xl font-bold mb-4 text-teal-700">
        Monthly Attendance
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-center">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-3 py-2 border border-teal-400">Month</th>
              {months.map(mon => (
                <th key={mon} className="px-3 py-2 border border-teal-400">{mon}</th>
              ))}
              <th className="px-3 py-2 border border-teal-400">TOTAL</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr>
              <td className="px-3 py-2 border border-teal-300 font-semibold bg-teal-100">Working Days</td>
              {attendanceByMonth.map((m, idx) => (
                <td key={idx} className="px-3 py-2 border border-teal-200">{m.workingDays}</td>
              ))}
              <td className="px-3 py-2 border border-teal-300 font-bold bg-teal-100">{totalWorkingDays || ""}</td>
            </tr>
            <tr className="bg-teal-50">
              <td className="px-3 py-2 border border-teal-300 font-semibold">Present</td>
              {attendanceByMonth.map((m, idx) => (
                <td key={idx} className="px-3 py-2 border border-teal-200 text-green-700 font-semibold">
                  {m.present}
                </td>
              ))}
              <td className="px-3 py-2 border border-teal-300 font-bold">{totalPresent || ""}</td>
            </tr>
            <tr>
              <td className="px-3 py-2 border border-teal-300 font-semibold bg-teal-100">Percent</td>
              {attendanceByMonth.map((m, idx) => (
                <td key={idx}
                  className={`px-3 py-2 border border-teal-200 font-semibold ${
                    m.percent === "" ? "" : (Number(m.percent) >= 75 ? "text-green-700" : "text-red-500")
                  }`}
                >
                  {m.percent ? `${m.percent}%` : ""}
                </td>
              ))}
              <td className={`px-3 py-2 border border-teal-300 font-bold bg-teal-100 ${
                totalPercent === "" ? "" : (Number(totalPercent) >= 75 ? "text-green-700" : "text-red-500")
              }`}>
                {totalPercent ? `${totalPercent}%` : ""}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);

  // Fallback sample data
  const sampleAttendance = [];

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const studentId = session.user.id;
      try {
        setLoading(true);

        const studentRes = await fetch(`/api/students/${studentId}`);
        const studentData = await studentRes.json();

        const examsRes = await fetch(`/api/exams/student/${studentId}`);
        const examsData = await examsRes.json();

        // Attendance Data
        const attRes = await fetch(`/api/attendance/student/${studentId}`);
        const attData = await attRes.json();

        setStudent(studentData.data || null);
        setExams(examsData.data || []);
        setAttendance(attData.data || []);
      } catch (err) {
        setAttendance([]); // set to empty if fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading Student Dashboard...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">You are not logged in.</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">No student data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Welcome, {student.name}
        </h1>
      </header>
      <section className="bg-white p-6 rounded-2xl shadow-md max-w-4xl mx-auto mb-6">
        <h2 className="text-2xl font-semibold mb-4">Profile Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Admission No:</p>
            <p>{student.admissionNo}</p>
          </div>
          <div>
            <p className="font-medium">Year of Study:</p>
            <p>{student.yearOfStudy}</p>
          </div>
          <div>
            <p className="font-medium">College:</p>
            <p>{student.collegeName}</p>
          </div>
          {student.photo && (
            <div>
              <p className="font-medium">Photo:</p>
              <img
                src={student.photo}
                alt="Profile"
                className="w-32 h-32 rounded-full mt-2"
              />
            </div>
          )}
        </div>
      </section>
      <section className="bg-white p-6 rounded-2xl shadow-md max-w-4xl mx-auto mb-6">
        <h2 className="text-2xl font-semibold mb-4">Exams</h2>
        {exams.length > 0 ? (
          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Marks</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td className="p-2 border">{exam.subject}</td>
                  <td className="p-2 border">{exam.marks}</td>
                  <td className="p-2 border">
                    {new Date(exam.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No exam records available.</p>
        )}
      </section>
      {/* Attendance Section */}
      <MonthlyAttendanceTable attendance={attendance.length > 0 ? attendance : sampleAttendance} />
    </div>
  );
}
