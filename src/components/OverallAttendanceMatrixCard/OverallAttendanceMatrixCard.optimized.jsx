'use client'

import { useMemo, memo } from 'react'
import useSWR from 'swr'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

// Constants
const GROUP_NAMES = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const YEARS = ['First Year', 'Second Year']
const SESSIONS = ['FN', 'AN']

// Optimized fetcher with caching
const fetcher = (url) => 
  fetch(url, { credentials: 'include' }).then((res) => res.json())

// SWR config for minimal re-fetching
const SWR_CONFIG = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000, // 5 minutes
  keepPreviousData: true,
}

// Memoized GroupTableCard to prevent unnecessary re-renders
const GroupTableCard = memo(function GroupTableCard({ 
  groupName, 
  sessionWisePresent, 
  sessionWiseAbsentees 
}) {
  const normalizedGroupName = normalizeAttendanceGroup(groupName)
  
  // Only fetch total students once per group
  const { data: studentsData } = useSWR(
    `/api/students?group=${encodeURIComponent(normalizedGroupName)}&limit=1`,
    fetcher,
    SWR_CONFIG
  )
  
  const groupStrength = studentsData?.totalStudents || 0

  // Memoized stats calculation
  const stats = useMemo(() => {
    const calculateStats = (year, session) => {
      const present =
        sessionWisePresent[session]?.filter(
          (student) => 
            normalizeAttendanceGroup(student.group) === normalizedGroupName && 
            student.yearOfStudy === year
        ).length || 0

      const absent =
        sessionWiseAbsentees[session]?.filter(
          (student) => 
            normalizeAttendanceGroup(student.group) === normalizedGroupName && 
            student.yearOfStudy === year
        ).length || 0

      return { present, absent, total: present + absent }
    }
    
    return calculateStats
  }, [sessionWisePresent, sessionWiseAbsentees, normalizedGroupName])

  // Memoized totals calculation
  const totals = useMemo(() => {
    const fnFirst = stats('First Year', 'FN')
    const fnSecond = stats('Second Year', 'FN')
    const anFirst = stats('First Year', 'AN')
    const anSecond = stats('Second Year', 'AN')

    const fnTotalPresent = fnFirst.present + fnSecond.present
    const anTotalPresent = anFirst.present + anSecond.present

    const fnTotalAll = fnTotalPresent + fnFirst.absent + fnSecond.absent
    const anTotalAll = anTotalPresent + anFirst.absent + anSecond.absent

    const fnPercent = fnTotalAll > 0 ? Math.round((fnTotalPresent / fnTotalAll) * 100) : 0
    const anPercent = anTotalAll > 0 ? Math.round((anTotalPresent / anTotalAll) * 100) : 0

    return {
      fnTotalPresent,
      anTotalPresent,
      fnPercent,
      anPercent,
      firstYearAnAbsent: anFirst.absent,
      secondYearAnAbsent: anSecond.absent,
    }
  }, [stats])

  return (
    <Card className="mx-auto mb-6 max-w-xl overflow-hidden rounded-xl border border-blue-300 bg-white shadow-xl">
      <CardHeader className="mb-2 rounded-t-xl border border-blue-400 bg-blue-600 py-4 text-center text-white">
        <CardTitle className="inline-block rounded-lg bg-blue-500 p-2 text-lg font-bold tracking-wide md:text-xl">
          {groupName}
          <span className="text-lg font-bold">&nbsp;-&nbsp;{groupStrength}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="overflow-x-auto border border-blue-400 p-4">
        <table className="min-w-full border border-blue-400 text-center text-sm">
          <thead className="border border-blue-400 font-bold">
            <tr className="bg-blue-100 text-blue-900">
              <th className="border border-blue-400 p-2"></th>
              {YEARS.map(year => (
                <th key={year} colSpan={SESSIONS.length} className="border border-blue-400 p-2 font-bold">
                  {year}
                </th>
              ))}
            </tr>
            <tr className="border border-blue-400 bg-blue-200 text-blue-900">
              <th className="border border-blue-400 p-2"></th>
              {YEARS.map(year =>
                SESSIONS.map(session => (
                  <th key={`${year}-${session}`} className="border border-blue-400 px-2 font-semibold">
                    {session}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="border border-blue-200 font-bold text-green-700">
                <span className="inline-flex items-center gap-1">
                  <CheckCircleIcon className="h-5 w-5" />
                  Present
                </span>
              </td>
              {YEARS.map(year =>
                SESSIONS.map(session => (
                  <td
                    key={`${year}-${session}-present`}
                    className="border border-blue-200 font-bold text-green-700"
                  >
                    {stats(year, session).present}
                  </td>
                ))
              )}
            </tr>

            <tr>
              <td className="border border-blue-400 font-bold text-red-500">
                <span className="inline-flex items-center gap-1">
                  <XCircleIcon className="h-5 w-5" />
                  Absent
                </span>
              </td>
              {YEARS.map(year =>
                SESSIONS.map(session => (
                  <td key={`${year}-${session}-absent`} className="border border-blue-400 font-bold text-red-500">
                    {stats(year, session).absent}
                  </td>
                ))
              )}
            </tr>

            <tr className="bg-blue-50">
              <td className="border border-blue-400 font-bold text-blue-900">Total</td>
              {YEARS.map(year =>
                SESSIONS.map(session => (
                  <td key={`${year}-${session}-total`} className="border border-blue-400 font-bold">
                    {stats(year, session).total}
                  </td>
                ))
              )}
            </tr>
          </tbody>

          <tfoot>
            <tr className="border border-blue-400 bg-emerald-50 font-bold text-green-700">
              <td className="text-right">FN Strength</td>
              <td colSpan={3}>{totals.fnTotalPresent}</td>
              <td className="text-right"></td>
              <td colSpan={3}>{totals.fnPercent}%</td>
            </tr>
            <tr className="border border-blue-400 bg-emerald-50 font-bold text-green-700">
              <td className="text-right">AN Strength</td>
              <td colSpan={2}>{totals.anTotalPresent}</td>
              <td className="text-right"></td>
              <td colSpan={2}>{totals.anPercent}%</td>
            </tr>
            <tr className="bg-yellow-50 font-bold text-purple-700">
              <td colSpan={3} className="text-right">
                First Year AN Absent
              </td>
              <td colSpan={3} className="text-xl">
                {totals.firstYearAnAbsent}
              </td>
            </tr>
            <tr className="bg-yellow-50 font-bold text-purple-700">
              <td colSpan={3} className="text-right">
                Second Year AN Absent
              </td>
              <td colSpan={3} className="text-xl">
                {totals.secondYearAnAbsent}
              </td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  )
})

// Main component
export default function AllGroupsAttendanceCards() {
  const { data: absApiData } = useSWR(
    '/api/attendance/today-absentees', 
    fetcher,
    SWR_CONFIG
  )

  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {GROUP_NAMES.map(groupName => (
        <GroupTableCard
          key={groupName}
          groupName={groupName}
          sessionWisePresent={sessionWisePresent}
          sessionWiseAbsentees={sessionWiseAbsentees}
        />
      ))}
    </div>
  )
}
