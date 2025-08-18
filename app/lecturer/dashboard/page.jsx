//app/lecturer/dashboard/page.jsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function LecturerDashboard() {
  const { data: session, status } = useSession();
  console.log(session?.user);
  const router = useRouter();

  const [collegeName, setCollegeName] = useState("");
  const [studentCount, setStudentCount] = useState(0);
  const [attendancePercent, setAttendancePercent] = useState(0);

  const [firstYearPresent, setFirstYearPresent] = useState(0);
  const [secondYearPresent, setSecondYearPresent] = useState(0);
  const [totalPresent, setTotalPresent] = useState(0);



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
   fetch(
  `/api/students/count?collegeId=${session.user.collegeId}&subject=${encodeURIComponent(session.user.subject)}`
)
  .then((res) => res.json())
  .then((data) => {
    if (data?.count !== undefined) {
      setStudentCount(data.count);
    }
  });
    }
  }, [status, session, router]);




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



useEffect(() => {
  if (status === "authenticated" && session?.user?.collegeId) {
    // Fetch today’s attendance breakdown
    fetch(`/api/attendance/today-breakdown?collegeId=${session.user.collegeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setFirstYearPresent(data.firstYear || 0);
          setSecondYearPresent(data.secondYear || 0);
          setTotalPresent((data.firstYear || 0) + (data.secondYear || 0));
          setAttendancePercent(data.percent || 0); // Optional
        }
      });
  }
}, [status, session]);



if (status === "loading") {
  return <div className="text-center mt-10 text-gray-600">Loading...</div>;
}

const { user } = session || {};



  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-gradient-to-r from-slate-50 via-amber-50 to-teal-50 rounded-2xl shadow-xl">
      {/* College Name */}
      <div className="mb-6 px-6 py-3 bg-white border-l-4 border-blue-500 text-gray-800 rounded-lg shadow flex items-center justify-center space-x-3">
        <GraduationCap className="w-8 h-8 text-blue-600" />
        <h1 className="text-xl font-semibold tracking-wide">
          {collegeName || "Loading..."}
        </h1>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        🎓 Lecturer Dashboard
      </h1>





{/* Lecturer Info Card */}
<div className="mb-8 p-6 bg-gradient-to-r from-slate-100 to-blue-100 rounded-2xl shadow-lg border border-blue-200 max-w-2xl mx-auto">
  <div className="flex items-center gap-4">
    <div className="bg-blue-500 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-md border-2 border-blue-300">
      {/* Lecturer initials or icon */}
      <span>
        {user?.name
          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : '👤'}
      </span>
    </div>
    <div className="flex-1">
      <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span>👤</span>
        <span>{user?.name || 'Lecturer Name'}</span>
      </p>
      <p className="text-base font-medium text-gray-700 flex items-center gap-2">
        <span>📧</span>
        <span>{user?.email || 'Lecturer Email'}</span>
      </p>
      <p className="text-base text-gray-700 flex items-center gap-2">
        <span>📚</span>
        <span>Junior Lecturer in {user?.subject || 'Subject'}</span>
      </p>
    </div>
  </div>
</div>




      {/* Welcome Message */}
      <div className="mb-8 p-5 bg-white rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4">
          Welcome, {user?.name || "Lecturer"}!
        </h2>
        <p className="text-gray-600"> 
          You are now logged in as a Lecturer in {collegeName || "College"}.
        </p>
      </div>



      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">


 



  <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-300 rounded-xl shadow-lg text-center">
  <motion.div
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="p-5 bg-gradient-to-br from-blue-100 to-blue-500 rounded-xl shadow-lg text-center"
  >
    <div className="text-3xl mb-2 animate-pulse">👥</div>
    <p className="font-semibold">Total Students</p>
    <p className="text-lg text-blue-900 font-bold">{studentCount}</p>
  </motion.div>
        </div>



        <div className="p-5 bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg text-center">
<motion.div
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-5 bg-gradient-to-br from-slate-100 to-slate-300 rounded-xl shadow-lg text-center"
  >
    <div className="text-3xl mb-1 animate-bounce">📈</div>
    <p className="font-semibold">Today’s Attendance</p>
    <div className="text-sm text-green-900 font-medium space-y-1">
      <p>First Year: <span className="font-bold">{firstYearPresent}</span></p>
      <p>Second Year: <span className="font-bold">{secondYearPresent}</span></p>
      <hr className="my-1 border-red-500" />
      <p>College Total: <span className="text-lg font-extrabold">{totalPresent}</span></p>
      <p>Percentage: <span className="text-lg font-extrabold">{attendancePercent}%</span></p>
    </div>
  </motion.div>
        </div>



        <div className="p-5 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-xl shadow-lg text-center">

          <motion.div
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-5 bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg text-center"
  >
    <div className="text-3xl mb-1 animate-bounce">🗓️</div>
    <p className="font-semibold">Exams Scheduled</p>
    <div className="text-sm text-green-900 font-medium space-y-1">
 <p className="text-lg text-yellow-900 font-bold">UNIT-II</p>
          <p className="font-semibold">18-082025</p>
          <p className="font-semibold">19-08-2025</p>
          <p className="font-semibold">20-08-2025</p>
    </div>
  </motion.div>

        </div>

        <div className="p-5 bg-gradient-to-br from-purple-100 to-purple-300 rounded-xl shadow-lg text-center">

          <motion.div
    whileHover={{ scale: 1.05 }}
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="p-5 bg-gradient-to-br from-green-100 to-green-300 rounded-xl shadow-lg text-center"
  >
    <div className="text-3xl mb-1 animate-bounce">👇</div>
    <p className="font-semibold">Exams Scheduled</p>
    <div className="text-sm text-green-900 font-medium space-y-1">
          <p className="font-semibold">Quick Actions</p>
          <p className="text-sm text-purple-800">⚡ Below</p>
    </div>
  </motion.div>

        </div>
      </div>

      {/* Quick Actions */}

 

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          <Link href="/student-table">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer p-5 bg-blue-100 hover:bg-blue-200 rounded-xl text-center shadow-md transition-all"
            >
              <p className="text-xl font-semibold text-blue-800">📋 View Students</p>
            </motion.div>
          </Link>


        <Link href="/register">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer p-5 bg-blue-100 hover:bg-blue-200 rounded-xl text-center shadow-md transition-all"
            >
              <p className="text-xl font-semibold text-blue-800">➕ Add Student</p>
            </motion.div>
        </Link>

        <Link href="/attendance-form">
          <div className="cursor-pointer p-5 bg-green-100 hover:bg-green-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-green-800">
              🟢 Take Attendance
            </p>
          </div>
        </Link>

     <Link href="/lecturer/attendance/group-wise">
          <div className="cursor-pointer p-5 bg-yellow-100 hover:bg-yellow-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📅 Group wise Attendance</p>
          </div>
        </Link>

        <Link href="/attendance-records">
          <div className="cursor-pointer p-5 bg-indigo-100 hover:bg-indigo-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-indigo-800">
              📆 Attendance Records
            </p>
          </div>
        </Link>



        <Link href="/lecturer/attendance">
          <div className="cursor-pointer p-5 bg-pink-100 hover:bg-indigo-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-indigo-800">
              📅 Attendance with names
            </p>
          </div>
        </Link>


        <Link href="/attendance-records/individual">
          <div className="cursor-pointer p-5 bg-yellow-300 hover:bg-yellow-200 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📅 Edit Attendance Records</p>
          </div>
        </Link>

        <Link href="/attendance-records/attendance-calendar">
          <div className="cursor-pointer p-5 bg-green-200 hover:bg-amber-400 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📅 Calendar View Attendance</p>
          </div>
        </Link>


        <Link href="/attendance-records/monthly-summary">
          <div className="cursor-pointer p-5 bg-yellow-200 hover:bg-cyan-500 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📅 Monthly Summary  Attendance</p>
          </div>
        </Link>

                <Link href="/exams-form">
          <div className="cursor-pointer p-5 bg-green-200 hover:bg-slate-400 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-yellow-800">📝 Add Exam</p>
          </div>
        </Link>

        <Link href="/exam-report">
          <div className="cursor-pointer p-5 bg-pink-200 hover:bg-pink-500 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-pink-800">
              📊 Exam Records
            </p>
          </div>
        </Link>


        <Link href="/caretaker">
          <div className="cursor-pointer p-5 bg-cyan-200 hover:bg-slate-500 rounded-xl text-center shadow-md">
            <p className="text-xl font-semibold text-green-800">
              🟢 Caretaker
            </p>
          </div>
        </Link>


      </div>
    </div>
  );
}
