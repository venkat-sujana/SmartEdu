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
        <div className="rounded-lg bg-blue-100 p-4 shadow">Card 3</div>
        <div className="rounded-lg bg-yellow-100 p-4 shadow">Card 4</div>
      </div>
    </div>
  )
}

