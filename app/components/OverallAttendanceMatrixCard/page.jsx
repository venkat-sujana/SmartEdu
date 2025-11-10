'use client'
import React from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const groupNames = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const years = ['First Year', 'Second Year']
const sessions = ['FN', 'AN']
const sessionLabels = { FN: 'FN', AN: 'AN' }

const fetcher = url => fetch(url).then(res => res.json())

function GroupTableCard({ groupName, sessionWisePresent, sessionWiseAbsentees }) {
  function stats(year, session) {
    const present =
      sessionWisePresent[session]?.filter(s => s.group === groupName && s.yearOfStudy === year)
        .length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(s => s.group === groupName && s.yearOfStudy === year)
        .length || 0
    const total = present + absent
    return { present, absent, total }
  }

  // Year-wise totals
  const yearTotals = years.map(year => {
    let totalPresent = 0
    sessions.forEach(session => {
      totalPresent += stats(year, session).present
    })
    return { present: totalPresent }
  })
  const groupTotalPresent = yearTotals[0].present + yearTotals[1].present

  // FN/AN total present (all years)
  const fnTotalPresent = stats('First Year', 'FN').present + stats('Second Year', 'FN').present
  const anTotalPresent = stats('First Year', 'AN').present + stats('Second Year', 'AN').present

  // FN total percent
  const fnTotalAll =
    fnTotalPresent + stats('First Year', 'FN').absent + stats('Second Year', 'FN').absent
  const fnPercent = fnTotalAll > 0 ? Math.round((fnTotalPresent / fnTotalAll) * 100) : 0

  // AN total percent
  const anTotalAll =
    anTotalPresent + stats('First Year', 'AN').absent + stats('Second Year', 'AN').absent
  const anPercent = anTotalAll > 0 ? Math.round((anTotalPresent / anTotalAll) * 100) : 0

  // Difference: FN Total Present - AN Total Present
  const fnMinusAn = fnTotalPresent - anTotalPresent

  return (
    <Card className="mx-auto mb-6 max-w-xl overflow-x-auto rounded-xl border-2 border-blue-300 bg-white shadow-xl">
      <CardHeader className="mb-2 rounded-t-xl bg-blue-600 py-4 text-center text-white">
        <CardTitle className="text-lg font-bold tracking-wide md:text-xl">{groupName}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4">
        <table className="min-w-full border border-blue-200 text-center text-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-2"></th>
              {years.map(year => (
                <th key={year} colSpan={sessions.length} className="p-2 font-bold">
                  {year}
                </th>
              ))}
            </tr>
            <tr className="bg-blue-200 text-blue-900">
              <th></th>
              {years.map(year =>
                sessions.map(session => (
                  <th key={year + session} className="px-2 font-semibold">
                    {sessionLabels[session]}
                  </th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {/* Present Row */}
            <tr>
              <td className="font-bold text-green-700">✔️ Present</td>
              {years.map(year =>
                sessions.map(session => (
                  <td key={year + session} className="font-bold text-green-700">
                    {stats(year, session).present}
                  </td>
                ))
              )}
            </tr>
            {/* Absent Row */}
            <tr>
              <td className="font-bold text-red-500">❌ Absent</td>
              {years.map(year =>
                sessions.map(session => (
                  <td key={year + session} className="font-bold text-red-500">
                    {stats(year, session).absent}
                  </td>
                ))
              )}
            </tr>
            {/* Session Total */}
            <tr className="bg-blue-50">
              <td className="font-bold text-blue-900">Total</td>
              {years.map(year =>
                sessions.map(session => (
                  <td key={year + session + 'total'} className="font-bold">
                    {stats(year, session).total}
                  </td>
                ))
              )}
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50 font-bold text-green-700">
              <td className="text-right">FN Total Present</td>
              <td colSpan={2}>{fnTotalPresent}</td>
              <td className="text-right"> </td>
              <td colSpan={2}>{fnPercent}%</td>
            </tr>
            <tr className="bg-emerald-50 font-bold text-green-700">
              <td className="text-right">AN Total Present</td>
              <td colSpan={2}>{anTotalPresent}</td>
              <td className="text-right"> </td>
              <td colSpan={2}>{anPercent}%</td>
            </tr>
            <tr className="bg-yellow-50 font-bold text-purple-700">
              <td colSpan={3} className="text-right">
                 FN Total Present-AN Total Present
              </td>
              <td colSpan={3} className="text-xl">
                {fnMinusAn}
              </td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  )
}

export default function AllGroupsAttendanceCards() {
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}

  return (
    <div className="flex flex-wrap justify-center gap-8">
      {groupNames.map(groupName => (
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
