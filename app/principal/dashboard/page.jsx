//app/principal/dashboard/page.jsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, BarChart } from 'lucide-react'
import useSWR from 'swr'
import AbsenteesTable from '@/app/absentees-table/page'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import GroupWiseAttendanceTable from '@/app/components/groupwise-attendance-table/page'
import ActiveLecturersCard from '@/app/components/active-lecturers-card/page'
import AttendanceShortageSummary from '@/app/components/attendance-shortage-summary/page'
import OverallAttendanceMatrixCard from '@/app/components/OverallAttendanceMatrixCard/page'
import TodayAbsenteesTable from '@/app/absentees-table/page'
import AttendanceStatsTable from '@/app/components/attendance-stats-table/AttendanceStatsTable'
import { UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import OverallStrengthCard from '@/app/components/overall-strength-card/OverallStrengthCard'

const fetcher = url => fetch(url).then(res => res.json())

export default function PrincipalDashboard() {
  const [shortageData, setShortageData] = useState([])
  const { data: session } = useSession()
  const principal = session?.user
  const collegeName = principal?.collegeName || 'Your College'
  const [studentCount, setStudentCount] = useState(0)

  useEffect(() => {
    fetch('/api/attendance/shortage-summary')
      .then(res => res.json())
      .then(data => setShortageData(data.data || []))
  }, [])

  // Students, lecturers count
  const { data: studentData } = useSWR('/api/students', fetcher)
  const totalStudents = studentData?.data?.length || 0

  const { data: lecturerData } = useSWR('/api/lecturers', fetcher)
  const totalLecturers = lecturerData?.data?.length || 0

  const { data: activeLecturersData, error: activeLecturersError } = useSWR(
    '/api/lecturers/active',
    fetcher
  )
  const { data, error, isLoading } = useSWR('/api/attendance/today-absentees', fetcher)
  const absentees = data?.absentees || []
  const todaysPresent = data?.presentStudents || []

  useEffect(() => {
    if (!session?.user) return
    fetch(
      `/api/students/count?collegeId=${encodeURIComponent(session.user.collegeId)}&subject=${encodeURIComponent(
        session.user.subject || ''
      )}`
    )
      .then(res => res.json())
      .then(data => {
        if (data?.count !== undefined) setStudentCount(data.count)
      })
      .catch(err => {
        console.error('Failed to fetch student count', err)
      })
  }, [session])

  // ---- Session-wise Accurate Calculation ----
  const presentAbsentByYear = {
    firstYear: { fnPresent: 0, fnAbsent: 0, anPresent: 0, anAbsent: 0 },
    secondYear: { fnPresent: 0, fnAbsent: 0, anPresent: 0, anAbsent: 0 },
  }
  const sessionWisePresent = data?.sessionWisePresent || {}
  const sessionWiseAbsentees = data?.sessionWiseAbsentees || {}

  // FN
  if (Array.isArray(sessionWisePresent.FN)) {
    sessionWisePresent.FN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first'))
        presentAbsentByYear.firstYear.fnPresent++
      else if (student.yearOfStudy?.toLowerCase().includes('second'))
        presentAbsentByYear.secondYear.fnPresent++
    })
  }
  if (Array.isArray(sessionWiseAbsentees.FN)) {
    sessionWiseAbsentees.FN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first'))
        presentAbsentByYear.firstYear.fnAbsent++
      else if (student.yearOfStudy?.toLowerCase().includes('second'))
        presentAbsentByYear.secondYear.fnAbsent++
    })
  }
  // AN
  if (Array.isArray(sessionWisePresent.AN)) {
    sessionWisePresent.AN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first'))
        presentAbsentByYear.firstYear.anPresent++
      else if (student.yearOfStudy?.toLowerCase().includes('second'))
        presentAbsentByYear.secondYear.anPresent++
    })
  }
  if (Array.isArray(sessionWiseAbsentees.AN)) {
    sessionWiseAbsentees.AN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first'))
        presentAbsentByYear.firstYear.anAbsent++
      else if (student.yearOfStudy?.toLowerCase().includes('second'))
        presentAbsentByYear.secondYear.anAbsent++
    })
  }

  // Horizontal Sums
  const fnPresentTotal =
    presentAbsentByYear.firstYear.fnPresent + presentAbsentByYear.secondYear.fnPresent
  const fnAbsentTotal =
    presentAbsentByYear.firstYear.fnAbsent + presentAbsentByYear.secondYear.fnAbsent
  const anPresentTotal =
    presentAbsentByYear.firstYear.anPresent + presentAbsentByYear.secondYear.anPresent
  const anAbsentTotal =
    presentAbsentByYear.firstYear.anAbsent + presentAbsentByYear.secondYear.anAbsent

  const overallPresent = fnPresentTotal + anPresentTotal
  const overallAbsent = fnAbsentTotal + anAbsentTotal
  const overallTotal = overallPresent + overallAbsent
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  // First Year
  const firstYearPresent =
    presentAbsentByYear.firstYear.fnPresent + presentAbsentByYear.firstYear.anPresent
  const firstYearAbsent =
    presentAbsentByYear.firstYear.fnAbsent + presentAbsentByYear.firstYear.anAbsent
  const firstYearTotal = firstYearPresent + firstYearAbsent
  const firstYearPercent =
    firstYearTotal > 0 ? Math.round((firstYearPresent / firstYearTotal) * 100) : 0

  // Second Year
  const secondYearPresent =
    presentAbsentByYear.secondYear.fnPresent + presentAbsentByYear.secondYear.anPresent
  const secondYearAbsent =
    presentAbsentByYear.secondYear.fnAbsent + presentAbsentByYear.secondYear.anAbsent
  const secondYearTotal = secondYearPresent + secondYearAbsent
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
    <div className="mt-24 flex min-h-screen bg-gradient-to-br bg-[url('/images/')] from-indigo-100 via-white to-blue-100 bg-cover bg-center">
      {/* Sidebar */}
      <aside className="hidden w-56 bg-black p-6 shadow-md md:block">
        <h2 className="mb-8 text-2xl font-bold text-white">OSRA</h2>
        <nav className="space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-white hover:text-blue-600"
          >
            <Users className="h-5 w-5" /> Students
          </Link>
          <Link
            href="/exam-report"
            className="flex items-center gap-2 text-white hover:text-blue-600"
          >
            <Users className="h-5 w-5" /> exams
          </Link>
          <Link href="#" className="flex items-center gap-2 text-white hover:text-blue-600">
            <Calendar className="h-5 w-5" /> Attendance
          </Link>
          <Link href="#" className="flex items-center gap-2 text-white hover:text-blue-600">
            <BarChart className="h-5 w-5" /> Reports
          </Link>
        </nav>
      </aside>

      <main className="w-full flex-1 space-y-6 p-2 sm:p-4 md:p-6">
        {/* Header, Info, Lecturers etc... (same as before) */}

        <Card className="shadow-xl mx-auto mb-6 w-full max-w-xs rounded-2xl border border-blue-200 bg-blue-100 p-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            {principal?.photo ? (
              <img
                src={principal.photo}
                alt="Principal"
                className="h-20 w-20 rounded-full border object-cover shadow md:h-28 md:w-28"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-gray-500 md:h-28 md:w-28">
                No Photo
              </div>
            )}
            <div className="text-center sm:text-left">
              <p className="text-xl font-semibold">{principal?.name || 'Principal'}</p>
              <p className="text-gray-600">{principal?.email}</p>
              <p className="text-sm text-gray-500">{principal?.collegeName}</p>
            </div>
          </div>
        </Card>



        <div className="my-6 flex flex-wrap justify-center gap-3">
          <Link href="/attendance-dashboard">
            <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
              Attendance-Dashboard
            </button>
          </Link>
          <Link href="/attendance-records/individual">
            <button className="w-full cursor-pointer rounded-full border-2 border-green-500 bg-orange-200 px-6 py-2 font-bold text-green-700 shadow transition hover:scale-105 hover:bg-green-50 sm:w-auto">
              Edit Records
            </button>
          </Link>
          <Link href="/attendance-records/monthly-summary">
            <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-purple-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
              Central Attendance Register
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
              Central Marks Register
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
        </div>

        <ActiveLecturersCard
          className="mx-auto mb-6 w-full max-w-md shadow-xl"
          lecturers={activeLecturersData?.data || []}
          loading={!activeLecturersData && !activeLecturersError}
          error={activeLecturersError}
          title="Currently Active Lecturers"
        />

        {/* Students Count Quick Card */}
        <div className="mb-6 flex items-center justify-center gap-4">
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



        <Card className="mt-6 rounded-2xl bg-white p-2 shadow-lg">
          <AttendanceShortageSummary data={shortageData} />
        </Card>

        <div className="p-6">
          <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-blue-900">
            Attendance At a Glance
          </h1>
          <AttendanceStatsTable stats={stats} />
        </div>


        

        {/* Quick Links */}
        <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link href="/announcements">
            <p className="cursor-pointer rounded-xl bg-green-100 p-5 text-center shadow-md transition hover:bg-green-200">
              <span className="text-xl font-semibold text-green-800">📢 Announcements</span>
            </p>
          </Link>
        </section>
      </main>
    </div>
  )
}
