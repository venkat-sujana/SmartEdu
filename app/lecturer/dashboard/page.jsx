"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import ActiveLecturersCard from '@/app/components/active-lecturers-card/page'
import GroupWiseAttendanceTable from '@/app/components/groupwise-attendance-table/page'
import { Card } from '@/components/ui/card'

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
    <div className="mx-auto mt-12 max-w-6xl rounded-3xl border border-gray-200  bg-black  bg-[url('/images/bg-texture.jpg')] bg-cover bg-center p-8 shadow-lg">
      {/* College Name */}
      <div className="border-black-600 mb-8 flex items-center gap-4 rounded-lg border-2 bg-blue-50 px-6 py-4">
        <GraduationCap className="h-9 w-9 text-blue-700" />
        <h1 className="text-xl font-bold tracking-wide text-blue-800">
          {collegeName || 'Loading...'}
        </h1>
      </div>
      {/* Title */}
      <div className="mb-10 flex items-center justify-center">
        <h1 className="mr-5 text-2xl font-bold tracking-tight text-white">Lecturer Dashboard</h1>
        <img
          src="/images/classroombg.jpg"
          alt="Lecturer Dashboard Icon"
          className="h-10 w-10 rounded"
        />
      </div>
      {/* Lecturer Info Card */}
      <div className="mx-auto mb-10 flex max-w-3xl items-center gap-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-md">
        <div className="mx-auto max-w-md flex-1 space-y-1">
          <p className="text-md flex items-center gap-3 font-bold tracking-tight break-words text-blue-900">
            <span>👤</span> {user?.name || 'Lecturer Name'}
          </p>
          <p className="text-md flex items-center gap-3 font-medium tracking-tight break-words text-blue-800">
            <span>📧</span> {user?.email || 'Lecturer Email'}
          </p>
          <p className="text-md text-black-800 flex items-center gap-3 tracking-tight break-words">
            <span>📚</span> Junior Lecturer in {user?.subject || 'Subject'}
          </p>
        </div>
      </div>
      {/* Welcome Message */}
      <div className="mx-auto mb-10 max-w-2xl rounded-2xl bg-blue-50 p-6 text-center shadow-md">
        <h2 className="text-black-800 mb-4 text-3xl font-semibold">
          Welcome, {user?.name || 'Lecturer'}!
        </h2>
        <p className="text-black-800 text-lg font-bold">
          You are now logged in as a Lecturer in {collegeName || 'College'}.
        </p>
      </div>
      <ActiveLecturersCard
        lecturers={ActiveLecturersCard?.data || []}
        loading={!ActiveLecturersCard && !ActiveLecturersCard}
        error={ActiveLecturersCard}
        title="Currently Active Lecturers"
      />
      {/* Summary Cards - Updated with Correct Calculations */}
      <div className="mt-12 mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Students Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex cursor-default flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-400 py-8 text-center shadow-lg"
        >
          <div className="mb-3 animate-pulse text-2xl text-blue-900">👥</div>
          <p className="text-2xl font-bold text-blue-900">Total Students</p>
          <p className="mt-2 text-2xl font-extrabold text-blue-900">{studentCount}</p>
        </motion.div>

        {/* Today's Attendance Card (Overall) */}
        <motion.div
          whileHover={{ scale: 1.04, y: -3 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative mx-auto flex max-w-md cursor-default flex-col items-center overflow-hidden rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-emerald-100 via-white to-emerald-200 px-10 py-8 text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/20 via-transparent to-green-300/30 blur-3xl"></div>
          <div className="relative z-10 mb-3 animate-pulse text-6xl text-emerald-700 drop-shadow-lg">
            📈
          </div>
          <p className="relative z-10 text-xl font-extrabold tracking-wide text-emerald-900">
            Today's Attendance
          </p>
          <div className="relative z-10 my-4 h-[3px] w-2/5 rounded-full bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 shadow-md"></div>
          <div className="relative z-10 space-y-2 text-base font-medium text-emerald-900">
            <p>
              College Total:{' '}
              <span className="text-lg font-extrabold text-emerald-950">{totalPresent}</span>
            </p>
            <p>
              Percentage:{' '}
              <span className="text-lg font-extrabold text-green-700">{attendancePercent}%</span>
            </p>
          </div>
        </motion.div>

        {/* First Year Attendance Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex cursor-default flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-green-100 to-green-300 py-8 text-center shadow-lg"
        >
          <div className="mb-3 animate-pulse text-3xl text-green-800">🥇</div>
          <p className="mb-2 text-xl font-bold text-green-900">First Year</p>
          <div className="space-y-1">
            <p className="text-md text-green-800">
              Present: <span className="font-bold">{firstYearPresent}</span>
            </p>
            <p className="text-md text-red-700">
              Absent: <span className="font-bold">{firstYearAbsent}</span>
            </p>
            <p className="text-lg font-bold text-blue-700">{firstYearPercent}%</p>
          </div>
        </motion.div>

        {/* Second Year Attendance Card */}
        <motion.div
          whileHover={{ scale: 1.07 }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex cursor-default flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-300 py-8 text-center shadow-lg"
        >
          <div className="mb-3 animate-pulse text-3xl text-blue-800">🥈</div>
          <p className="mb-2 text-xl font-bold text-blue-900">Second Year</p>
          <div className="space-y-1">
            <p className="text-md text-green-700">
              Present: <span className="font-bold">{secondYearPresent}</span>
            </p>
            <p className="text-md text-red-700">
              Absent: <span className="font-bold">{secondYearAbsent}</span>
            </p>
            <p className="text-lg font-bold text-blue-700">{secondYearPercent}%</p>
          </div>
        </motion.div>
      </div>

      <Card className="rounded-2xl bg-white p-2 shadow-lg">
        <div className="mt-4">
          {session?.user && (
            <GroupWiseAttendanceTable
              collegeId={session.user.collegeId}
              collegeName={session.user.collegeName}
            />
          )}
        </div>
      </Card>


    
      <Link href="/attendance-dashboard">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer rounded-xl bg-indigo-100 p-5 text-center text-indigo-800 shadow-md transition-all hover:bg-indigo-300 mt-4"
        >
          <p className="text-xl font-semibold">📊 Attendance Dashboard</p>
        </motion.div>
      </Link>
      <Link href="/exam-report">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="mt-4 cursor-pointer rounded-xl bg-indigo-100 p-5 text-center text-indigo-800 shadow-md transition-all hover:bg-indigo-300"
        >
          <p className="text-xl font-semibold">📊 Exams Dashboard</p>
        </motion.div>
      </Link>
      {/* Quick Actions */}
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {[
          {
            href: '/student-table',
            label: '📋 View Students',
            bg: 'blue-100',
            hover: 'blue-300',
            text: 'blue-800',
          },
          {
            href: '/register',
            label: '➕ Add Student',
            bg: 'blue-100',
            hover: 'blue-300',
            text: 'blue-800',
          },
          {
            href: '/exams-form',
            label: '📝 Add Exam',
            bg: 'green-200',
            hover: 'green-400',
            text: 'green-900',
          },
        ].map(({ href, label, bg, hover, text }) => (
          <Link key={href} href={href}>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-xl p-5 text-center shadow-md transition-all bg-${bg} hover:bg-${hover} text-${text}`}
            >
              <p className={`text-xl font-semibold`}>{label}</p>
            </motion.div>
          </Link>
        ))}
      </div>
      {/* External Links Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500 p-4 font-bold text-blue-50 shadow">
          <a href="https://skr-learn-portal.netlify.app/" target="_blank" rel="noopener noreferrer">
            Voc Question Paper
          </a>
        </div>
        <div className="rounded-lg bg-green-100 p-4 font-bold shadow">
          <a
            href="https://advanced-question-paper-tailwindcss.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            M&AT Question Paper
          </a>
        </div>
        <div className="rounded-lg bg-blue-100 p-4 shadow">Card 3</div>
        <div className="rounded-lg bg-yellow-100 p-4 shadow">Card 4</div>
      </div>
    </div>
  )
}
