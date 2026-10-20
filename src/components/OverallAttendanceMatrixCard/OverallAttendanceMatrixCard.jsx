
'use client'

import useSWR from 'swr'
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

const YEARS = ['First Year', 'Second Year']

async function fetcher(url) {
  const response = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || data?.error || 'Unable to load data')
  }

  return data
}

function countStudents(records, group, year) {
  return (records || []).filter(student => {
    return (
      normalizeAttendanceGroup(student.group) ===
        normalizeAttendanceGroup(group) &&
      student.yearOfStudy === year
    )
  }).length
}

function StatCard({ label, value, icon: Icon, color }) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ring-1 ${styles[color]}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  )
}

function useGroupYearAttendance({
  group,
  year,
  sessionWisePresent,
  sessionWiseAbsentees,
}) {
  const normalizedGroup = normalizeAttendanceGroup(group)

  const { data: studentsData, error, isLoading } = useSWR(
   `/api/students?group=${encodeURIComponent(normalizedGroup)}&yearOfStudy=${encodeURIComponent(year)}&status=Active&limit=1`,
    fetcher
  )

  const strength = Number(studentsData?.totalStudents || 0)

  const fnPresent = countStudents(
    sessionWisePresent.FN,
    normalizedGroup,
    year
  )

  const fnAbsent = countStudents(
    sessionWiseAbsentees.FN,
    normalizedGroup,
    year
  )

  const anPresent = countStudents(
    sessionWisePresent.AN,
    normalizedGroup,
    year
  )

  const anAbsent = countStudents(
    sessionWiseAbsentees.AN,
    normalizedGroup,
    year
  )

  const totalPresent = fnPresent + anPresent
  const totalAbsent = fnAbsent + anAbsent
  const totalMarked = totalPresent + totalAbsent

  const percentage =
    totalMarked > 0
      ? Math.round((totalPresent / totalMarked) * 100)
      : 0

  return {
    anAbsent,
    anPresent,
    error,
    fnAbsent,
    fnPresent,
    isLoading,
    percentage,
    strength,
    totalMarked,
  }
}

function GroupYearRow({
  group,
  year,
  showGroup,
  sessionWisePresent,
  sessionWiseAbsentees,
}) {
  const {
    anAbsent,
    anPresent,
    error,
    fnAbsent,
    fnPresent,
    isLoading,
    percentage,
    strength,
    totalMarked,
  } = useGroupYearAttendance({
    group,
    year,
    sessionWisePresent,
    sessionWiseAbsentees,
  })

  return (
    <tr className="transition hover:bg-indigo-50/40">
      <td className="whitespace-nowrap px-4 py-4">
        {showGroup ? (
          <span className="inline-flex rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-extrabold text-indigo-700 ring-1 ring-indigo-100">
            {group}
          </span>
        ) : (
          <span className="pl-3 text-slate-300">↳</span>
        )}
      </td>

      <td className="whitespace-nowrap px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            year === 'First Year'
              ? 'bg-sky-50 text-sky-700'
              : 'bg-violet-50 text-violet-700'
          }`}
        >
          {year}
        </span>
      </td>

      <td className="px-4 py-4 text-center font-bold text-slate-800">
        {isLoading ? '—' : error ? '!' : strength}
      </td>

      <td className="px-4 py-4 text-center font-bold text-emerald-700">
        {fnPresent}
      </td>

      <td className="px-4 py-4 text-center font-bold text-rose-600">
        {fnAbsent}
      </td>

      <td className="px-4 py-4 text-center font-bold text-emerald-700">
        {anPresent}
      </td>

      <td className="px-4 py-4 text-center font-bold text-rose-600">
        {anAbsent}
      </td>

      <td className="px-4 py-4 text-center">
        <span className="font-bold text-slate-800">{totalMarked}</span>
      </td>

      <td className="min-w-36 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <span className="w-10 text-right text-xs font-extrabold text-slate-700">
            {percentage}%
          </span>
        </div>
      </td>
    </tr>
  )
}

function GroupYearMobileCard({
  group,
  year,
  sessionWisePresent,
  sessionWiseAbsentees,
}) {
  const {
    anAbsent,
    anPresent,
    error,
    fnAbsent,
    fnPresent,
    isLoading,
    percentage,
    strength,
    totalMarked,
  } = useGroupYearAttendance({
    group,
    year,
    sessionWisePresent,
    sessionWiseAbsentees,
  })

  const value = isLoading ? '—' : error ? '!' : strength

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-extrabold text-slate-900">{group}</p>
          <span
            className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
              year === 'First Year'
                ? 'bg-sky-50 text-sky-700'
                : 'bg-violet-50 text-violet-700'
            }`}
          >
            {year}
          </span>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Strength
          </p>
          <p className="text-lg font-extrabold text-slate-900">{value}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 px-2 py-2">
          <p className="text-[10px] font-semibold text-emerald-700">FN Present</p>
          <p className="mt-1 font-extrabold text-emerald-700">{fnPresent}</p>
        </div>
        <div className="rounded-lg bg-rose-50 px-2 py-2">
          <p className="text-[10px] font-semibold text-rose-700">FN Absent</p>
          <p className="mt-1 font-extrabold text-rose-700">{fnAbsent}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-2 py-2">
          <p className="text-[10px] font-semibold text-emerald-700">AN Present</p>
          <p className="mt-1 font-extrabold text-emerald-700">{anPresent}</p>
        </div>
        <div className="rounded-lg bg-rose-50 px-2 py-2">
          <p className="text-[10px] font-semibold text-rose-700">AN Absent</p>
          <p className="mt-1 font-extrabold text-rose-700">{anAbsent}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-xs font-extrabold text-slate-700">
          {percentage}% · {totalMarked} marked
        </span>
      </div>
    </article>
  )
}

