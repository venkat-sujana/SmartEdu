
//app/components/OverallAttendanceMatrixCard/GroupAttendanceCard.jsx
'use client'

import React from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid'

// Year & Session constants
const years = ['First Year', 'Second Year']
const sessions = ['FN', 'AN', 'EN']
const sessionLabels = { FN: 'FN', AN: 'AN', EN: 'EN' }

// Simple fetcher for SWR
const fetcher = url => fetch(url).then(res => res.json())

export default function GroupAttendanceCard({ groupName }) {
  // Attendance API data
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}

  // Students API data
  const { data: studentsData } = useSWR('/api/students', fetcher)
  // Normalize students array
  const studentsArray = Array.isArray(studentsData)
    ? studentsData
    : Array.isArray(studentsData?.students)
    ? studentsData.students
    : Array.isArray(studentsData?.data)
    ? studentsData.data
    : []

  // Total group strength count
  const groupStrength = studentsArray.filter(s => s.group === groupName).length

  // Stat Calculation per year & session
  function stats(year, session) {
    const present =
      sessionWisePresent[session]?.filter(
        s => s.group === groupName && s.yearOfStudy === year
      ).length || 0

    const absent =
      sessionWiseAbsentees[session]?.filter(
        s => s.group === groupName && s.yearOfStudy === year
      ).length || 0

    const total = present + absent
    return { present, absent, total }
  }

  // Total present students per year
  const yearTotals = years.map(year => {
    let totalPresent = 0
    sessions.forEach(session => {
      totalPresent += stats(year, session).present
    })
    return { present: totalPresent }
  })

  // Session-wise totals (FN/AN/EN for both years)
  const fnTotalPresent = stats('First Year', 'FN').present + stats('Second Year', 'FN').present
  const anTotalPresent = stats('First Year', 'AN').present + stats('Second Year', 'AN').present
  const enTotalPresent = stats('First Year', 'EN').present + stats('Second Year', 'EN').present

  const fnTotalAll =
    fnTotalPresent +
    stats('First Year', 'FN').absent +
    stats('Second Year', 'FN').absent
  const fnPercent = fnTotalAll > 0 ? Math.round((fnTotalPresent / fnTotalAll) * 100) : 0

  const anTotalAll =
    anTotalPresent +
    stats('First Year', 'AN').absent +
    stats('Second Year', 'AN').absent
  const anPercent = anTotalAll > 0 ? Math.round((anTotalPresent / anTotalAll) * 100) : 0

  const enTotalAll =
    enTotalPresent +
    stats('First Year', 'EN').absent +
    stats('Second Year', 'EN').absent
  const enPercent = enTotalAll > 0 ? Math.round((enTotalPresent / enTotalAll) * 100) : 0

  // --- JSX ---
  return (
    <Card className="mx-auto mb-8 max-w-3xl overflow-x-auto rounded-3xl border border-blue-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-xl">
      {/* Header with icons and strength */}
      <CardHeader className="mb-1 rounded-t-3xl border-b border-blue-200 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 py-4 text-white">
        <div className="flex items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 shadow">
              <UsersIcon className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-lg font-extrabold tracking-wide md:text-xl">
              {groupName}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircleIcon className="h-4 w-4" />
            </span>
            <span>Total Strength:</span>
            <span className="text-yellow-300 text-sm font-extrabold">{groupStrength}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 md:p-5">
        {/* Small session summary badges */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 border border-emerald-100 shadow-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-emerald-500" />
              <span>FN Present</span>
            </div>
            <span>{fnTotalPresent} ({fnPercent}%)</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-800 border border-sky-100 shadow-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-sky-500" />
              <span>AN Present</span>
            </div>
            <span>{anTotalPresent} ({anPercent}%)</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-indigo-500" />
              <span>EN Present</span>
            </div>
            <span>{enTotalPresent} ({enPercent}%)</span>
          </div>
        </div>

        {/* Main table */}
        <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white shadow-sm">
          <table className="min-w-full text-center text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-2"></th>
                {years.map(year => (
                  <th
                    key={year}
                    colSpan={sessions.length}
                    className="border-l border-blue-200 p-2 text-sm font-extrabold tracking-wide"
                  >
                    {year}
                  </th>
                ))}
              </tr>
              <tr className="bg-blue-100 text-blue-900">
                <th className="py-2 text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                {years.map(year =>
                  sessions.map(session => (
                    <th
                      key={year + session}
                      className="border-l border-blue-200 px-2 py-2 text-xs font-semibold uppercase tracking-wide"
                    >
                      {sessionLabels[session]}
                    </th>
                  ))
                )}
              </tr>
            </thead>

            <tbody>
              {/* Present Row */}
              <tr className="bg-emerald-50/60">
                <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-emerald-700">
                  <div className="flex items-center gap-1">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                    Present
                  </div>
                </td>
                {years.map(year =>
                  sessions.map(session => (
                    <td
                      key={year + session}
                      className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-emerald-700"
                    >
                      {stats(year, session).present}
                    </td>
                  ))
                )}
              </tr>

              {/* Absent Row */}
              <tr className="bg-rose-50/70">
                <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-rose-700">
                  <div className="flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4 text-rose-600" />
                    Absent
                  </div>
                </td>
                {years.map(year =>
                  sessions.map(session => (
                    <td
                      key={year + session}
                      className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-rose-600"
                    >
                      {stats(year, session).absent}
                    </td>
                  ))
                )}
              </tr>

              {/* Session Total */}
              <tr className="bg-slate-50">
                <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-slate-800">
                  Total
                </td>
                {years.map(year =>
                  sessions.map(session => (
                    <td
                      key={year + session + 'total'}
                      className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-slate-900"
                    >
                      {stats(year, session).total}
                    </td>
                  ))
                )}
              </tr>
            </tbody>

            <tfoot>
              <tr className="bg-amber-50 font-bold text-purple-700">
                <td colSpan={3} className="border-t border-blue-100 px-3 py-2 text-right">
                  First Year AN Absent
                </td>
                <td colSpan={3} className="border-t border-blue-100 px-3 py-2 text-xl">
                  {stats('First Year', 'AN').absent}
                </td>
              </tr>
              <tr className="bg-amber-50 font-bold text-purple-700">
                <td colSpan={3} className="border-t border-blue-100 px-3 py-2 text-right">
                  Second Year AN Absent
                </td>
                <td colSpan={3} className="border-t border-blue-100 px-3 py-2 text-xl">
                  {stats('Second Year', 'AN').absent}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
