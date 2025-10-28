//app/principal/dashboard/page.jsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, Calendar, BarChart } from 'lucide-react'
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
  const [filteredReports, setFilteredReports] = useState([])

  useEffect(() => {
    fetch('/api/attendance/shortage-summary')
      .then(res => res.json())
      .then(data => setShortageData(data.data || []))
  }, [])

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

  // Fetch today's present students list from API response (assuming it has)
  const todaysPresent = data?.presentStudents || [] // ఈ array API లో ఉండాలి

  // Calculate present and absent counts for stats cards
  const presentCount = todaysPresent.length
  const absentCount = absentees.length

  // Calculate attendance percentage
  const percentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0

  // Initialize counts
  const presentAbsentByYear = {
    firstYear: { present: 0, absent: 0 },
    secondYear: { present: 0, absent: 0 },
  }

  // Count absent students by year (absentees array)
  absentees.forEach(student => {
    if (student.yearOfStudy?.toLowerCase().includes('first')) {
      presentAbsentByYear.firstYear.absent++
    } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
      presentAbsentByYear.secondYear.absent++
    }
  })

  // Count present students by year (todaysPresent array)
  todaysPresent.forEach(student => {
    if (student.yearOfStudy?.toLowerCase().includes('first')) {
      presentAbsentByYear.firstYear.present++
    } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
      presentAbsentByYear.secondYear.present++
    }
  })

  // Calculate percentages (add these at top in your component)
  const firstYearTotal =
    presentAbsentByYear.firstYear.present + presentAbsentByYear.firstYear.absent
  const firstYearPercentage =
    firstYearTotal > 0
      ? Math.round((presentAbsentByYear.firstYear.present / firstYearTotal) * 100)
      : 0

  const secondYearTotal =
    presentAbsentByYear.secondYear.present + presentAbsentByYear.secondYear.absent
  const secondYearPercentage =
    secondYearTotal > 0
      ? Math.round((presentAbsentByYear.secondYear.present / secondYearTotal) * 100)
      : 0

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100  bg-[url('/images/texture.jpg')] bg-cover bg-center">
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

      <main className="flex-1 space-y-6 p-2 md:p-6 sm:p-4 w-full">
        {/* Header */}
        <header className="flex flex-col gap-2 items-start sm:justify-between sm:flex-row sm:items-center w-full">
          <div>
            <h1 className="text-2xl font-bold text-white">{collegeName}</h1>
            <p className="text-white">
              Welcome,Principal <span className="font-semibold">{principal?.name}</span>
            </p>
            <p className="text-sm text-white">{principal?.email}</p>
          </div>
          <Button className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700">
            + Add Announcement
          </Button>
        </header>

        <Card className="mx-auto max-w-xs w-full rounded-2xl border border-blue-200 bg-blue-100 p-4 shadow-4lg">
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

        <ActiveLecturersCard className="w-full max-w-md mx-auto"
          lecturers={activeLecturersData?.data || []}
          loading={!activeLecturersData && !activeLecturersError}
          error={activeLecturersError}
          title="Currently Active Lecturers"
        />

        {/* 1. Overall Attendance Card */}
        <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <p className="font-bold text-blue-600">Attendance %</p>
                <p className="text-2xl">{percentage}%</p>
              </div>
              <div>
                <p className="font-bold text-green-700">Present Today</p>
                <p className="text-2xl">{presentCount}</p>
              </div>
              <div>
                <p className="font-bold text-red-600">Absent Today</p>
                <p className="text-2xl">{absentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. First Year Attendance Card */}
        <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">First Year Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-bold text-green-700">Present</p>
                <p className="text-2xl">{presentAbsentByYear.firstYear.present}</p>
              </div>
              <div>
                <p className="font-bold text-red-600">Absent</p>
                <p className="text-2xl">{presentAbsentByYear.firstYear.absent}</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">% Attendance</p>
                <p className="text-2xl">{firstYearPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Second Year Attendance Card */}
        <Card className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Second Year Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-bold text-green-700">Present</p>
                <p className="text-2xl">{presentAbsentByYear.secondYear.present}</p>
              </div>
              <div>
                <p className="font-bold text-red-600">Absent</p>
                <p className="text-2xl">{presentAbsentByYear.secondYear.absent}</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">% Attendance</p>
                <p className="text-2xl">{secondYearPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules - Attendance and Exams */}
        <section className="grid grid-cols-1 gap-4 w-full">
          {/* Attendance Module */}
          <Card className="rounded-2xl bg-white p-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Group wise Attendance Overview
              </CardTitle>
            </CardHeader>
            <div className="mt-4">
              {session?.user && (
                <GroupWiseAttendanceTable
                  collegeId={session.user.collegeId}
                  collegeName={session.user.collegeName}
                />
              )}
            </div>

            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Loading attendance data...</p>
              ) : error ? (
                <p className="text-red-600">Failed to load attendance data</p>
              ) : (
                <>
                  <div className="mt-4">
                    <h3 className="mb-2 font-semibold">Today's Absentees</h3>
                    {absentees.length === 0 ? (
                      <p className="text-green-600">🎉 No Absentees Today</p>
                    ) : (
                      <AbsenteesTable absentees={absentees} />
                    )}
                  </div>
                </>
              )}
            </CardContent>

            <AttendanceShortageSummary data={shortageData} />
          </Card>         

        </section>


        {/* Quick Links */}
        <section className="mx-auto grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-4xl w-full">
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
