// app/components/StudentMonthlyAttendanceSummary/page.jsx

'use client'

import React, { useEffect, useState } from 'react'

// Helper function: Object response to summary array
function getMonthlySummary(attendanceRecordsObj) {
  if (!attendanceRecordsObj) return []
  return Object.entries(attendanceRecordsObj).map(([monthYear, values]) => {
    // Mapping names must match backend!
    const workingDays = values.totalWorkingDays
    const presentDays = values.presentDays
    const percentage = values.percent
    const shortage = values.shortage
    const status = values.status
    return {
      monthYear,
      workingDays,
      presentDays,
      percentage,
      shortage,
      status,
    }
  })
}

export default function StudentMonthlyAttendanceSummary({ studentId }) {
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) return
    async function fetchAttendance() {
      try {
        setLoading(true)
        const res = await fetch(`/api/attendance/student/${studentId}/monthly`)
        const data = await res.json()
        if (res.ok) {
          setAttendanceData(data)
          setError('')
        } else {
          setError(data.error || 'Failed to fetch attendance')
        }
      } catch (err) {
        setError('Server error while fetching attendance')
      } finally {
        setLoading(false)
      }
    }
    fetchAttendance()
  }, [studentId])

  const monthlySummary = getMonthlySummary(attendanceData)

  const totalWorking = monthlySummary.reduce((sum, m) => sum + (parseInt(m.workingDays) || 0), 0)
  const totalPresent = monthlySummary.reduce((sum, m) => sum + (parseInt(m.presentDays) || 0), 0)
  const totalShortage = monthlySummary.reduce((sum, m) => sum + (parseInt(m.shortage) || 0), 0)
  const totalPercent = totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(2) : '0.00'

  if (loading) return <p>Loading attendance data...</p>
  if (error) return <p className="text-red-600">Error: {error}</p>
  if (monthlySummary.length === 0) return <p>No attendance data available.</p>

  return (
    <div className="mx-auto max-w-5xl overflow-x-auto rounded border-1 border-blue-500 bg-cyan-100 p-4 shadow-2xl">
      <h2 className="mb-4 flex justify-center gap-2 text-center text-xl font-semibold">
        <span>📅</span> Monthly Attendance Summary
      </h2>
      <table className="w-full border border-gray-300 text-center text-sm">
        <thead className="bg-green-600 text-white">
          <tr>
            <th className="border border-green-700 p-2">
              <span>🗓️</span> Month-Year
            </th>
            <th className="border border-green-700 p-2">
              <span>⏰</span> Working Sessions
            </th>
            <th className="border border-green-700 p-2">
              <span>✅</span> Present Sessions
            </th>
            <th className="border border-green-700 p-2">
              <span>📊</span> Percentage
            </th>
          </tr>
        </thead>
        <tbody>
          {monthlySummary.map(
            ({ monthYear, workingDays, presentDays, percentage, shortage, status }, idx) => (
              <tr key={monthYear} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border p-2 font-semibold">{monthYear}</td>
                <td className="border p-2">{workingDays}</td>
                <td className="border p-2">{presentDays}</td>
                <td
                  className={`border p-2 ${parseFloat(percentage) < 75 ? 'font-bold text-red-600' : ''}`}
                >
                  {percentage}
                </td>
              </tr>
            )
          )}
          {/* Totals Row */}
          <tr className="bg-emerald-100 font-bold text-blue-900">
            <td className="border p-2 pr-6 text-right">Total</td>
            <td className="border p-2">{totalWorking}</td>
            <td className="border p-2">{totalPresent}</td>
            <td className="border p-2">{totalPercent}%</td>
            {/* <td className="border p-2">{totalShortage}</td> */}
            <td className="border p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
