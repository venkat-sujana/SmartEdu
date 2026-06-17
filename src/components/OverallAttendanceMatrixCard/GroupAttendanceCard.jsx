//src/components/OverallAttendanceMatrixCard/GroupAttendanceCard.jsx
'use client'
import React from 'react'
import useSWR from 'swr'
import { Activity, CheckCircle2, Clock3, Users, XCircle } from 'lucide-react'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

const years = ['First Year', 'Second Year']
const sessions = ['FN', 'AN']

const fetcher = url => fetch(url).then(res => res.json())

export default function GroupAttendanceCard({ groupName, compact = false }) {
  const normalizedGroupName = normalizeAttendanceGroup(groupName)
  const theme = getGroupTheme(normalizedGroupName)
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}

  const { data: studentsData } = useSWR(
    `/api/students?group=${encodeURIComponent(normalizedGroupName)}&limit=1`,
    fetcher
  )
  const { data: firstYearStudentsData } = useSWR(
    `/api/students?group=${encodeURIComponent(normalizedGroupName)}&yearOfStudy=${encodeURIComponent('First Year')}&limit=1`,
    fetcher
  )
  const { data: secondYearStudentsData } = useSWR(
    `/api/students?group=${encodeURIComponent(normalizedGroupName)}&yearOfStudy=${encodeURIComponent('Second Year')}&limit=1`,
    fetcher
  )
  const groupStrength = studentsData?.totalStudents || 0
  const firstYearStrength = firstYearStudentsData?.totalStudents || 0
  const secondYearStrength = secondYearStudentsData?.totalStudents || 0

  function stats(year, session) {
    const present =
      sessionWisePresent[session]?.filter(
        student =>
          normalizeAttendanceGroup(student.group) === normalizedGroupName &&
          student.yearOfStudy === year
      ).length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(
        student =>
          normalizeAttendanceGroup(student.group) === normalizedGroupName &&
          student.yearOfStudy === year
      ).length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, total, percent }
  }

  const sessionSummary = sessions.map(session => {
    const firstYear = stats('First Year', session)
    const secondYear = stats('Second Year', session)
    const present = firstYear.present + secondYear.present
    const absent = firstYear.absent + secondYear.absent
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return { session, present, absent, total, percent }
  })

  const overallPresent = sessionSummary.reduce((sum, item) => sum + item.present, 0)
  const overallAbsent = sessionSummary.reduce((sum, item) => sum + item.absent, 0)
  const overallTotal = overallPresent + overallAbsent
  const overallPercent = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className={`bg-linear-to-r ${theme.header} px-5 py-5 text-white`}>
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-6">
            <TopStat icon={<Users className="h-4 w-4" />} label="Strength" value={groupStrength} />
            <TopStat
              icon={<Activity className="h-4 w-4" />}
              label="First Year"
              value={firstYearStrength}
            />
            <TopStat
              icon={<Activity className="h-4 w-4" />}
              label="Second Year"
              value={secondYearStrength}
            />
            <TopStat
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Present"
              value={overallPresent}
            />
            <TopStat icon={<XCircle className="h-4 w-4" />} label="Absent" value={overallAbsent} />
            <TopStat
              icon={<Clock3 className="h-4 w-4" />}
              label="Percentage"
              value={`${overallPercent}%`}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-2">
        {years.map(year => (
          <article key={year} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h5 className="text-base font-bold text-slate-900">{year}</h5>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-3 py-2 text-left">Session</th>

                    <th className="border px-3 py-2 text-center">Present</th>

                    <th className="border px-3 py-2 text-center">Absent</th>

                    <th className="border px-3 py-2 text-center">Total</th>

                    <th className="border px-3 py-2 text-center">%</th>
                  </tr>
                </thead>

                <tbody>
                  {sessions.map(session => {
                    const current = stats(year, session)

                    return (
                      <tr key={`${year}-${session}`} className="hover:bg-slate-50">
                        <td className="border px-3 py-2 font-medium">{session}</td>

                        <td className="border px-3 py-2 text-center font-bold text-emerald-600">
                          {current.present}
                        </td>

                        <td className="border px-3 py-2 text-center font-bold text-rose-600">
                          {current.absent}
                        </td>

                        <td className="border px-3 py-2 text-center">{current.total}</td>

                        <td className="border px-3 py-2 text-center">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${theme.pill}`}
                          >
                            {current.percent}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function TopStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-[11px] tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  )
}

function MiniBox({ label, value, tone }) {
  const tones = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-100 text-slate-700',
  }

  return (
    <div className={`rounded-2xl border px-3 py-3 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}
