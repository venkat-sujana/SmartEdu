//app/principal/dashboard/page.jsx
'use client'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useMemo, useState, useEffect } from 'react'
import ActiveLecturersCard from '@/components/dashboard/ActiveLecturersCard'
import AttendanceSmsHistoryCard from '@/components/attendance/AttendanceSmsHistoryCard'
import OverallAttendanceMatrixCard from '@/components/OverallAttendanceMatrixCard/OverallAttendanceMatrixCard'
import AnalyticsDashboard from '@/app/invigilation/components/AnalyticsDashboard'
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
import Tutorials from '@/components/tutorials/Tutorials'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

import MetricsCards from './MetricsCards'
import AttendanceSmsCard from './AttendanceSmsCard'
import PromotionCard from './PromotionCard'
import OverviewStatCard from './OverviewStatCard'
import AttendanceOverviewTable from './AttendanceOverviewTable'
import ConsecutiveAbsenteesCard from "@/components/attendance/cards/ConsecutiveAbsenteesCard";

const fetcher = url => fetch(url).then(res => res.json())

export default function PrincipalDashboard() {
  
  const { data: session } = useSession()
  const principal = session?.user

  const collegeName = principal?.collegeName || 'Your College'

  const [analyticsStats, setAnalyticsStats] = useState({
    totalSessions: 0,
    totalDuties: 0,
    totalLecturers: 0,
    roomsUsed: 0,

    availableCount: 0,
    unavailableCount: 0,
    availabilityPercent: 0,

    maxDuties: 0,
    minDuties: 0,
    loadDifference: 0,
    loadHealth: '',

    examSummary: [],
    topLecturers: [],
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch('/api/invigilation/reports/exam-analytics', {
          cache: 'no-store',
          credentials: 'include',
        })

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setAnalyticsError(
              'Analytics unavailable: you must be signed into the invigilation module.'
            )
            return
          }

          throw new Error(`Failed to load analytics: ${res.status}`)
        }

        const data = await res.json()
        setAnalyticsStats(data)
      } catch (err) {
        console.error(err)
        setAnalyticsError(err.message)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalytics()
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

  const { data: consecutiveData } = useSWR(
  principal?.collegeId
    ? `/api/attendance/consecutive-absentees?collegeId=${principal.collegeId}`
    : null,
  fetcher,
  {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  }
)

const consecutiveAbsentees =
  consecutiveData?.absentees || []

  const summary = dashboardOverview?.summary
  const attendanceOverview = dashboardOverview?.attendanceOverview
  const overviewLoading = !dashboardOverview && !dashboardOverviewError
  const sessionWisePresent = absenteesData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absenteesData?.sessionWiseAbsentees || {}
  const absenteesSummary = absenteesData?.summary
  const sessionSummaryCards = ['FN', 'AN'].map(sessionKey => {
    const present = sessionWisePresent[sessionKey]?.length || 0
    const absent = sessionWiseAbsentees[sessionKey]?.length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      session: sessionKey,
      present,
      absent,
      total,
      percent,
    }
  })
  const enrichAttendanceRows = (rows = [], year) =>
    rows.map(row => {
      const fn = stats(row.group, year, 'FN')
      const an = stats(row.group, year, 'AN')

      return {
        ...row,
        fnPresent: fn.present,
        fnAbsent: fn.absent,
        fnPercentage: fn.percent,
        anPresent: an.present,
        anAbsent: an.absent,
        anPercentage: an.percent,
      }
    })

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
    const normalizedGroup = normalizeAttendanceGroup(group)
    const present =
      sessionWisePresent[session]?.filter(
        s => normalizeAttendanceGroup(s.group) === normalizedGroup && s.yearOfStudy === year
      ).length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(
        s => normalizeAttendanceGroup(s.group) === normalizedGroup && s.yearOfStudy === year
      ).length || 0
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
      value: `${Number(absenteesSummary?.percentage ?? summary?.attendancePercentage ?? 0)}%`,
      subtitle: `${absenteesSummary?.grandPresent ?? summary?.totalPresentToday ?? 0} present out of ${absenteesSummary?.grandTotal ?? 0} marked records today`,
      icon: Percent,
      accentClassName: 'text-amber-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Total Absentees Today',
      value: absenteesSummary?.grandAbsent ?? summary?.totalAbsenteesToday ?? 0,
      subtitle: 'Actual absent records marked across FN and AN sessions',
      icon: UserRoundCheck,
      accentClassName: 'text-rose-950',
      iconClassName: 'bg-rose-100 text-rose-700',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 px-4 py-8 transition-all duration-500 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      <main className="max-w-8xl mx-auto w-full space-y-8">
        <section className="border-white-100/50 rounded-3xl border border-blue-100/50 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-block rounded-full bg-blue-100/50 px-3 py-1 text-sm font-bold tracking-wider text-blue-600 uppercase">
                Principal Dashboard
              </p>
              <h1 className="mt-3 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-4xl font-black tracking-tighter text-transparent lg:text-5xl">
                {collegeName}
              </h1>
              <p className="mt-2 text-base font-medium text-slate-500">{todayDateLabel}</p>
            </div>
            <div className="rounded-3xl border border-blue-200/50 bg-linear-to-r from-blue-50 to-indigo-50/50 px-6 py-4 shadow-lg ring-1 ring-blue-100/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="rounded-3xl bg-linear-to-br from-blue-400 to-indigo-500 p-4 text-white shadow-lg transition-all duration-300 hover:rotate-6">
                  <Building2 className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-bold tracking-widest text-blue-700 uppercase">
                    Institution
                  </p>
                  <p className="blue-text-transparent bg-linear-to-r from-blue-900 to-slate-800 bg-clip-text text-xl font-black text-transparent">
                    Daily Admin Overview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="inline-block rounded-full bg-emerald-100/50 px-3 py-1 text-sm font-bold tracking-wider text-emerald-600 uppercase">
                College Status Overview
              </p>
              <h2 className="mt-3 bg-linear-to-r from-slate-900 via-gray-900 to-slate-800 bg-clip-text text-4xl font-black tracking-tighter text-transparent lg:text-5xl">
                Real-time Metrics
              </h2>
              <p className="mt-2 max-w-md text-lg font-medium text-slate-500">
                Instant insights into student strength, lecturer availability, and today&apos;s
                attendance trends.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {summaryCards.map(card => (
              <OverviewStatCard key={card.title} {...card} loading={overviewLoading} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="inline-block rounded-full bg-amber-100/50 px-3 py-1 text-sm font-bold tracking-wider text-amber-600 uppercase">
              Today&apos;s Attendance Overview
            </p>
            <h2 className="mt-3 bg-linear-to-r from-slate-900 via-amber-900 to-slate-800 bg-clip-text text-4xl font-black tracking-tighter text-transparent lg:text-5xl">
              Session-wise Breakdown
            </h2>
            <p className="mt-2 max-w-2xl text-lg font-medium text-slate-500">
              Detailed group-wise attendance distribution across first and second year students.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sessionSummaryCards.map(card => (
              <div
                key={card.session}
                className="rounded-3xl border border-white/60 bg-white/90 px-5 py-5 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-block rounded-full bg-indigo-100/50 px-3 py-1 text-sm font-bold tracking-wider text-indigo-600 uppercase">
                      {card.session} Session
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-slate-900">
                      Session-wise Attendance
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Present, absent, total, and percentage for {card.session}.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-linear-to-br from-indigo-500 to-blue-600 px-4 py-3 text-white shadow-lg">
                    <p className="text-xs tracking-wide text-white/75 uppercase">Attendance</p>
                    <p className="mt-1 text-2xl font-black">{card.percent}%</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                      Present
                    </p>
                    <p className="mt-1 text-2xl font-black text-emerald-900">{card.present}</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-rose-700 uppercase">
                      Absent
                    </p>
                    <p className="mt-1 text-2xl font-black text-rose-900">{card.absent}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                      Total Marked
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{card.total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <AttendanceOverviewTable
              title="First Year Attendance"
              rows={enrichAttendanceRows(attendanceOverview?.firstYear || [], 'First Year')}
              loading={overviewLoading}
            />
            <AttendanceOverviewTable
              title="Second Year Attendance"
              rows={enrichAttendanceRows(attendanceOverview?.secondYear || [], 'Second Year')}
              loading={overviewLoading}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="group border-gradient-to-r hover:shadow-3xl rounded-3xl border-2 bg-white/90 from-blue-200/50 to-emerald-200/50 p-6 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
              {principal?.photo ? (
                <Image
                  src={principal.photo}
                  alt="Principal"
                  width={112}
                  height={112}
                  className="border-gradient-to-r h-24 w-24 rounded-full border-6 from-blue-400 via-white to-emerald-400 object-cover shadow-2xl ring-4 ring-white/50 transition-transform duration-300 group-hover:scale-110 sm:h-28 sm:w-28"
                />
              ) : (
                <div className="border-gradient-to-r to-slate-20000 flex h-24 w-24 items-center justify-center rounded-full border-6 bg-linear-to-br from-slate-100 via-slate-200 to-slate-300 text-lg font-bold text-slate-600 shadow-2xl sm:h-28 sm:w-28">
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

          <Card className="group hover:shadow-3xl rounded-3xl border border-indigo-200/50 bg-linear-to-br from-indigo-50 via-white/90 to-purple-50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:scale-[1.02]">
            <CardContent className="flex h-full items-center justify-between gap-6 p-8">
              <div>
                <p className="inline-block rounded-full bg-indigo-100/50 px-3 py-1 text-sm font-bold tracking-wider text-indigo-600 uppercase">
                  Total Enrollment
                </p>
                <p className="mt-2 animate-pulse bg-linear-to-r from-indigo-900 to-purple-900 bg-clip-text text-4xl font-black text-transparent lg:text-5xl">
                  {overviewLoading ? '...' : (summary?.totalStudents ?? 0)}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  {overviewLoading
                    ? 'Loading attendance...'
                    : `${summary?.totalPresentToday ?? 0} present today`}
                </p>
              </div>
              <div className="rounded-3xl bg-linear-to-br from-indigo-400 to-purple-500 p-4 text-white shadow-xl transition-all duration-300 group-hover:scale-110 hover:rotate-12">
                <GraduationCap className="h-10 w-10 drop-shadow-lg" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="group hover:shadow-3xl rounded-3xl border-emerald-200/50 bg-linear-to-br from-emerald-50/90 via-white to-teal-50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-1">
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-start gap-5">
                <div className="rounded-3xl bg-linear-to-br from-emerald-400 to-teal-500 p-4 text-white shadow-xl transition-all duration-300 hover:animate-bounce">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="inline-block rounded-full bg-emerald-100/50 px-3 py-1 text-sm font-bold tracking-wider text-emerald-700 uppercase">
                    Student Onboarding
                  </p>
                  <h2 className="mt-2 bg-linear-to-r from-slate-900 to-emerald-900 bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
                    Bulk Student Upload
                  </h2>
                  <p className="mt-3 max-w-lg text-base font-medium text-slate-600">
                    Seamlessly import entire batches via Excel. Instant enrollment for new academic
                    year.
                  </p>
                </div>
              </div>

              <Link
                href="/students/bulk-upload"
                className="group/btn inline-flex items-center justify-center gap-3 rounded-3xl bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-4 text-lg font-bold text-white shadow-xl ring-2 ring-emerald-200/50 transition-all duration-300 hover:scale-105 hover:rotate-1 hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl"
              >
                <Upload className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
                Open Bulk Upload
              </Link>
            </CardContent>
          </Card>

          <Tutorials />
        </section>

        <MetricsCards />
        <AttendanceSmsCard />
        <AttendanceSmsHistoryCard endpoint="/api/attendance/shortage-summary/sms-logs?limit=8" />
        <PromotionCard />

        <section className="grid grid-cols-1 gap-8 p-2 lg:grid-cols-2 xl:grid-cols-[2.5fr_1fr]">
          <div className="space-y-6">
            <Card className="group hover:shadow-3xl rounded-4xl border-blue-100/80 bg-linear-to-br from-white/95 via-white to-slate-50/80 p-8 shadow-2xl backdrop-blur-md transition-all duration-700 hover:-translate-y-3 hover:shadow-blue-500/10">
              <OverallStrengthCard
                sessionWisePresent={sessionWisePresent}
                sessionWiseAbsentees={sessionWiseAbsentees}
              />
            </Card>

            <Card className="group hover:shadow-3xl rounded-4xl border-emerald-100/30 bg-linear-to-br from-white/95 via-white to-slate-50/80 p-8 shadow-2xl backdrop-blur-md transition-all duration-700 hover:-translate-y-3 hover:shadow-emerald-500/10">
              <OverallAttendanceMatrixCard />
            </Card>
          </div>

          <div className="space-y-6 lg:pt-12">
            <ActiveLecturersCard title="Currently Active Lecturers" />

            <ConsecutiveAbsenteesCard
              data={consecutiveAbsentees}
              title="Students At Risk"
              loading={!consecutiveData}
              showViewAll={true}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl transition-all duration-500">
          <AnalyticsDashboard
            stats={analyticsStats}
            loading={analyticsLoading}
            error={analyticsError}
          />
        </section>

        <footer className="border-gradient-to-r mt-20 rounded-3xl border-t-4 bg-linear-to-br from-blue-400 via-purple-500 to-slate-50/50 px-8 py-10 text-slate-600 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex justify-center gap-8">
            <a
              href="#"
              className="group relative rounded-3xl bg-slate-100 p-3 text-slate-600 shadow-lg transition-all duration-500 hover:scale-110 hover:bg-linear-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white hover:shadow-2xl"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-8 w-8 drop-shadow-lg group-hover:rotate-360"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.874h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="#"
              className="group relative rounded-3xl bg-slate-100 p-3 text-slate-600 shadow-lg transition-all duration-500 hover:scale-110 hover:bg-linear-to-r hover:from-sky-500 hover:to-sky-600 hover:text-white hover:shadow-2xl"
              aria-label="Twitter"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8 drop-shadow-lg group-hover:rotate-360"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
                />
              </svg>
            </a>
            <a
              href="#"
              className="group relative rounded-3xl bg-slate-100 p-3 text-slate-600 shadow-lg transition-all duration-500 hover:scale-110 hover:bg-linear-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white hover:shadow-2xl"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-8 w-8 drop-shadow-lg group-hover:rotate-360"
              >
                <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm8.72 6.03a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0L6.47 11.53a.75.75 0 011.06-1.06l3.47 3.47 4.47-4.47z" />
              </svg>
            </a>
            <a
              href="#"
              className="group relative rounded-3xl bg-slate-100 p-3 text-slate-600 shadow-lg transition-all duration-500 hover:scale-110 hover:bg-linear-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:shadow-2xl"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="h-8 w-8 drop-shadow-lg group-hover:rotate-360"
              >
                <path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48v11.04C2 19.17 3.33 20.5 4.98 20.5h14.04c1.65 0 2.98-1.33 2.98-2.98V6.48c0-1.65-1.33-2.98-2.98-2.98H4.98zM8.75 17h-2v-7h2v7zm-1-8.27a1.27 1.27 0 110-2.54 1.27 1.27 0 010 2.54zM18 17h-2v-3.6c0-2.07-2.5-1.91-2.5 0V17h-2v-7h2v1.06c.87-1.61 4.5-1.73 4.5 1.55V17z" />
              </svg>
            </a>
          </div>
          <p className="mt-6 text-center text-lg font-semibold text-slate-500">
            &copy; {new Date().getFullYear()} OSRA System - All Rights Reserved | Premium Dashboard
          </p>
        </footer>
      </main>
    </div>
  )
}
