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
  const fnTotalPresent =
    stats('First Year', 'FN').present + stats('Second Year', 'FN').present
  const anTotalPresent =
    stats('First Year', 'AN').present + stats('Second Year', 'AN').present

  return (
    <Card className="mb-6 max-w-xl mx-auto overflow-x-auto rounded-xl border-2 border-blue-300 bg-white shadow-xl">
      <CardHeader className="mb-2 bg-blue-600 py-4 text-center text-white rounded-t-xl">
        <CardTitle className="text-lg md:text-xl font-bold tracking-wide">
          {groupName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 overflow-x-auto">
        <table className="min-w-full text-center border border-blue-200 text-sm">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="p-2"></th>
              {years.map(year => (
                <th key={year} colSpan={sessions.length} className="p-2 font-bold">{year}</th>
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
                  <td key={year + session + "total"} className="font-bold">
                    {stats(year, session).total}
                  </td>
                ))
              )}
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-emerald-50 border-t-2 border-blue-300 font-bold text-green-700">
              <td className="text-right">FN Total Present</td>
              <td colSpan={sessions.length + 1}>{fnTotalPresent}</td>
            </tr>
            <tr className="bg-emerald-50 border-t-2 border-blue-300 font-bold text-green-700">
              <td className="text-right">AN Total Present</td>
              <td colSpan={sessions.length + 1}>{anTotalPresent}</td>
            </tr>
            {/* <tr className="bg-emerald-50 font-bold text-green-700">
              <td className="text-right">Year-wise Total Present</td>
              {yearTotals.map(({ present }) => (
                <td key={"present" + present} colSpan={sessions.length}>
                  {present}
                </td>
              ))}
            </tr>
            <tr className="font-bold text-blue-700 bg-blue-50">
              <td className="text-right" colSpan={sessions.length + 1}>Total Present (FN+AN):</td>
              <td colSpan={sessions.length + 1} className="text-xl text-green-700">{groupTotalPresent}</td>
            </tr> */}
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
    <div className="flex flex-wrap gap-8 justify-center">
      {groupNames.map(groupName =>
        <GroupTableCard
          key={groupName}
          groupName={groupName}
          sessionWisePresent={sessionWisePresent}
          sessionWiseAbsentees={sessionWiseAbsentees}
        />
      )}
    </div>
  )
}
