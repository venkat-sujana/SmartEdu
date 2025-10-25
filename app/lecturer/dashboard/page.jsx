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
  const [firstYearAbsent, setFirstYearAbsent] = useState(0);
  const [secondYearAbsent, setSecondYearAbsent] = useState(0);
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
      fetch(`/api/attendance/today-absentees?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Today Absentees API:", data);
          
          if (data) {
            const absentees = data.absentees || [];
            const presentStudents = data.presentStudents || [];
            
            // Count by year
            let firstYearP = 0, firstYearA = 0;
            let secondYearP = 0, secondYearA = 0;
            
            // Count present students
            presentStudents.forEach(student => {
              if (student.yearOfStudy?.toLowerCase().includes('first')) {
                firstYearP++;
              } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
                secondYearP++;
              }
            });
            
            // Count absent students
            absentees.forEach(student => {
              if (student.yearOfStudy?.toLowerCase().includes('first')) {
                firstYearA++;
              } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
                secondYearA++;
              }
            });
            
            setFirstYearPresent(firstYearP);
            setFirstYearAbsent(firstYearA);
            setSecondYearPresent(secondYearP);
            setSecondYearAbsent(secondYearA);
            setTotalPresent(firstYearP + secondYearP);
            
            const totalStudents = firstYearP + firstYearA + secondYearP + secondYearA;
            const percent = totalStudents > 0 
              ? Math.round(((firstYearP + secondYearP) / totalStudents) * 100)
              : 0;
            setAttendancePercent(percent);
          }
        });
    }
  }, [status, session]);







  if (status === "loading") {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  const { user } = session || {};

  // Calculate totals from present + absent
  const firstYearTotal = firstYearPresent + firstYearAbsent;
  const secondYearTotal = secondYearPresent + secondYearAbsent;

  // Calculate percentages correctly
  const firstYearPercent = firstYearTotal > 0 
    ? Math.round((firstYearPresent / firstYearTotal) * 100) 
    : 0;
  
  const secondYearPercent = secondYearTotal > 0 
    ? Math.round((secondYearPresent / secondYearTotal) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-lg border border-gray-200 bg-[url('/images/bg-9.jpg')] bg-cover bg-center">
      {/* College Name */}
      <div className="mb-8 px-6 py-4 bg-blue-50 border-2 border-black-600 rounded-lg flex items-center gap-4">
        <GraduationCap className="w-9 h-9 text-blue-700" />
        <h1 className="text-xl font-bold text-blue-800 tracking-wide">
          {collegeName || "Loading..."}
        </h1>
      </div>

      {/* Title */}
      <div className="flex items-center justify-center mb-10">
        <h1 className="text-2xl font-bold text-white tracking-tight mr-5">
          Lecturer Dashboard
        </h1>
        <img
          src="/images/classroombg.jpg"
          alt="Lecturer Dashboard Icon"
          className="w-10 h-10 rounded"
        />
      </div>

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
      </div>

      {/* Welcome Message */}
      <div className="mb-10 p-6 shadow-md rounded-2xl bg-blue-50 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-semibold text-black-800 mb-4">
          Welcome, {user?.name || "Lecturer"}!
        </h2>
        <p className="text-black-800 text-lg font-bold">
          You are now logged in as a Lecturer in {collegeName || "College"}.
        </p>
      </div>

      {/* Summary Cards - Updated with Correct Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Total Students Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-blue-100 to-blue-400 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
        >
          <div className="text-2xl mb-3 animate-pulse text-blue-900">👥</div>
          <p className="text-2xl font-bold text-blue-900">Total Students</p>
          <p className="text-2xl font-extrabold text-blue-900 mt-2">{studentCount}</p>
        </motion.div>

        {/* Today's Attendance Card (Overall) */}
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-emerald-100 via-white to-emerald-200 border border-emerald-300/40 px-10 py-8 cursor-default max-w-md mx-auto flex flex-col items-center text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-green-300/30 blur-3xl"></div>
          <div className="relative z-10 text-6xl mb-3 text-emerald-700 drop-shadow-lg animate-pulse">
            📈
          </div>
          <p className="relative z-10 text-xl font-extrabold text-emerald-900 tracking-wide">
            Today's Attendance
          </p>
          <div className="relative z-10 w-2/5 h-[3px] bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 rounded-full my-4 shadow-md"></div>
          <div className="relative z-10 space-y-2 text-emerald-900 font-medium text-base">
            <p>
              College Total: <span className="text-lg font-extrabold text-emerald-950">{totalPresent}</span>
            </p>
            <p>
              Percentage: <span className="text-lg font-extrabold text-green-700">{attendancePercent}%</span>
            </p>
          </div>
        </motion.div>

        {/* First Year Attendance Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-green-100 to-green-300 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
        >
          <div className="text-3xl mb-3 text-green-800 animate-pulse">🥇</div>
          <p className="text-xl font-bold text-green-900 mb-2">First Year</p>
          <div className="space-y-1">
            <p className="text-md text-green-800">
              Present: <span className="font-bold">{firstYearPresent}</span>
            </p>
            <p className="text-md text-red-700">
              Absent: <span className="font-bold">{firstYearAbsent}</span>
            </p>
            <p className="text-lg text-blue-700 font-bold">
              {firstYearPercent}%
            </p>
          </div>
        </motion.div>

        {/* Second Year Attendance Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-100 to-blue-300 rounded-3xl shadow-lg py-8 cursor-default flex flex-col justify-center items-center text-center"
        >
          <div className="text-3xl mb-3 text-blue-800 animate-pulse">🥈</div>
          <p className="text-xl font-bold text-blue-900 mb-2">Second Year</p>
          <div className="space-y-1">
            <p className="text-md text-green-700">
              Present: <span className="font-bold">{secondYearPresent}</span>
            </p>
            <p className="text-md text-red-700">
              Absent: <span className="font-bold">{secondYearAbsent}</span>
            </p>
            <p className="text-lg text-blue-700 font-bold">
              {secondYearPercent}%
            </p>
          </div>
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
          { href: "/", label: "🟢 Question paper generator", bg: "blue-100", hover: "cyan-400", text: "cyan-900" },
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

      {/* External Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4 mt-8">
        <div className="bg-blue-500 shadow p-4 rounded-lg font-bold text-blue-50">
          <a
            href="https://skr-learn-portal.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voc Question Paper
          </a>
        </div>
        <div className="bg-green-100 shadow p-4 rounded-lg font-bold">
          <a
            href="https://advanced-question-paper-tailwindcss.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            M&AT Question Paper
          </a>
        </div>
        <div className="bg-blue-100 shadow p-4 rounded-lg">Card 3</div>
        <div className="bg-yellow-100 shadow p-4 rounded-lg">Card 4</div>
      </div>
    </div>
  );
}
