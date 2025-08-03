"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LecturerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [collegeName, setCollegeName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/lecturer/login");
    }

    if (status === "authenticated" && session?.user?.collegeId) {
      // Fetch College Name
      fetch(`/api/colleges/${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.name) setCollegeName(data.name);
        });

      // Fetch Student Count
      fetch(`/api/students/count?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.count !== undefined) {
            setStudentCount(data.count);
          }
        });
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;
  }

  const { user } = session || {};


  useEffect(() => {
  if (status === "authenticated" && session?.user?.collegeId) {
    // Attendance %
    fetch(`/api/attendance/today-percent?collegeId=${session.user.collegeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.percent !== undefined) {
          setAttendancePercent(data.percent);
        }
      });
  }
}, [status, session]);


  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
      {/* College Name */}
      <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded shadow-sm flex items-center justify-center font-semibold">
        <span className="mr-2">🏫</span> {collegeName || "Loading..."}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        🎓 Lecturer Dashboard
      </h1>

      {/* Lecturer Info Card */}
      <div className="mb-8 p-5 bg-slate-100 rounded-xl shadow-md grid sm:grid-cols-2 gap-4">
        <div className="text-gray-800 space-y-2">
          <p>
            <span className="font-semibold">👤 Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-semibold">📧 Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold">📚 Subject:</span> {user?.subject}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow-lg text-center">
          <div className="text-3xl mb-2">👥</div>
          <p className="font-semibold">Total Students</p>
          <p className="text-lg text-blue-900 font-bold">{studentCount}</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg text-center">
          <div className="text-3xl mb-2">📈</div>
          <p className="font-semibold">Today’s Attendance</p>
          <p className="text-lg text-green-900 font-bold">{attendancePercent}%</p>

        </div>

        <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow-lg text-center">
          <div className="text-3xl mb-2">🗓️</div>
          <p className="font-semibold">Exams Scheduled</p>
          <p className="text-lg text-yellow-900 font-bold">3</p>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl shadow-lg text-center">
          <div className="text-3xl mb-2">⚡</div>
          <p className="font-semibold">Quick Actions</p>
          <p className="text-sm text-purple-800">👇 Below</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/student-table">
          <div className="cursor-pointer p-5 bg-blue-100 hover:bg-blue-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-blue-800">📋 Students</p>
          </div>
        </Link>

        <Link href="/attendance-form">
          <div className="cursor-pointer p-5 bg-green-100 hover:bg-green-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-green-800">
              🟢 Take Attendance
            </p>
          </div>
        </Link>

        <Link href="/exams-form">
          <div className="cursor-pointer p-5 bg-yellow-100 hover:bg-yellow-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📝 Add Exam</p>
          </div>
        </Link>

        <Link href="/exam-report">
          <div className="cursor-pointer p-5 bg-pink-100 hover:bg-pink-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-pink-800">📊 Exam Report</p>
          </div>
        </Link>

        <Link href="/attendance-records">
          <div className="cursor-pointer p-5 bg-indigo-100 hover:bg-indigo-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-indigo-800">
              📆 Attendance Records
            </p>
          </div>
        </Link>

        <Link href="/register">
          <div className="cursor-pointer p-5 bg-pink-100 hover:bg-indigo-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-indigo-800">
              ➕ Add Student
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