export default function OverallAttendanceMatrixCard() {
  const {
    data: mappingData,
    error: mappingError,
    isLoading: mappingLoading,
  } = useSWR('/api/lecturer/group-mapping', fetcher)

  const {
    data: attendanceData,
    error: attendanceError,
    isLoading: attendanceLoading,
    mutate,
  } = useSWR('/api/attendance/today-absentees', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const groups = [
    ...new Map(
      (mappingData?.groups || [])
        .map(group => ({
          original: String(group || '').trim(),
          normalized: normalizeAttendanceGroup(group),
        }))
        .filter(item => item.original && item.normalized)
        .map(item => [item.normalized, item.original])
    ).values(),
  ]

  const sessionWisePresent = attendanceData?.sessionWisePresent || {}
  const sessionWiseAbsentees = attendanceData?.sessionWiseAbsentees || {}

  const totalPresent =
    groups.reduce((sum, group) => {
      return (
        sum +
        countStudents(sessionWisePresent.FN, group, 'First Year') +
        countStudents(sessionWisePresent.FN, group, 'Second Year') +
        countStudents(sessionWisePresent.AN, group, 'First Year') +
        countStudents(sessionWisePresent.AN, group, 'Second Year')
      )
    }, 0)

  const totalAbsent =
    groups.reduce((sum, group) => {
      return (
        sum +
        countStudents(sessionWiseAbsentees.FN, group, 'First Year') +
        countStudents(sessionWiseAbsentees.FN, group, 'Second Year') +
        countStudents(sessionWiseAbsentees.AN, group, 'First Year') +
        countStudents(sessionWiseAbsentees.AN, group, 'Second Year')
      )
    }, 0)

  if (mappingLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-slate-600 shadow-sm">
        <RefreshCw className="animate-spin text-indigo-600" size={21} />
        <span className="text-sm font-semibold">
          Loading mapped group attendance...
        </span>
      </div>
    )
  }

  if (mappingError || attendanceError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-rose-600" size={22} />
          <div className="flex-1">
            <p className="font-bold text-rose-800">
              Unable to load attendance
            </p>
            <p className="mt-1 text-sm text-rose-700">
              Please check your connection and try again.
            </p>
            <button
              type="button"
              onClick={() => mutate()}
              className="mt-3 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <Users className="mx-auto text-slate-400" size={34} />
        <h3 className="mt-3 font-bold text-slate-800">
          No Groups Assigned
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Please contact your administrator to map your Groups.
        </p>
      </div>
    )
  }

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-3">
        <StatCard
          icon={Users}
          label="Mapped Groups"
          value={groups.length}
          color="indigo"
        />

        <StatCard
          icon={CheckCircle2}
          label="Present · FN + AN"
          value={totalPresent}
          color="green"
        />

        <StatCard
          icon={XCircle}
          label="Absent · FN + AN"
          value={totalAbsent}
          color="red"
        />
      </div>

      {/* Combined attendance table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-slate-900">
              Combined Group Attendance
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              All mapped Groups · First Year and Second Year · FN and AN
            </p>
          </div>

          <button
            type="button"
            onClick={() => mutate()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:w-auto"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="space-y-3 p-3 md:hidden">
          <p className="px-1 text-xs font-medium text-slate-500">
            Attendance by group and year
          </p>
          {groups.flatMap(group =>
            YEARS.map(year => (
              <GroupYearMobileCard
                key={`mobile-${group}-${year}`}
                group={group}
                year={year}
                sessionWisePresent={sessionWisePresent}
                sessionWiseAbsentees={sessionWiseAbsentees}
              />
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                >
                  Group
                </th>

                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                >
                  Year
                </th>

                <th
                  rowSpan={2}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                >
                  Strength
                </th>

                <th
                  colSpan={2}
                  className="border-l border-white/15 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                >
                  FN · Forenoon
                </th>

                <th
                  colSpan={2}
                  className="border-l border-white/15 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                >
                  AN · Afternoon
                </th>

                <th
                  rowSpan={2}
                  className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide"
                >
                  Marked
                </th>

                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide"
                >
                  Attendance %
                </th>
              </tr>

              <tr className="bg-slate-800 text-xs font-semibold">
                <th className="px-4 py-2 text-center text-emerald-300">
                  Present
                </th>
                <th className="px-4 py-2 text-center text-rose-300">
                  Absent
                </th>
                <th className="px-4 py-2 text-center text-emerald-300">
                  Present
                </th>
                <th className="px-4 py-2 text-center text-rose-300">
                  Absent
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {groups.map(group => (
                YEARS.map((year, index) => (
                  <GroupYearRow
                    key={`${group}-${year}`}
                    group={group}
                    year={year}
                    showGroup={index === 0}
                    sessionWisePresent={sessionWisePresent}
                    sessionWiseAbsentees={sessionWiseAbsentees}
                  />
                ))
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:gap-x-5 sm:px-5">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Present
          </span>
          <span className="inline-flex items-center gap-1.5">
            <XCircle size={14} className="text-rose-600" />
            Absent
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={14} className="text-indigo-600" />
            Marked = Present + Absent across FN and AN
          </span>
        </div>
      </div>
    </section>
  )
}
