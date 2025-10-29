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

  // Session-wise states
  const [collegeName, setCollegeName] = useState("");
  const [studentCount, setStudentCount] = useState(0);

  const [fnFirstYearPresent, setFnFirstYearPresent] = useState(0);
  const [fnFirstYearAbsent, setFnFirstYearAbsent] = useState(0);
  const [anFirstYearPresent, setAnFirstYearPresent] = useState(0);
  const [anFirstYearAbsent, setAnFirstYearAbsent] = useState(0);

  const [fnSecondYearPresent, setFnSecondYearPresent] = useState(0);
  const [fnSecondYearAbsent, setFnSecondYearAbsent] = useState(0);
  const [anSecondYearPresent, setAnSecondYearPresent] = useState(0);
  const [anSecondYearAbsent, setAnSecondYearAbsent] = useState(0);

  const [overallPresent, setOverallPresent] = useState(0);
  const [overallAbsent, setOverallAbsent] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);

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

      fetch(`/api/students/count?collegeId=${session.user.collegeId}&subject=${encodeURIComponent(
          session.user.subject
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data?.count !== undefined) setStudentCount(data.count);
        });

      fetch(`/api/attendance/today-absentees?collegeId=${session.user.collegeId}`)
        .then((res) => res.json())
        .then((data) => {
          // Session-wise arrays
          const present = data?.sessionWisePresent || {};
          const absent = data?.sessionWiseAbsentees || {};

          // FN Session
          setFnFirstYearPresent((present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length);
          setFnSecondYearPresent((present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length);
          setFnFirstYearAbsent((absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length);
          setFnSecondYearAbsent((absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length);

          // AN Session
          setAnFirstYearPresent((present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length);
          setAnSecondYearPresent((present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length);
          setAnFirstYearAbsent((absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length);
          setAnSecondYearAbsent((absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length);

          // Overall
          const totalPresent =
            (present.FN ? present.FN.length : 0) +
            (present.AN ? present.AN.length : 0);
          const totalAbsent =
            (absent.FN ? absent.FN.length : 0) +
            (absent.AN ? absent.AN.length : 0);
          setOverallPresent(totalPresent);
          setOverallAbsent(totalAbsent);
          const totalStudents = totalPresent + totalAbsent;
          setOverallPercent(
            totalStudents > 0
              ? Math.round((totalPresent / totalStudents) * 100)
              : 0
          );
        });
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="text-center mt-10 text-gray-500">Loading...</div>
    );
  }

  const user = session?.user || {};

  // First Year values
  const firstYearTotal =
    fnFirstYearPresent + fnFirstYearAbsent +
    anFirstYearPresent + anFirstYearAbsent;
  const firstYearPresent = fnFirstYearPresent + anFirstYearPresent;
  const firstYearPercent = firstYearTotal > 0
    ? Math.round((firstYearPresent / firstYearTotal) * 100)
    : 0;

  // Second Year values
  const secondYearTotal =
    fnSecondYearPresent + fnSecondYearAbsent +
    anSecondYearPresent + anSecondYearAbsent;
  const secondYearPresent = fnSecondYearPresent + anSecondYearPresent;
  const secondYearPercent = secondYearTotal > 0
    ? Math.round((secondYearPresent / secondYearTotal) * 100)
    : 0;

  return (
    <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-gray-200 bg-black bg-[url('/images/bg-texture.jpg')] bg-cover bg-center p-6 shadow-lg">
      {/* College Name Title */}
      <div className="border-black-600 mb-8 flex items-center gap-4 rounded-lg border-2 bg-blue-50 px-6 py-4">
        <GraduationCap className="h-9 w-9 text-blue-700" />
        <h1 className="text-xl font-bold tracking-wide text-blue-800">
          {collegeName || 'Loading...'}
        </h1>
      </div>
      <div className="mb-10 flex items-center justify-center">
        <h1 className="mr-5 text-2xl font-bold tracking-tight text-white">Lecturer Dashboard</h1>
        <img src="/images/classroombg.jpg" alt="Lecturer Dashboard Icon" className="h-10 w-10 rounded" />
      </div>
      {/* Lecturer Info Card */}
      <div className="mb-10 mx-auto max-w-3xl flex items-center gap-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-6 shadow-md">
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
      {/* Attendance Cards */}
      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Overall Today's Attendance Card */}
        <motion.div className="rounded-2xl border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <h3 className="mb-2 text-xl font-bold flex items-center gap-2 text-blue-900">📈 Today's Attendance</h3>
          <div className="mb-2 flex justify-between"><span>FN Present:</span><span className="font-bold text-green-700">{fnFirstYearPresent + fnSecondYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>FN Absent:</span><span className="font-bold text-red-700">{fnFirstYearAbsent + fnSecondYearAbsent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Present:</span><span className="font-bold text-green-700">{anFirstYearPresent + anSecondYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Absent:</span><span className="font-bold text-red-700">{anFirstYearAbsent + anSecondYearAbsent}</span></div>
          <div className="flex justify-between border-t pt-2"><span>Total Students:</span>
            <span className="font-bold">{overallPresent + overallAbsent}</span>
          </div>
          <div className="flex justify-between"><span>Attendance %:</span><span className="font-bold text-blue-700">{overallPercent}%</span></div>
        </motion.div>
        {/* First Year Card */}
        <motion.div className="rounded-2xl border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-green-200 p-6">
          <h3 className="mb-2 text-xl font-bold flex items-center gap-2 text-green-900">🥇 First Year</h3>
          <div className="mb-2 flex justify-between"><span>FN Present:</span><span className="font-bold text-green-700">{fnFirstYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>FN Absent:</span><span className="font-bold text-red-700">{fnFirstYearAbsent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Present:</span><span className="font-bold text-green-700">{anFirstYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Absent:</span><span className="font-bold text-red-700">{anFirstYearAbsent}</span></div>
          <div className="flex justify-between border-t pt-2"><span>Total:</span>
            <span className="font-bold">{firstYearTotal}</span>
          </div>
          <div className="flex justify-between"><span>Attendance %:</span><span className="font-bold text-blue-700">{firstYearPercent}%</span></div>
        </motion.div>
        {/* Second Year Card */}
        <motion.div className="rounded-2xl border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-purple-200 p-6">
          <h3 className="mb-2 text-xl font-bold flex items-center gap-2 text-purple-900">🥈 Second Year</h3>
          <div className="mb-2 flex justify-between"><span>FN Present:</span><span className="font-bold text-green-700">{fnSecondYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>FN Absent:</span><span className="font-bold text-red-700">{fnSecondYearAbsent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Present:</span><span className="font-bold text-green-700">{anSecondYearPresent}</span></div>
          <div className="mb-2 flex justify-between"><span>AN Absent:</span><span className="font-bold text-red-700">{anSecondYearAbsent}</span></div>
          <div className="flex justify-between border-t pt-2"><span>Total:</span>
            <span className="font-bold">{secondYearTotal}</span>
          </div>
          <div className="flex justify-between"><span>Attendance %:</span><span className="font-bold text-blue-700">{secondYearPercent}%</span></div>
        </motion.div>
      </div>
      {/* Students Count Quick Card */}
      <div className="mb-6 flex items-center gap-4 justify-center">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 py-4 px-6 text-center shadow-lg">
          <p className="font-bold text-lg text-blue-800">Total Students:</p>
          <p className="text-2xl font-extrabold text-indigo-900">{studentCount}</p>
        </div>
      </div>

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
          { href: '/student-table', label: '📋 View Students', bg: 'blue-100', hover: 'blue-300', text: 'blue-800' },
          { href: '/register', label: '➕ Add Student', bg: 'blue-100', hover: 'blue-300', text: 'blue-800' },
          { href: '/exams-form', label: '📝 Add Exam', bg: 'green-200', hover: 'green-400', text: 'green-900' },
        ].map(({ href, label, bg, hover, text }) => (
          <Link key={href} href={href}>
            <motion.div whileHover={{ scale: 1.1, rotate: 2 }} whileTap={{ scale: 0.95 }}
              className={`cursor-pointer rounded-xl p-5 text-center shadow-md transition-all bg-${bg} hover:bg-${hover} text-${text}`}>
              <p className={`text-xl font-semibold`}>{label}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* External Links */}
      <div className="mt-8 grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg bg-blue-500 p-4 font-bold text-blue-50 shadow">
          <a href="https://skr-learn-portal.netlify.app/" target="_blank" rel="noopener noreferrer">
            Voc Question Paper
          </a>
        </div>
        <div className="rounded-lg bg-green-100 p-4 font-bold shadow">
          <a href="https://advanced-question-paper-tailwindcss.netlify.app/" target="_blank" rel="noopener noreferrer">
            M&AT Question Paper
          </a>
        </div>
        <div className="rounded-lg bg-blue-100 p-4 shadow">Card 3</div>
        <div className="rounded-lg bg-yellow-100 p-4 shadow">Card 4</div>
      </div>
    </div>
  );
}
