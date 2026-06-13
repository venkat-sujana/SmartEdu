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
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'

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

  const consecutiveAbsentees = consecutiveData?.absentees || []

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
      
      icon: GraduationCap,
      accentClassName: 'text-blue-950',
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Lecturers',
      value: summary?.totalLecturers ?? 0,
      
      icon: Users,
      accentClassName: 'text-emerald-950',
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Total Groups',
      value: summary?.totalGroups ?? 0,
      
      icon: LayoutGrid,
      accentClassName: 'text-violet-950',
      iconClassName: 'bg-violet-100 text-violet-700',
    },
    {
      title: "Today's Attendance %",
      value: `${Number(absenteesSummary?.percentage ?? summary?.attendancePercentage ?? 0)}%`,
      
      icon: Percent,
      accentClassName: 'text-amber-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Total Absentees Today',
      value: absenteesSummary?.grandAbsent ?? summary?.totalAbsenteesToday ?? 0,
      
      icon: UserRoundCheck,
      accentClassName: 'text-rose-950',
      iconClassName: 'bg-rose-100 text-rose-700',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 px-4 py-6 transition-all duration-500 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      <main className="max-w-8xl mx-auto w-full space-y-6">
        <section className="border-white-100/50 rounded-3xl border border-blue-100/50 bg-white/90 p-4 shadow-xl backdrop-blur-xl sm:p-5">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-block rounded-full bg-blue-100/50 px-3 py-1 text-sm font-bold tracking-wider text-blue-600 uppercase">
                Principal Dashboard
              </p>
              <h1 className="mt-1 bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-black tracking-tighter text-transparent lg:text-3xl">
                {collegeName}
              </h1>
              <p className="mt-1 text-base font-medium text-slate-500">{todayDateLabel}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summaryCards.map(card => (
              <OverviewStatCard key={card.title} {...card} loading={overviewLoading} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sessionSummaryCards.map(card => (
              <div
                key={card.session}
                className="rounded-3xl border border-white/60 bg-white/90 px-2 py-2 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="inline-block rounded-full bg-indigo-100/50 px-3 py-1 text-sm font-bold tracking-wider text-indigo-600 uppercase">
                      {card.session} Session
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-emerald-700 uppercase">
                      Present
                    </p>
                    <p className="text-md mt-1 font-bold text-emerald-900">{card.present}</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-rose-700 uppercase">
                      Absent
                    </p>
                    <p className="mt-1 text-xl font-bold text-rose-900">{card.absent}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-3">
                    <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                      Total
                    </p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{card.total}</p>
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

        {/* <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
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
        </section> */}

        {/* <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
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
        </section> */}

        {/* <MetricsCards />
        <AttendanceSmsCard />
        <AttendanceSmsHistoryCard endpoint="/api/attendance/shortage-summary/sms-logs?limit=8" />
        <PromotionCard /> */}

        <section className="space-y-6 p-2">
          <ConsecutiveAbsenteesCard
            data={consecutiveAbsentees}
            title="Students At Risk"
            loading={!consecutiveData}
            showViewAll={true}
          />

          <ActiveLecturersCard title="Currently Active Lecturers" />
        </section>

        {/* <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl transition-all duration-500">
          <AnalyticsDashboard
            stats={analyticsStats}
            loading={analyticsLoading}
            error={analyticsError}
          />
        </section> */}

        <footer className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">
    <div>
      <h3 className="bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-lg font-bold text-transparent">
        OSRA
      </h3>

      <p className="text-sm text-slate-500">
        Online Student Record & Attendance Management System
      </p>
    </div>

    <div className="text-center md:text-right">
      <p className="text-sm font-medium text-slate-700">
        Principal Dashboard
      </p>

      <p className="text-xs text-slate-500">
        © {new Date().getFullYear()} All Rights Reserved
      </p>
    </div>
  </div>
</footer>
      </main>
    </div>
  )
}
