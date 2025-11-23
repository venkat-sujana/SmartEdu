//app/lecturer/dashboard/page.jsx
'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useSWR from 'swr'
import GroupWiseAttendanceTable from '@/app/components/groupwise-attendance-table/page'
import AttendanceShortageTable from '@/app/components/attendance-shortage-summary/page'
import ActiveLecturersCard from '@/app/components/active-lecturers-card/page'
import { UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
const fetcher = (...args) =>
  fetch(...args).then(res => {
    if (!res.ok) throw new Error('Network response was not ok')
    return res.json()
  })

import {
  Calendar,
  Users,
  FileText,
  Edit,
  BarChart,
  ClipboardList,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Home,
  CheckCircle, XCircle, BarChart2, Percent
} from 'lucide-react'


import OverallAttendanceMatrixCard from '@/app/components/OverallAttendanceMatrixCard/page'
import TodayAbsenteesTable from '@/app/absentees-table/page'
import OverallStrengthCard from '@/app/components/overall-strength-card/OverallStrengthCard'



export default function LecturerDashboard() {
  const { data: shortageApiData } = useSWR('/api/attendance/shortage-summary', fetcher)
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const shortageData = shortageApiData?.data || []
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}
  const { data: session, status } = useSession()
  const router = useRouter()

  // Helper: given group, year, session => stats
  function stats(group, year, session) {
    const present =
      sessionWisePresent[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, total, percent }
  }

  const { data: activeLecturersData, error: activeLecturersError } = useSWR(
    '/api/lecturers/active',
    fetcher
  )

  // Session-wise states
  const [collegeName, setCollegeName] = useState('')
  const [studentCount, setStudentCount] = useState(0)

  const [fnFirstYearPresent, setFnFirstYearPresent] = useState(0)
  const [fnFirstYearAbsent, setFnFirstYearAbsent] = useState(0)
  const [anFirstYearPresent, setAnFirstYearPresent] = useState(0)
  const [anFirstYearAbsent, setAnFirstYearAbsent] = useState(0)

  const [fnSecondYearPresent, setFnSecondYearPresent] = useState(0)
  const [fnSecondYearAbsent, setFnSecondYearAbsent] = useState(0)
  const [anSecondYearPresent, setAnSecondYearPresent] = useState(0)
  const [anSecondYearAbsent, setAnSecondYearAbsent] = useState(0)

  const [overallPresent, setOverallPresent] = useState(0)
  const [overallAbsent, setOverallAbsent] = useState(0)
  const [overallPercent, setOverallPercent] = useState(0)

  // Schema groups/add/remove as needed
  const groupNames = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
  const years = ['First Year', 'Second Year']
  const sessionLabels = { FN: 'Forenoon', AN: 'Afternoon', EN: 'Evening' }
  const sessions = ['FN', 'AN', 'EN']

  const absentees = absApiData?.absentees || []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/lecturer/login')
    }

    if (status === 'authenticated' && session?.user?.collegeId) {
      fetch(`/api/colleges/${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.name) setCollegeName(data.name)
        })

      fetch(
        `/api/students/count?collegeId=${session.user.collegeId}&subject=${encodeURIComponent(
          session.user.subject
        )}`
      )
        .then(res => res.json())
        .then(data => {
          if (data?.count !== undefined) setStudentCount(data.count)
        })

      fetch(`/api/attendance/today-absentees?collegeId=${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          // Session-wise arrays
          const present = data?.sessionWisePresent || {}
          const absent = data?.sessionWiseAbsentees || {}

          // FN Session
          setFnFirstYearPresent(
            (present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setFnSecondYearPresent(
            (present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )
          setFnFirstYearAbsent(
            (absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setFnSecondYearAbsent(
            (absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )

          // AN Session
          setAnFirstYearPresent(
            (present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setAnSecondYearPresent(
            (present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )
          setAnFirstYearAbsent(
            (absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setAnSecondYearAbsent(
            (absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )


          // Overall
          const totalPresent =
            (present.FN ? present.FN.length : 0) + (present.AN ? present.AN.length : 0)
          const totalAbsent =
            (absent.FN ? absent.FN.length : 0) + (absent.AN ? absent.AN.length : 0)
          setOverallPresent(totalPresent)
          setOverallAbsent(totalAbsent)
          const totalStudents = totalPresent + totalAbsent
          setOverallPercent(
            totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0
          )
        })
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="mt-10 text-center text-gray-500">Loading...</div>
  }

  const user = session?.user || {}

  // First Year values
  const firstYearTotal =
    fnFirstYearPresent + fnFirstYearAbsent + anFirstYearPresent + anFirstYearAbsent
  const firstYearPresent = fnFirstYearPresent + anFirstYearPresent
  const firstYearPercent =
    firstYearTotal > 0 ? Math.round((firstYearPresent / firstYearTotal) * 100) : 0

  // Second Year values
  const secondYearTotal =
    fnSecondYearPresent + fnSecondYearAbsent + anSecondYearPresent + anSecondYearAbsent
  const secondYearPresent = fnSecondYearPresent + anSecondYearPresent
  const secondYearPercent =
    secondYearTotal > 0 ? Math.round((secondYearPresent / secondYearTotal) * 100) : 0

  function stats(group, year, session) {
    const present =
      sessionWisePresent[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, total, percent }
  }

  return (
    <div className="mx-auto mt-24 max-w-7xl rounded-3xl border border-gray-200 bg-[url('/images/')] bg-cover bg-center p-6 bg-blend-normal shadow-lg">
      {/* College Name Title */}
      <div className="border-black-600 mb-8 flex items-center gap-4 rounded-lg border-2 bg-blue-50 px-6 py-4">
        <GraduationCap className="h-9 w-9 text-blue-700" />
        <h1 className="text-xl font-bold tracking-wide text-blue-800">
          {collegeName || 'Loading...'}
        </h1>
      </div>

      <div className="mb-10 flex items-center justify-center">
        <h1 className="text-md font-bold tracking-tight text-black">LECTURER DASHBOARD</h1>
        <img
          src="/images/classroombg.jpg"
          alt="Lecturer Dashboard Icon"
          className="mr-2 h-15 w-15 rounded object-cover"
        />
      </div>

      <div className="my-6 flex flex-wrap justify-center gap-3">
        <Link href="/attendance-dashboard">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Attendance-Dashboard
          </button>
        </Link>
        <Link href="/attendance-records/individual">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 border-2 border-green-500 bg-white px-6 py-2 font-bold text-white shadow transition hover:scale-105 hover:bg-green-50 sm:w-auto">
            Edit Records
          </button>
        </Link>
        <Link href="/attendance-records/monthly-summary">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-purple-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Cetral Attendance Register
          </button>
        </Link>

        <Link href="/attendance-form">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Take attendance
          </button>
        </Link>

        <Link href="/attendance-records/attendance-calendar">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Calendar-View
          </button>
        </Link>

        <Link href="/exam-report">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Cetral Marks Register
          </button>
        </Link>

        <Link href="/student-table">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            View Students
          </button>
        </Link>
        <Link href="/register">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Add Student
          </button>
        </Link>
        <Link href="/exams-form">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Add Exam
          </button>
        </Link>
        <Link href="/students/bulk-upload">
          <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
            Bulk Upload Students
          </button>
        </Link>
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

      <ActiveLecturersCard
        className="mx-auto mb-10 w-full max-w-md"
        lecturers={activeLecturersData?.data || []}
        loading={!activeLecturersData && !activeLecturersError}
        error={activeLecturersError}
        title="Currently Active Lecturers"
      />








      {/* Students Count Quick Card */}
      <div className=" flex items-center justify-center gap-4 m-10">

        <div className="rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 px-6 py-4 text-center shadow-lg">

          <p className="text-lg font-bold text-blue-800">Total Strength</p>&nbsp;<UserGroupIcon className="h-7 w-7 mr-2 " />
          <p className="text-2xl font-extrabold text-indigo-900">{studentCount}</p>
        </div>
      </div>

      {/* Overall Strength Card */}
      <OverallStrengthCard
        sessionWisePresent={sessionWisePresent}
        sessionWiseAbsentees={sessionWiseAbsentees}
      />





      <OverallAttendanceMatrixCard />



      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Today's Absentees</h2>
        <TodayAbsenteesTable absetees={absentees} />
      </div>


      {/* All other sections as in your original dashboard */}
      <Card className="mt-6 rounded-2xl bg-white p-2 shadow-lg">
        <AttendanceShortageTable data={shortageData} />
      </Card>


      <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        {groupNames.map((group, groupIdx) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 + groupIdx * 0.1 }}
          >
            <Card className="rounded-2xl border-2 border-blue-200 bg-white shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-700">
                  {group}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-7 pt-2">
                {years.map(year => (
                  <div key={year} className="rounded-xl bg-blue-50 p-4">
                    <div className="mb-3 text-lg font-semibold text-blue-900">{year}</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {sessions.map(session => {
                        const s = stats(group, year, session);
                        return (
                          <div
                            key={session}
                            className="rounded-xl border border-blue-100 bg-white p-3 shadow"
                          >
                            <div className="mb-2 font-semibold text-blue-600">
                              {sessionLabels[session]}
                            </div>

                            <div className="flex justify-between items-center gap-1">
                              <CheckCircle className="text-green-600 w-5 h-5" />
                              <span>Present:</span>
                              <span className="font-bold text-green-700">{s.present}</span>
                            </div>

                            <div className="flex justify-between items-center gap-1">
                              <XCircle className="text-red-600 w-5 h-5" />
                              <span>Absent:</span>
                              <span className="font-bold text-red-600">{s.absent}</span>
                            </div>

                            <div className="flex justify-between items-center gap-1">
                              <BarChart2 className="text-gray-700 w-5 h-5" />
                              <span>Total:</span>
                              <span className="font-bold">{s.total}</span>
                            </div>

                            <div className="flex justify-between items-center gap-1">
                              <Percent className="text-blue-700 w-5 h-5" />
                              <span>%:</span>
                              <span className="font-bold text-blue-700">{s.percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
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
          <a
            href="https://advanced-question-paper-tailwindcss.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            M&AT Question Paper
          </a>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center gap-3 pt-10 pb-6 text-gray-600">
        <div className="flex gap-6 text-xl">
          {/* Heroicons (Tailwind official) */}
          <a href="#" className="hover:text-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.874h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" /></svg></a>
          <a href="#" className="hover:text-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
          <a href="#" className="hover:text-pink-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm8.72 6.03a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0L6.47 11.53a.75.75 0 011.06-1.06l3.47 3.47 4.47-4.47z" /></svg></a>
          <a href="#" className="hover:text-blue-700 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48v11.04C2 19.17 3.33 20.5 4.98 20.5h14.04c1.65 0 2.98-1.33 2.98-2.98V6.48c0-1.65-1.33-2.98-2.98-2.98H4.98zM8.75 17h-2v-7h2v7zm-1-8.27a1.27 1.27 0 110-2.54 1.27 1.27 0 010 2.54zM18 17h-2v-3.6c0-2.07-2.5-1.91-2.5 0V17h-2v-7h2v1.06c.87-1.61 4.5-1.73 4.5 1.55V17z" /></svg></a>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} OSRA System • All Rights Reserved</p>
      </footer>




    </div>

  )
}

