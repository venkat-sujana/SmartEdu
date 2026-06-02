'use client'

import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'
import { useEffect, useState } from 'react'
export default function AnalyticsPage() {

  const [stats, setStats] = useState({
  totalSessions: 0,
  totalDuties: 0,
  totalLecturers: 0,
  roomsUsed: 0,
  examSummary: [],
})

const [loading, setLoading] =
  useState(true)

  useEffect(() => {
  loadAnalytics()
}, [])

const loadAnalytics =
  async () => {
    try {
      const res =
        await fetch(
          '/api/invigilation/reports/exam-analytics',
          {
            cache:
              'no-store',
          }
        )

      const data =
        await res.json()

      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell
          user={user}
          title="Exam Analytics"
        >
          <div className="p-6">
            <h1 className="text-2xl font-bold">
              Exam Analytics Dashboard
            </h1>
            

            <p className="mt-2 text-slate-500">
              Analytics and reports
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-4">

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">
      Total Sessions
    </p>

    <h3 className="mt-2 text-3xl font-bold text-blue-700">
      {stats.totalSessions}
    </h3>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">
      Total Duties
    </p>

    <h3 className="mt-2 text-3xl font-bold text-green-700">
      {stats.totalDuties}
    </h3>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">
      Total Lecturers
    </p>

    <h3 className="mt-2 text-3xl font-bold text-purple-700">
      {stats.totalLecturers}
    </h3>
  </div>

  <div className="rounded-xl border bg-white p-5 shadow-sm">
    <p className="text-sm text-slate-500">
      Rooms Used
    </p>

    <h3 className="mt-2 text-3xl font-bold text-orange-700">
      {stats.roomsUsed}
    </h3>
  </div>

</div>




          </div>
          <div className="mt-8 rounded-xl border bg-white shadow-sm">

  <div className="border-b px-5 py-4">
    <h2 className="text-lg font-bold text-slate-800">
      Exam Wise Summary
    </h2>
  </div>

  <div className="overflow-x-auto">

    <table className="min-w-full text-sm">

      <thead className="bg-slate-50">

        <tr>

          <th className="px-4 py-3 text-left">
            Exam Type
          </th>

          <th className="px-4 py-3 text-center">
            Sessions
          </th>

        </tr>

      </thead>

      <tbody>

        {stats.examSummary.map(exam => (

          <tr
            key={exam.examType}
            className="border-t"
          >

            <td className="px-4 py-3 font-medium">
              {exam.examType}
            </td>

            <td className="px-4 py-3 text-center font-bold text-blue-700">
              {exam.sessions}
            </td>

          </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}