//app/principal/dashboard/page.jsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import ActiveLecturersCard from '@/components/dashboard/ActiveLecturersCard'
import AttendanceShortageSummary from '@/components/attendance-shortage-summary/AttendanceShortageSummary'
import OverallAttendanceMatrixCard from '@/components/OverallAttendanceMatrixCard/OverallAttendanceMatrixCard'
import TodayAbsenteesTable from '@/app/absentees-table/page'
import AttendanceStatsTable from '@/components/tables/AttendanceStatsTable'
import {
  Building2,
  FileSpreadsheet,
  GraduationCap,
  LayoutGrid,
  Percent,
  Upload,
  UserRoundCheck,
  Users,
} from 'lucide-react'
import OverallStrengthCard from '@/components/dashboard/OverallStrengthCard'

import MetricsCards from './MetricsCards'
import PromotionCard from './PromotionCard'
import OverviewStatCard from './OverviewStatCard'
import AttendanceOverviewTable from './AttendanceOverviewTable'

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

  const { data: dashboardOverview, error: dashboardOverviewError } = useSWR(
    '/api/principal/dashboard-overview',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )

  const { data: absenteesData } = useSWR('/api/attendance/today-absentees', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const summary = dashboardOverview?.summary
  const attendanceOverview = dashboardOverview?.attendanceOverview
  const overviewLoading = !dashboardOverview && !dashboardOverviewError
  const sessionWisePresent = absenteesData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absenteesData?.sessionWiseAbsentees || {}

  const todayDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  )

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

  const summaryCards = [
    {
      title: 'Total Students',
      value: summary?.totalStudents ?? 0,
      subtitle: 'Active students across the college',
      icon: GraduationCap,
      accentClassName: 'text-blue-950',
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Lecturers',
      value: summary?.totalLecturers ?? 0,
      subtitle: 'Teaching staff available in the institution',
      icon: Users,
      accentClassName: 'text-emerald-950',
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Total Groups',
      value: summary?.totalGroups ?? 0,
      subtitle: 'Academic groups currently active',
      icon: LayoutGrid,
      accentClassName: 'text-violet-950',
      iconClassName: 'bg-violet-100 text-violet-700',
    },
    {
      title: "Today's Attendance %",
      value: `${summary?.attendancePercentage ?? 0}%`,
      subtitle: `${summary?.totalPresentToday ?? 0} students marked present today`,
      icon: Percent,
      accentClassName: 'text-amber-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Total Absentees Today',
      value: summary?.totalAbsenteesToday ?? 0,
      subtitle: 'Students not marked present for today',
      icon: UserRoundCheck,
      accentClassName: 'text-rose-950',
      iconClassName: 'bg-rose-100 text-rose-700',
    },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(29,78,216,0.14),rgba(248,250,252,0.92)_40%,rgba(226,232,240,0.9)_100%)] px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
      <main className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-lg backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Principal Dashboard
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {collegeName}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{todayDateLabel}</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-700">Institution</p>
                  <p className="text-lg font-bold text-blue-950">Daily administrative overview</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                College Status Overview
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                College Status Overview
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                A quick snapshot of institutional strength and today&apos;s attendance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map(card => (
              <OverviewStatCard key={card.title} {...card} loading={overviewLoading} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
              Today&apos;s Attendance Overview
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
              Today&apos;s Attendance Overview
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Group-wise attendance split by academic year for the current day.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AttendanceOverviewTable
              title="First Year Attendance"
              rows={attendanceOverview?.firstYear || []}
              loading={overviewLoading}
            />
            <AttendanceOverviewTable
              title="Second Year Attendance"
              rows={attendanceOverview?.secondYear || []}
              loading={overviewLoading}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="rounded-3xl border-blue-100 bg-white/85 p-4 shadow-md sm:p-5">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
              {principal?.photo ? (
                <img
                  src={principal.photo}
                  alt="Principal"
                  className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-sm sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-slate-600 shadow-sm sm:h-24 sm:w-24">
                  No Photo
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="text-xl font-bold text-slate-900">{principal?.name || 'Principal'}</p>
                <p className="text-sm text-slate-600">{principal?.email || 'No email available'}</p>
                <p className="text-sm text-slate-500">{collegeName}</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl border-indigo-100 bg-linear-to-br from-indigo-50 via-white to-blue-50 shadow-md">
            <CardContent className="flex h-full items-center justify-between gap-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                  Total Strength
                </p>
                <p className="mt-1 text-3xl font-black text-indigo-950">
                  {overviewLoading ? '...' : summary?.totalStudents ?? 0}
                </p>
                <p className="text-xs text-slate-500">
                  {overviewLoading ? 'Loading attendance...' : `${summary?.totalPresentToday ?? 0} present today`}
                </p>
              </div>
              <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
                <GraduationCap className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-3xl border-emerald-100 bg-white/90 shadow-md">
            <CardContent className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <FileSpreadsheet className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Student Management
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
                    Bulk Upload Students
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-600">
                    Import student records in one step using the Excel bulk upload flow.
                  </p>
                </div>
              </div>

              <Link
                href="/students/bulk-upload"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <Upload className="h-4 w-4" />
                Open Bulk Upload
              </Link>
            </CardContent>
          </Card>
        </section>

        <MetricsCards />
        <PromotionCard />

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            <Card className="rounded-3xl border-slate-200 bg-white/85 p-3 shadow-md sm:p-4">
              <OverallStrengthCard
                sessionWisePresent={sessionWisePresent}
                sessionWiseAbsentees={sessionWiseAbsentees}
              />
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white/85 p-3 shadow-md sm:p-4">
              <OverallAttendanceMatrixCard />
            </Card>

            
          </div>

          <div className="space-y-4">
            <ActiveLecturersCard title="Currently Active Lecturers" />

            {/* <Card className="rounded-3xl border-slate-200 bg-white/85 p-3 shadow-md">
              <AttendanceShortageSummary data={shortageData} />
            </Card> */}
          </div>

        </section>

        

        <footer className="rounded-3xl border border-slate-200 bg-white/80 px-4 py-6 text-slate-600 shadow-sm">
          <div className="mb-3 flex justify-center gap-6 text-xl">
            <a href="#" className="transition hover:text-blue-600" aria-label="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.874h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a href="#" className="transition hover:text-sky-600" aria-label="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                />
              </svg>
            </a>
            <a href="#" className="transition hover:text-pink-600" aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm8.72 6.03a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0L6.47 11.53a.75.75 0 011.06-1.06l3.47 3.47 4.47-4.47z" />
              </svg>
            </a>
            <a href="#" className="transition hover:text-blue-700" aria-label="LinkedIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48v11.04C2 19.17 3.33 20.5 4.98 20.5h14.04c1.65 0 2.98-1.33 2.98-2.98V6.48c0-1.65-1.33-2.98-2.98-2.98H4.98zM8.75 17h-2v-7h2v7zm-1-8.27a1.27 1.27 0 110-2.54 1.27 1.27 0 010 2.54zM18 17h-2v-3.6c0-2.07-2.5-1.91-2.5 0V17h-2v-7h2v1.06c.87-1.61 4.5-1.73 4.5 1.55V17z" />
              </svg>
            </a>
          </div>
          <p className="text-center text-sm">&copy; {new Date().getFullYear()} OSRA System  -  All Rights Reserved</p>
        </footer>
      </main>
    </div>
  )
}
