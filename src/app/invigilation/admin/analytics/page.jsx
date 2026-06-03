//src/app/invigilation/admin/analytics/page.jsx

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

    availableCount: 0,
    unavailableCount: 0,
    availabilityPercent: 0,

    examSummary: [],

    topLecturers: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/invigilation/reports/exam-analytics', {
        cache: 'no-store',
      })

      const data = await res.json()

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
        <InvigilationShell user={user} title="Exam Analytics">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Exam Analytics Dashboard</h1>

            <p className="mt-2 text-slate-500">Analytics and reports</p>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Sessions</p>

                <h3 className="mt-2 text-3xl font-bold text-blue-700">{stats.totalSessions}</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Duties</p>

                <h3 className="mt-2 text-3xl font-bold text-green-700">{stats.totalDuties}</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Total Lecturers</p>

                <h3 className="mt-2 text-3xl font-bold text-purple-700">{stats.totalLecturers}</h3>
              </div>

              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Rooms Used</p>

                <h3 className="mt-2 text-3xl font-bold text-orange-700">{stats.roomsUsed}</h3>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <h2 className="text-lg font-bold text-slate-800">Exam Wise Summary</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left">Exam Type</th>

                    <th className="px-4 py-3 text-center">Sessions</th>
                    <th className="px-4 py-3 text-center"> % of Total</th>
                  </tr>
                </thead>

                <tbody>
                  {stats.examSummary.map(exam => (
                    <tr key={exam.examType} className="border-t">
                      <td className="px-4 py-3 font-medium">{exam.examType}</td>

                      <td className="px-4 py-3 text-center font-bold text-blue-700">
                        {exam.sessions}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-green-700">
                        {((exam.sessions / stats.totalSessions) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 rounded-xl border bg-white shadow-sm">
                <div className="border-b px-5 py-4">
                  <h2 className="text-lg font-bold text-slate-800">🏆 Top 5 Busy Lecturers</h2>
                </div>

                <div className="p-4">
                  {(stats.topLecturers || []).map((lecturer, index) => (
                    <div
                      key={lecturer.lecturerName}
                      className="mb-3 flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {index + 1}
                        </div>

                        <span className="font-medium">{lecturer.lecturerName}</span>
                      </div>

                      <span className="font-bold text-green-700">{lecturer.duties} Duties</span>
                    </div>
                  ))}
                </div>
              </div>
              \
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-green-50 p-5 shadow-sm">
                  <p className="text-sm text-green-700">Available Records</p>

                  <h3 className="mt-2 text-3xl font-bold text-green-800">{stats.availableCount}</h3>
                </div>

                <div className="rounded-xl border bg-red-50 p-5 shadow-sm">
                  <p className="text-sm text-red-700">Unavailable Records</p>

                  <h3 className="mt-2 text-3xl font-bold text-red-800">{stats.unavailableCount}</h3>
                </div>

                <div className="rounded-xl border bg-blue-50 p-5 shadow-sm">
                  <p className="text-sm text-blue-700">Availability %</p>

                  <h3 className="mt-2 text-3xl font-bold text-blue-800">
                    {stats.availabilityPercent}%
                  </h3>
                </div>
              </div>
              <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Availability Health</h2>

                {Number(stats.availabilityPercent) >= 90 ? (
                  <div className="rounded-lg bg-green-100 p-4 text-green-800">
                    🟢 Excellent Availability
                    <div className="mt-2 text-sm">
                      Lecturers are highly available for invigilation duties.
                    </div>
                  </div>
                ) : Number(stats.availabilityPercent) >= 80 ? (
                  <div className="rounded-lg bg-yellow-100 p-4 text-yellow-800">
                    🟡 Good Availability
                    <div className="mt-2 text-sm">
                      Availability is acceptable but can be improved.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-red-100 p-4 text-red-800">
                    🔴 Poor Availability
                    <div className="mt-2 text-sm">
                      Lecturer availability is low. Duty allocation may be difficult.
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">⚖️ Duty Distribution Health</h2>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-700">Highest Load</p>

                    <h3 className="text-2xl font-bold text-blue-800">{stats.maxDuties}</h3>

                    <p className="text-sm">Duties</p>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <p className="text-sm text-green-700">Lowest Load</p>

                    <h3 className="text-2xl font-bold text-green-800">{stats.minDuties}</h3>

                    <p className="text-sm">Duties</p>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-sm text-orange-700">Difference</p>

                    <h3 className="text-2xl font-bold text-orange-800">{stats.loadDifference}</h3>

                    <p className="text-sm">Duties</p>
                  </div>
                </div>

                <div className="mt-5">
                  {stats.loadHealth === 'Balanced' ? (
                    <div className="rounded-lg bg-green-100 p-4 text-green-800">
                      🟢 Balanced Distribution
                    </div>
                  ) : stats.loadHealth === 'Moderate' ? (
                    <div className="rounded-lg bg-yellow-100 p-4 text-yellow-800">
                      🟡 Moderate Distribution
                    </div>
                  ) : (
                    <div className="rounded-lg bg-red-100 p-4 text-red-800">
                      🔴 Unbalanced Distribution
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
