'use client'

import React from 'react'
import useSWR from 'swr'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const groupNames = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const years = ['First Year', 'Second Year']
const sessions = ['FN', 'AN']

const fetcher = url => fetch(url).then(res => res.json())

function GroupTableCard({ groupName, sessionWisePresent, sessionWiseAbsentees }) {
  const { data: studentsData } = useSWR('/api/students', fetcher)

  const studentsArray = Array.isArray(studentsData)
    ? studentsData
    : Array.isArray(studentsData?.students)
      ? studentsData.students
      : Array.isArray(studentsData?.data)
        ? studentsData.data
        : []

  const groupStrength = studentsArray.filter(student => student.group === groupName).length

  function stats(year, session) {
    const present =
      sessionWisePresent[session]?.filter(
        student => student.group === groupName && student.yearOfStudy === year
      ).length || 0

    const absent =
      sessionWiseAbsentees[session]?.filter(
        student => student.group === groupName && student.yearOfStudy === year
      ).length || 0

    return { present, absent, total: present + absent }
  }

  const fnTotalPresent = stats('First Year', 'FN').present + stats('Second Year', 'FN').present
  const anTotalPresent = stats('First Year', 'AN').present + stats('Second Year', 'AN').present

  const fnTotalAll = fnTotalPresent + stats('First Year', 'FN').absent + stats('Second Year', 'FN').absent
  const anTotalAll = anTotalPresent + stats('First Year', 'AN').absent + stats('Second Year', 'AN').absent

  const fnPercent = fnTotalAll > 0 ? Math.round((fnTotalPresent / fnTotalAll) * 100) : 0
  const anPercent = anTotalAll > 0 ? Math.round((anTotalPresent / anTotalAll) * 100) : 0

  return (
    <Card className="mx-auto mb-6 max-w-xl overflow-x-auto rounded-xl border border-blue-300 bg-white shadow-xl">
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
              {years.map(year => (
                <th key={year} colSpan={sessions.length} className="border border-blue-400 p-2 font-bold">
                  {year}
                </th>
              ))}
            </tr>
            <tr className="border border-blue-400 bg-blue-200 text-blue-900">
              <th className="border border-blue-400 p-2"></th>
              {years.map(year =>
                sessions.map(session => (
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
              {years.map(year =>
                sessions.map(session => (
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
              {years.map(year =>
                sessions.map(session => (
                  <td key={`${year}-${session}-absent`} className="border border-blue-400 font-bold text-red-500">
                    {stats(year, session).absent}
                  </td>
                ))
              )}
            </tr>

            <tr className="bg-blue-50">
              <td className="border border-blue-400 font-bold text-blue-900">Total</td>
              {years.map(year =>
                sessions.map(session => (
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
              <td colSpan={3}>{fnTotalPresent}</td>
              <td className="text-right"></td>
              <td colSpan={3}>{fnPercent}%</td>
            </tr>
            <tr className="border border-blue-400 bg-emerald-50 font-bold text-green-700">
              <td className="text-right">AN Strength</td>
              <td colSpan={2}>{anTotalPresent}</td>
              <td className="text-right"></td>
              <td colSpan={2}>{anPercent}%</td>
            </tr>
            <tr className="bg-yellow-50 font-bold text-purple-700">
              <td colSpan={3} className="text-right">
                First Year AN Absent
              </td>
              <td colSpan={3} className="text-xl">
                {stats('First Year', 'AN').absent}
              </td>
            </tr>
            <tr className="bg-yellow-50 font-bold text-purple-700">
              <td colSpan={3} className="text-right">
                Second Year AN Absent
              </td>
              <td colSpan={3} className="text-xl">
                {stats('Second Year', 'AN').absent}
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
