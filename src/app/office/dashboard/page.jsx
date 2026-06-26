//src/app/office/dashboard/page.jsx
'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import OfficeDashboardHeader from '@/components/office/OfficeDashboardHeader'
import AttendanceHealthScoreCard from '@/components/attendance/cards/AttendanceHealthScoreCard'
import AttendanceTrendCard from '@/components/attendance/cards/AttendanceTrendCard'
import AttendanceAlertsCard from '@/components/attendance/cards/AttendanceAlertsCard'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
import AttendanceOverviewTable from '@/app/principal/dashboard/AttendanceOverviewTable'
import {
  ArrowRight,
  BellRing,
  BookOpenCheck,
  Building2,
  CircleAlert,
  ClipboardCheck,
  FileSpreadsheet,
  Percent,
  UserRoundX,
  Users,
} from 'lucide-react'
import { generateAttendanceAlerts } from '@/utils/generateAttendanceAlerts'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

const fetcher = url => fetch(url).then(res => res.json())

export default function OfficeDashboard() {
  const { data: session } = useSession()
  const officeUser = session?.user

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

  const { data: trendData } = useSWR('/api/attendance/trend?days=7', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const sessionWisePresent = absenteesData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absenteesData?.sessionWiseAbsentees || {}
  const absenteesSummary = absenteesData?.summary
  const summary = dashboardOverview?.summary
  const attendanceOverview = dashboardOverview?.attendanceOverview
  const overviewLoading = !dashboardOverview && !dashboardOverviewError

  const todayPresent = (sessionWisePresent.FN?.length || 0) + (sessionWisePresent.AN?.length || 0)

  const todayAbsent =
    (sessionWiseAbsentees.FN?.length || 0) + (sessionWiseAbsentees.AN?.length || 0)

  const todayTotal = todayPresent + todayAbsent

  const todayAttendancePercentage =
    todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0

  const { data: consecutiveData } = useSWR(
    officeUser?.collegeId
      ? `/api/attendance/consecutive-absentees?collegeId=${officeUser.collegeId}`
      : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )

  const consecutiveAbsentees = consecutiveData?.absentees || []
  const atRiskStudents = consecutiveAbsentees.length

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const summaryCards = [
    {
      title: 'Total Students',
      value: summary?.totalStudents ?? 0,
      subtitle: 'Institution-wide student strength',
      icon: Users,
      iconClassName: 'bg-cyan-100 text-cyan-700',
      valueClassName: 'text-slate-950',
    },
    {
      title: 'Attendance Today',
      value: `${todayAttendancePercentage}%`,
      subtitle: `${todayPresent} present out of ${todayTotal || 0}`,
      icon: Percent,
      iconClassName: 'bg-emerald-100 text-emerald-700',
      valueClassName: 'text-emerald-950',
    },
    {
      title: 'Students Absent',
      value: absenteesSummary?.grandAbsent ?? todayAbsent,
      subtitle: 'Requires follow-up where needed',
      icon: UserRoundX,
      iconClassName: 'bg-rose-100 text-rose-700',
      valueClassName: 'text-rose-950',
    },
    {
      title: 'Academic Groups',
      value: summary?.totalGroups ?? 0,
      subtitle: 'Current groups tracked today',
      icon: BookOpenCheck,
      iconClassName: 'bg-amber-100 text-amber-700',
      valueClassName: 'text-amber-950',
    },
  ]

  const sessionCards = ['FN', 'AN'].map(sessionKey => {
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

  function stats(group, year, sessionKey) {
    const normalizedGroup = normalizeAttendanceGroup(group)
    const present =
      sessionWisePresent[sessionKey]?.filter(
        student =>
          normalizeAttendanceGroup(student.group) === normalizedGroup
          && student.yearOfStudy === year
      ).length || 0
    const absent =
      sessionWiseAbsentees[sessionKey]?.filter(
        student =>
          normalizeAttendanceGroup(student.group) === normalizedGroup
          && student.yearOfStudy === year
      ).length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, total, percent }
  }

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

  const attendanceAlerts = generateAttendanceAlerts({
    attendancePercentage: todayAttendancePercentage,
    totalAbsent: todayAbsent,
    atRiskStudents,
    allLecturersSubmitted: true,
  })

  const quickActions = [
    {
      title: 'Student Records',
      description: 'Review and manage student profiles.',
      href: '/students',
      icon: ClipboardCheck,
      iconClassName: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'Bulk Upload',
      description: 'Import new student data through Excel.',
      href: '/students/bulk-upload',
      icon: FileSpreadsheet,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Attendance Register',
      description: 'Open the daily attendance workspace.',
      href: '/attendance',
      icon: BellRing,
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Attendance Records',
      description: 'Inspect daily and historical attendance data.',
      href: '/attendance-records',
      icon: Building2,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-white to-cyan-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <OfficeDashboardHeader
          todayLabel={todayLabel}
          attendancePercentage={todayAttendancePercentage}
          todayPresent={todayPresent}
          todayAbsent={todayAbsent}
          totalStudents={summary?.totalStudents ?? 0}
          totalLecturers={summary?.totalLecturers ?? 0}
          totalGroups={summary?.totalGroups ?? 0}
          loading={overviewLoading}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(card => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                      {card.title}
                    </p>
                    <p className={`mt-3 text-3xl font-black tracking-tight ${card.valueClassName}`}>
                      {overviewLoading ? '...' : card.value}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{card.subtitle}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.iconClassName}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-700 uppercase">
                Year Wise Attendance
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                First year and second year session-wise tables
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Group-level FN and AN attendance split for both academic years.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-700 uppercase">
                  Session Overview
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Today&apos;s attendance progress
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                FN and AN session performance at a glance
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {sessionCards.map(card => (
                <div
                  key={card.session}
                  className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                        {card.session} Session
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950">{card.percent}%</p>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                        Total
                      </p>
                      <p className="mt-1 text-xl font-bold text-slate-900">{card.total}</p>
                    </div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-500"
                      style={{ width: `${card.percent}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                        Present
                      </p>
                      <p className="mt-1 text-2xl font-bold text-emerald-900">{card.present}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 px-4 py-3">
                      <p className="text-xs font-semibold tracking-[0.18em] text-rose-700 uppercase">
                        Absent
                      </p>
                      <p className="mt-1 text-2xl font-bold text-rose-900">{card.absent}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-700 uppercase">
                  Office Focus
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                  Priority actions
                </h2>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
                <CircleAlert className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-semibold text-amber-900">
                  Students at risk: {atRiskStudents}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Prioritize attendance follow-up for repeated absentees.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                <p className="text-sm font-semibold text-cyan-900">
                  Present today: {todayPresent}
                </p>
                <p className="mt-1 text-sm text-cyan-800">
                  Attendance marking is reflected live on this dashboard.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">
                  College: {officeUser?.collegeName || 'Your College'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Logged in as {officeUser?.designation || 'Office Staff'}.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {quickActions.map(action => {
                const Icon = action.icon

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-2xl p-3 ${action.iconClassName}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{action.title}</p>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-700" />
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <AttendanceHealthScoreCard
            attendancePercentage={todayAttendancePercentage}
            totalStudents={todayTotal}
            presentStudents={todayPresent}
            absentStudents={todayAbsent}
          />
          <AttendanceTrendCard title="Weekly Attendance Trend" trendData={trendData || []} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <AttendanceAlertsCard alerts={attendanceAlerts} />
          <ConsecutiveAbsenteesCard
            data={consecutiveAbsentees}
            title="Today's Students At Risk"
            loading={!consecutiveData}
            showViewAll={true}
          />
        </section>
      </div>
    </div>
  )
}
