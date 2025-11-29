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
import MainLinks from '@/app/components/MainLinks';
import MetricsCards from "./MetricsCards";
import PromotionCard from "./PromotionCard";
import ExternalLinks from "@/app/components/ExternalLinks";


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

        <div className="flex items-center justify-content">
          <h1 className="text-2xl font-bold">Principal Dashboard</h1>
        </div>

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

        <MetricsCards />

        <PromotionCard />



        <MainLinks />

        <ExternalLinks />
        

        

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


{/* Footer */}
<footer className="w-full flex flex-col items-center gap-3 pt-10 pb-6 text-gray-600">
<div className="flex gap-6 text-xl">
{/* Heroicons (Tailwind official) */}
<a href="#" className="hover:text-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.874h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg></a>
<a href="#" className="hover:text-blue-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg></a>
<a href="#" className="hover:text-pink-600 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm8.72 6.03a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0L6.47 11.53a.75.75 0 011.06-1.06l3.47 3.47 4.47-4.47z"/></svg></a>
<a href="#" className="hover:text-blue-700 transition"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48v11.04C2 19.17 3.33 20.5 4.98 20.5h14.04c1.65 0 2.98-1.33 2.98-2.98V6.48c0-1.65-1.33-2.98-2.98-2.98H4.98zM8.75 17h-2v-7h2v7zm-1-8.27a1.27 1.27 0 110-2.54 1.27 1.27 0 010 2.54zM18 17h-2v-3.6c0-2.07-2.5-1.91-2.5 0V17h-2v-7h2v1.06c.87-1.61 4.5-1.73 4.5 1.55V17z"/></svg></a>
</div>
<p className="text-sm">© {new Date().getFullYear()} OSRA System • All Rights Reserved</p>
</footer>

</main>
</div>
  )
}
