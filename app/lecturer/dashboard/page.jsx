"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function LecturerDashboard() {
  const { data: session, status } = useSession();
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
      fetch(`/api/colleges/${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.name) setCollegeName(data.name);
        });

      fetch(
        `/api/students/count?collegeId=${session.user.collegeId}&subject=${encodeURIComponent(
          session.user.subject
        )}`
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
      fetch(`/api/attendance/today-breakdown?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setFirstYearPresent(data.firstYear || 0);
            setSecondYearPresent(data.secondYear || 0);
            setTotalPresent((data.firstYear || 0) + (data.secondYear || 0));
            setAttendancePercent(data.percent || 0);
          }
        });
    }
  }, [status, session]);

  if (status === "loading") {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  const { user } = session || {};





  return (
    <div className="max-w-6xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
      {/* College Name */}
      <div className="mb-8 px-6 py-4 bg-blue-50 border-2-[6px] border-black-600 rounded-lg flex items-center gap-4 ">
        <GraduationCap className="w-9 h-9 text-blue-700" />
        <h1 className="text-xl font-bold text-blue-800 tracking-wide">
          {collegeName || "Loading..."}
        </h1>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-10 text-blue-900 tracking-tight">
        🎓 Lecturer Dashboard
      </h1>

      {/* Lecturer Info Card */}
      <div className="mb-10 flex items-center gap-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md rounded-2xl border border-blue-200 max-w-3xl mx-auto">

        <div className="flex-1 space-y-1 max-w-md mx-auto">
          <p className="text-md font-bold text-blue-900 flex items-center gap-3 tracking-tight break-words">
            <span>👤</span> {user?.name || "Lecturer Name"}
          </p>
          <p className="text-md font-medium text-blue-800 flex items-center gap-3 tracking-tight break-words">
            <span>📧</span> {user?.email || "Lecturer Email"}
          </p>
          <p className="text-md text-black-800 flex items-center gap-3 tracking-tight break-words">
            <span>📚</span> Junior Lecturer in {user?.subject || "Subject"}
          </p>
        </div>
        {/* </div> */}

      </div>

      {/* Welcome Message */}
      <div className="mb-10 p-6 shadow-md rounded-2xl bg-blue-50 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-black-800 mb-4">
          Welcome, {user?.name || "Lecturer"}!
        </h2>
        <p className="text-black-800 text-lg">
          You are now logged in as a Lecturer in {collegeName || "College"}.
        </p>
      </div>

      {/* Summary Cards */}
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
  <motion.div
    whileHover={{ scale: 1.07 }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-gradient-to-br from-blue-100 to-blue-400 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
  >
    <div className="text-2xl mb-3 animate-pulse text-blue-900">👥</div>
    <p className="text-2xl font-bold text-blue-900">Total Students</p>
    <p className="text-2xl  font-extrabold text-blue-900 mt-2">{studentCount}</p>
  </motion.div>

  <motion.div
    whileHover={{ scale: 1.07 }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-br from-green-100 to-green-200 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
  >
    <div className="text-5xl mb-3 animate-bounce text-green-900">📈</div>
    <p className="text-lg font-bold text-green-900">Today's Attendance</p>
    <div className="mt-3 space-y-1 text-green-900 font-semibold text-base">
      <p>First Year: <span className="font-extrabold">{firstYearPresent}</span></p>
      <p>Second Year: <span className="font-extrabold">{secondYearPresent}</span></p>
      <hr className="my-1 border-green-600 w-3/5 mx-auto rounded" />
      <p>College Total: <span className="text-lg font-extrabold">{totalPresent}</span></p>
      <p>Percentage: <span className="text-lg font-extrabold">{attendancePercent}%</span></p>
    </div>
  </motion.div>

  <motion.div
    whileHover={{ scale: 1.07 }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
  >
    <div className="text-5xl mb-3 animate-bounce text-yellow-900">🗓️</div>
    <p className="text-lg font-bold text-yellow-900">Exams Scheduled</p>
    <div className="mt-3 text-yellow-900 font-semibold">
      <p className="text-2xl font-extrabold mb-1">Quarterly Examinations</p>
      <p className="text-lg font-semibold">15-08-2025 to 20-09-2025</p>
    </div>
  </motion.div>

  <motion.div
    whileHover={{ scale: 1.07 }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gradient-to-br from-purple-200 to-purple-400 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
  >
    <div className="text-5xl mb-3 animate-bounce text-purple-500">⚡</div>
    <p className="text-lg font-bold text-purple-900">Quick Actions</p>
    <p className="mt-2 text-purple-700 font-semibold text-sm">Use the links below for fast navigation.</p>
  </motion.div>
</div>


      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {[
          { href: "/student-table", label: "📋 View Students", bg: "blue-100", hover: "blue-300", text: "blue-800" },
          { href: "/register", label: "➕ Add Student", bg: "blue-100", hover: "blue-300", text: "blue-800" },
          { href: "/attendance-form", label: "🟢 Take Attendance", bg: "green-100", hover: "green-300", text: "green-800" },
          { href: "/lecturer/attendance/group-wise", label: "📅 Group wise Attendance", bg: "yellow-100", hover: "yellow-300", text: "yellow-800" },
          { href: "/attendance-records", label: "📆 Attendance Records", bg: "blue-100", hover: "indigo-300", text: "indigo-800" },
          { href: "/lecturer/attendance", label: "📅 Attendance with names", bg: "green-100", hover: "green-300", text: "green-800" },
          { href: "/attendance-records/individual", label: "📅 Edit Attendance Records", bg: "blue-100", hover: "blue-400", text: "blue-900" },
          { href: "/attendance-records/attendance-calendar", label: "📅 Calendar View Attendance", bg: "green-100", hover: "green-400", text: "green-900" },
          { href: "/attendance-records/monthly-summary", label: "📅 Monthly Attendance", bg: "blue-100", hover: "yellow-400", text: "yellow-900" },
          { href: "/exams-form", label: "📝 Add Exam", bg: "green-200", hover: "green-400", text: "green-900" },
          { href: "/exam-report", label: "📊 Exam Records", bg: "green-200", hover: "pink-400", text: "pink-900" },
          { href: "/create-question-paper", label: "🟢 Question paper genarator", bg: "blue-100", hover: "cyan-400", text: "cyan-900" },
        ].map(({ href, label, bg, hover, text }) => (
          <Link key={href} href={href}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer p-5 rounded-xl text-center shadow-md transition-all bg-${bg} hover:bg-${hover} text-${text}`}
            >
              <p className={`text-xl font-semibold`}>{label}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
