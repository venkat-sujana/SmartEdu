'use client'

import React, { useEffect, useState } from 'react'

function getMonthlySummary(apiResponse) {
  if (!apiResponse?.data) return []

  return Object.entries(apiResponse.data).map(([month, values]) => ({
    monthYear:   month,
    workingDays: values.workingSessions,
    presentDays: values.presentSessions,
    percentage:  values.percent,
    shortage:    values.shortageSessions,
    status:      values.status,
  }))
}

export default function StudentMonthlyAttendanceSummary({ studentId }) {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    async function fetchAttendance() {
      try {
        setLoading(true)
        setError('')

        const res  = await fetch(
          `/api/attendance/student-summary?studentId=${studentId}`,
          { cache: 'no-store' }
        )
        const data = await res.json()

        console.log('ATTENDANCE API RESPONSE =>', data)

        if (res.ok && data?.data) {
          setAttendanceData(data)
        } else {
          setError(data.error || 'Failed to fetch attendance')
        }
      } catch (err) {
        console.error('ATTENDANCE FETCH ERROR =>', err)
        setError('Server error while fetching attendance')
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [studentId])

  const monthlySummary = getMonthlySummary(attendanceData)

  const totalWorking = monthlySummary.reduce(
    (sum, m) => sum + (parseInt(m.workingDays) || 0), 0
  )
  const totalPresent = monthlySummary.reduce(
    (sum, m) => sum + (parseInt(m.presentDays) || 0), 0
  )
  const totalPercent =
    totalWorking > 0
      ? ((totalPresent / totalWorking) * 100).toFixed(2)
      : '0.00'

  // ── Loading ──────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="ml-3 text-sm text-gray-500">Loading attendance...</span>
      </div>
    )

  // ── Error ────────────────────────────────────────────────
  if (error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    )

  // ── No data ──────────────────────────────────────────────
  if (monthlySummary.length === 0)
    return (
      <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-center text-yellow-700">
        📭 No attendance data available yet.
      </div>
    )

  // ── Table ────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl overflow-x-auto rounded border border-blue-500 bg-cyan-100 p-4 shadow-2xl">
      <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-xl font-semibold text-blue-800">
        📅 Monthly Attendance Summary
      </h2>

      <table className="w-full border border-gray-300 text-center text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border border-green-700 p-2">🗓️ Month</th>
            <th className="border border-green-700 p-2">⏰ Working Sessions</th>
            <th className="border border-green-700 p-2">✅ Present Sessions</th>
            <th className="border border-green-700 p-2">📊 Percentage</th>
            <th className="border border-green-700 p-2">🚨 Shortage</th>
            <th className="border border-green-700 p-2">🏷️ Status</th>
          </tr>
        </thead>

        <tbody>
          {monthlySummary.map(
            ({ monthYear, workingDays, presentDays, percentage, shortage, status }, idx) => {
              const pct     = parseFloat(percentage)
              const isLow   = pct < 75
              const rowBg   = isLow
                ? 'bg-red-50'
                : idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'

              return (
                <tr key={monthYear} className={rowBg}>
                  <td className="border p-2 font-semibold">{monthYear}</td>
                  <td className="border p-2">{workingDays}</td>
                  <td className="border p-2">{presentDays}</td>
                  <td className={`border p-2 font-bold ${isLow ? 'text-red-600' : 'text-green-700'}`}>
                    {percentage}%
                  </td>
                  <td className={`border p-2 ${shortage > 0 ? 'font-bold text-orange-600' : 'text-gray-500'}`}>
                    {shortage > 0 ? shortage : '—'}
                  </td>
                  <td className="border p-2">{status}</td>
                </tr>
              )
            }
          )}

          {/* Totals row */}
          <tr className="bg-emerald-100 font-bold text-blue-900">
            <td className="border p-2 text-right">📌 Total</td>
            <td className="border p-2">{totalWorking}</td>
            <td className="border p-2">{totalPresent}</td>
            <td className={`border p-2 ${parseFloat(totalPercent) < 75 ? 'text-red-600' : 'text-green-700'}`}>
              {totalPercent}%
            </td>
            <td className="border p-2" colSpan={2}></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}