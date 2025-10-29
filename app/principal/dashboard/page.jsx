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

const fetcher = url => fetch(url).then(res => res.json())

export default function PrincipalDashboard() {
  const [shortageData, setShortageData] = useState([])
  const { data: session } = useSession()
  const principal = session?.user
  const collegeName = principal?.collegeName || 'Your College'

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

  // ---- Session-wise Accurate Calculation ----
  const presentAbsentByYear = {
    firstYear: { fnPresent: 0, fnAbsent: 0, anPresent: 0, anAbsent: 0 },
    secondYear: { fnPresent: 0, fnAbsent: 0, anPresent: 0, anAbsent: 0 }
  }
  const sessionWisePresent = data?.sessionWisePresent || {}
  const sessionWiseAbsentees = data?.sessionWiseAbsentees || {}

  // FN
  if (Array.isArray(sessionWisePresent.FN)) {
    sessionWisePresent.FN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first')) presentAbsentByYear.firstYear.fnPresent++
      else if (student.yearOfStudy?.toLowerCase().includes('second')) presentAbsentByYear.secondYear.fnPresent++
    })
  }
  if (Array.isArray(sessionWiseAbsentees.FN)) {
    sessionWiseAbsentees.FN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first')) presentAbsentByYear.firstYear.fnAbsent++
      else if (student.yearOfStudy?.toLowerCase().includes('second')) presentAbsentByYear.secondYear.fnAbsent++
    })
  }
  // AN
  if (Array.isArray(sessionWisePresent.AN)) {
    sessionWisePresent.AN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first')) presentAbsentByYear.firstYear.anPresent++
      else if (student.yearOfStudy?.toLowerCase().includes('second')) presentAbsentByYear.secondYear.anPresent++
    })
  }
  if (Array.isArray(sessionWiseAbsentees.AN)) {
    sessionWiseAbsentees.AN.forEach(student => {
      if (student.yearOfStudy?.toLowerCase().includes('first')) presentAbsentByYear.firstYear.anAbsent++
      else if (student.yearOfStudy?.toLowerCase().includes('second')) presentAbsentByYear.secondYear.anAbsent++
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
  const overallPercent = overallTotal > 0
    ? Math.round((overallPresent / overallTotal) * 100)
    : 0

  // First Year
  const firstYearPresent = presentAbsentByYear.firstYear.fnPresent + presentAbsentByYear.firstYear.anPresent
  const firstYearAbsent = presentAbsentByYear.firstYear.fnAbsent + presentAbsentByYear.firstYear.anAbsent
  const firstYearTotal = firstYearPresent + firstYearAbsent
  const firstYearPercent = firstYearTotal > 0
    ? Math.round((firstYearPresent / firstYearTotal) * 100)
    : 0

  // Second Year
  const secondYearPresent = presentAbsentByYear.secondYear.fnPresent + presentAbsentByYear.secondYear.anPresent
  const secondYearAbsent = presentAbsentByYear.secondYear.fnAbsent + presentAbsentByYear.secondYear.anAbsent
  const secondYearTotal = secondYearPresent + secondYearAbsent
  const secondYearPercent = secondYearTotal > 0
    ? Math.round((secondYearPresent / secondYearTotal) * 100)
    : 0

  return (
    <div className="flex min-h-screen bg-gradient-to-br bg-[url('/images/texture.jpg')] from-indigo-100 via-white to-blue-100 bg-cover bg-center">
      {/* Sidebar */}
      <aside className="hidden w-56 bg-black p-6 shadow-md md:block">
        <h2 className="mb-8 text-2xl font-bold text-white">OSRA</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-white hover:text-blue-600">
            <Users className="h-5 w-5" /> Students
          </Link>
          <Link href="/exam-report" className="flex items-center gap-2 text-white hover:text-blue-600">
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
        
        <Card className="shadow-4lg mx-auto w-full max-w-xs rounded-2xl border border-blue-200 bg-blue-100 p-4 mb-6">
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


<ActiveLecturersCard
  className="mx-auto w-full max-w-md mb-6"
  lecturers={activeLecturersData?.data || []}
  loading={!activeLecturersData && !activeLecturersError}
  error={activeLecturersError}
  title="Currently Active Lecturers"
/>



        <div className="mt-6 mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Overall Attendance Card */}
          <Card className="rounded-2xl border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-base">
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">Present (FN+AN):</span>
                  <span className="font-bold">{overallPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-600">Absent (FN+AN):</span>
                  <span className="font-bold">{overallAbsent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-blue-600">Attendance %:</span>
                  <span className="font-bold">{overallPercent}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">Total (FN+AN):</span>
                  <span className="font-bold">{overallTotal}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* First Year Attendance Card */}
          <Card className="rounded-2xl border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-green-200 p-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">First Year Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-base">
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">FN Present:</span>
                  <span className="font-bold">{presentAbsentByYear.firstYear.fnPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-600">FN Absent:</span>
                  <span className="font-bold">{presentAbsentByYear.firstYear.fnAbsent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">AN Present:</span>
                  <span className="font-bold">{presentAbsentByYear.firstYear.anPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-600">AN Absent:</span>
                  <span className="font-bold">{presentAbsentByYear.firstYear.anAbsent}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold">{firstYearTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-blue-700">Attendance %:</span>
                  <span className="font-bold">{firstYearPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Second Year Attendance Card */}
          <Card className="rounded-2xl border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-purple-200 p-6">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Second Year Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-base">
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">FN Present:</span>
                  <span className="font-bold">{presentAbsentByYear.secondYear.fnPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-600">FN Absent:</span>
                  <span className="font-bold">{presentAbsentByYear.secondYear.fnAbsent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-green-700">AN Present:</span>
                  <span className="font-bold">{presentAbsentByYear.secondYear.anPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-red-600">AN Absent:</span>
                  <span className="font-bold">{presentAbsentByYear.secondYear.anAbsent}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold text-gray-700">Total:</span>
                  <span className="font-bold">{secondYearTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-blue-700">Attendance %:</span>
                  <span className="font-bold">{secondYearPercent}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All other sections as in your original dashboard */}
        <Card className="rounded-2xl bg-white p-2 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Group wise Attendance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session?.user && (
              <GroupWiseAttendanceTable
                collegeId={session.user.collegeId}
                collegeName={session.user.collegeName}
              />
            )}
          </CardContent>
          <AttendanceShortageSummary data={shortageData} />
        </Card>

        {/* Absentees table section (optional, per your use) */}
        <div className="mt-6">
          <h3 className="mb-2 font-semibold">Today's Absentees</h3>
          {absentees.length === 0 ? (
            <p className="text-green-600">🎉 No Absentees Today</p>
          ) : (
            <AbsenteesTable absentees={absentees} />
          )}
        </div>

        {/* Quick Links */}
        <section className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/attendance-records"
            className="cursor-pointer rounded-xl bg-indigo-100 p-5 text-center shadow-md transition hover:bg-indigo-200"
          >
            <p className="text-xl font-semibold text-indigo-800">📆 Attendance Records</p>
          </Link>
          <Link href="/student-table">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer rounded-xl bg-blue-100 p-5 text-center shadow-md transition hover:bg-blue-200"
            >
              <p className="text-xl font-semibold text-blue-800">📋 View Students</p>
            </motion.div>
          </Link>

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
