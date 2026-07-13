//src/components/OverallAttendanceMatrixCard/GroupAttendanceCard.jsx
'use client'
import React from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Activity, CheckCircle2, Clock3, Users, XCircle } from 'lucide-react'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

const years = ['First Year', 'Second Year']
const sessions = ['FN', 'AN']

const fetcher = url => fetch(url).then(res => res.json())

export default function GroupAttendanceCard({ groupName, compact = false }) {
  const { data: session } = useSession()
  const normalizedGroupName = normalizeAttendanceGroup(groupName)
  const theme = getGroupTheme(normalizedGroupName)
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}
  const today = new Date().toISOString().slice(0, 10)
  const { data: groupWiseData } = useSWR(
    session?.user?.collegeId
      ? `/api/attendance/group-wise-today?collegeId=${session.user.collegeId}&date=${today}`
      : null,
    fetcher
  )

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
    const yearStrength = year === 'First Year' ? firstYearStrength : secondYearStrength

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

    const total = yearStrength
    const unmarked = yearStrength - present - absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    const sessionData = groupWiseData?.groupWise?.[normalizedGroupName]?.[year]?.find(
      item => item.session === session
    )

    // 👇 NEW
    const lecturerName = sessionData?.lecturerName || '—'

    const markedAt = sessionData?.markedAt || null

    const status = unmarked === 0 ? "Completed" : "Pending";

    return {
      present,
      absent,
      unmarked,
      total,
      percent,
      lecturerName,
      markedAt,
      status,
    }
  }



  function formatTime(date) {
  if (!date) return "—";

  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
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
          <article key={year} className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
            <h5 className="text-base font-bold text-slate-900">{year}</h5>

            <div className="mt-2 hidden overflow-x-auto md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-3 py-2 text-left">Session</th>

                    <th className="border px-3 py-2 text-center">Present</th>

                    <th className="border px-3 py-2 text-center">Absent</th>

                    <th className="border px-3 py-2 text-center">Unmarked</th>

                    <th className="border px-3 py-2 text-center">Total</th>

                    <th className="border px-3 py-2 text-center">👤Marked By</th>

                    <th className="border px-3 py-2 text-center">🕒Marked At</th>

                    <th className="border px-3 py-2 text-center">Status</th>

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

                        <td className="border px-3 py-2 text-center font-bold text-amber-500">
                          {' '}
                          {/* ✅ new */}
                          {current.unmarked}
                        </td>

                        <td className="border px-3 py-2 text-center">{current.total}</td>

                        <td className="border px-3 py-2 text-center">{current.lecturerName}</td>

                        <td className="border px-3 py-2 text-center">
                          {formatTime(current.markedAt)}
                        </td>

                        <td className="border px-3 py-2 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                              current.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {current.status === 'Completed' ? '🟢' : '⏳'}
                            {current.status}
                          </span>
                        </td>

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

            {/* Mobile version */}
            <div className="mt-3 space-y-3 md:hidden">
              {sessions.map(session => {
                const current = stats(year, session)

                return (
                  <div
                    key={`${year}-${session}`}
                    className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{session}</span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${theme.pill}`}
                      >
                        {current.percent}%
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{
                            width: `${current.percent}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[11px] text-slate-500">Present</p>
                        <p className="text-lg font-bold text-emerald-600">{current.present}</p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">Absent</p>
                        <p className="text-lg font-bold text-rose-600">{current.absent}</p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">Unmarked</p>
                        <p className="text-lg font-bold text-amber-500">{current.unmarked}</p>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500">Total</p>
                        <p className="text-lg font-bold text-slate-700">{current.total}</p>
                      </div>

                      <div className="col-span-3">
                        <p className="text-[11px] text-slate-500">👤Marked By</p>
                        <p className="font-semibold text-slate-800">{current.lecturerName}</p>
                      </div>

                      <div className="col-span-3">
                        <p className="text-[11px] text-slate-500">🕒Marked At</p>
                        <p className="font-semibold text-slate-800">
                          {formatTime(current.markedAt)}
                        </p>
                      </div>

                      <div className="mt-3">
                        <p className="text-[11px] text-slate-500">Status</p>

                        <span
                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                            current.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {current.status === 'Completed' ? '🟢' : '⏳'}
                          {current.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
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
      <p className="mt-1 text-lg font-bold text-white md:text-xl">{value}</p>
    </div>
  )
}
