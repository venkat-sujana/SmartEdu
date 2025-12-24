
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
    <Card className="mx-auto mb-8 max-w-3xl overflow-x-auto rounded-3xl border border-blue-200 bg-linear-to-br from-sky-50 via-white to-indigo-50 shadow-xl">
      {/* Header with icons and strength */}
      <CardHeader className="mb-1 rounded-t-3xl border-b border-blue-200 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500 py-4 text-white">
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
        {/* Years wrapper: mobile 1-col, md+ 2-cols */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* First Year card */}
    <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white shadow-sm">
      <table className="min-w-full text-center text-sm">
        <thead>
          <tr className="bg-blue-50 text-blue-900">
            <th className="p-2" colSpan={sessions.length}>
              First Year
            </th>
          </tr>
          <tr className="bg-blue-100 text-blue-900">
            <th className="py-2 text-xs font-semibold uppercase tracking-wide">
              Status
            </th>
            {sessions.map(session => (
              <th
                key={session}
                className="border-l border-blue-200 px-2 py-2 text-xs font-semibold uppercase tracking-wide"
              >
                {sessionLabels[session]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Present */}
          <tr className="bg-emerald-50/60">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-emerald-700">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                Present
              </div>
            </td>
            {sessions.map(session => (
              <td
                key={'FY' + session}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-emerald-700"
              >
                {stats('First Year', session).present}
              </td>
            ))}
          </tr>

          {/* Absent */}
          <tr className="bg-rose-50/70">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-rose-700">
              <div className="flex items-center gap-1">
                <XCircleIcon className="h-4 w-4 text-rose-600" />
                Absent
              </div>
            </td>
            {sessions.map(session => (
              <td
                key={'FY' + session + 'A'}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-rose-600"
              >
                {stats('First Year', session).absent}
              </td>
            ))}
          </tr>

          {/* Total */}
          <tr className="bg-slate-50">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-slate-800">
              Total
            </td>
            {sessions.map(session => (
              <td
                key={'FY' + session + 'T'}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-slate-900"
              >
                {stats('First Year', session).total}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>

    {/* Second Year card (same structure, year = 'Second Year') */}
    <div className="overflow-x-auto rounded-2xl border border-blue-200 bg-white shadow-sm">
      <table className="min-w-full text-center text-sm">
        <thead>
          <tr className="bg-blue-50 text-blue-900">
            <th className="p-2" colSpan={sessions.length}>
              Second Year
            </th>
          </tr>
          <tr className="bg-blue-100 text-blue-900">
            <th className="py-2 text-xs font-semibold uppercase tracking-wide">
              Status
            </th>
            {sessions.map(session => (
              <th
                key={session}
                className="border-l border-blue-200 px-2 py-2 text-xs font-semibold uppercase tracking-wide"
              >
                {sessionLabels[session]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Present */}
          <tr className="bg-emerald-50/60">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-emerald-700">
              <div className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                Present
              </div>
            </td>
            {sessions.map(session => (
              <td
                key={'SY' + session}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-emerald-700"
              >
                {stats('Second Year', session).present}
              </td>
            ))}
          </tr>

          {/* Absent */}
          <tr className="bg-rose-50/70">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-rose-700">
              <div className="flex items-center gap-1">
                <XCircleIcon className="h-4 w-4 text-rose-600" />
                Absent
              </div>
            </td>
            {sessions.map(session => (
              <td
                key={'SY' + session + 'A'}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-rose-600"
              >
                {stats('Second Year', session).absent}
              </td>
            ))}
          </tr>

          {/* Total */}
          <tr className="bg-slate-50">
            <td className="border-t border-blue-100 px-2 py-2 text-left text-xs font-bold uppercase text-slate-800">
              Total
            </td>
            {sessions.map(session => (
              <td
                key={'SY' + session + 'T'}
                className="border-t border-l border-blue-100 px-2 py-2 text-sm font-bold text-slate-900"
              >
                {stats('Second Year', session).total}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  </div>
      </CardContent>
    </Card>
  )
}
