// src/components/StudentMonthlyAttendanceSummary/StudentMonthlyAttendanceSummary.jsx

'use client'

import React, { useEffect, useState } from 'react'

function getMonthlySummary(apiResponse) {
  if (!apiResponse?.data) return []

  return Object.entries(apiResponse.data).map(([month, values]) => ({
    monthYear: month,

    // API internally may still use these legacy field names.
    // We display them as DAYS in the Student Dashboard.
    workingDays: Number(values.workingSessions) || 0,
    presentDays: Number(values.presentSessions) || 0,

    percentage: values.percent || '0.00',
    shortage: Number(values.shortageSessions) || 0,
    status: values.status || '',
  }))
}

export default function StudentMonthlyAttendanceSummary({ studentId }) {
  const [attendanceData, setAttendanceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    async function fetchAttendance() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(
          `/api/attendance/student-summary?studentId=${studentId}`,
          {
            cache: 'no-store',
          }
        )

        const responseText = await res.text()

        console.log(
          'STUDENT ATTENDANCE STATUS:',
          res.status
        )

        let data

        try {
          data = JSON.parse(responseText)
        } catch (parseError) {
          console.error(
            'STUDENT ATTENDANCE JSON PARSE ERROR:',
            parseError
          )

          console.error(
            'STUDENT ATTENDANCE RESPONSE:',
            responseText
          )

          setError(
            `Attendance API returned an invalid response (${res.status}).`
          )

          return
        }

        console.log(
          'STUDENT ATTENDANCE API RESPONSE:',
          data
        )

        if (res.ok && data?.data) {
          setAttendanceData(data)
        } else {
          setError(
            data?.error ||
              data?.message ||
              'Failed to fetch attendance'
          )
        }
      } catch (err) {
        console.error(
          'ATTENDANCE FETCH ERROR:',
          err
        )

        setError(
          'Server error while fetching attendance'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAttendance()
  }, [studentId])

  // --------------------------------------------------
  // Monthly day-based summary
  // --------------------------------------------------

  const monthlySummary =
    getMonthlySummary(attendanceData)

  // --------------------------------------------------
  // Overall working days
  // --------------------------------------------------

  const totalWorking = monthlySummary.reduce(
    (sum, month) =>
      sum + (Number(month.workingDays) || 0),
    0
  )

  // --------------------------------------------------
  // Overall present days
  // --------------------------------------------------

  const totalPresent = monthlySummary.reduce(
    (sum, month) =>
      sum + (Number(month.presentDays) || 0),
    0
  )

  // --------------------------------------------------
  // Overall attendance percentage
  //
  // Present Days / Working Days × 100
  // --------------------------------------------------

  const totalPercent =
    totalWorking > 0
      ? ((totalPresent / totalWorking) * 100).toFixed(2)
      : '0.00'

  // --------------------------------------------------
  // Loading
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

        <span className="ml-3 text-sm text-gray-500">
          Loading attendance...
        </span>
      </div>
    )
  }

  // --------------------------------------------------
  // Error
  // --------------------------------------------------

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-center text-red-600">
        ⚠️ {error}
      </div>
    )
  }

  // --------------------------------------------------
  // No attendance
  // --------------------------------------------------

  if (monthlySummary.length === 0) {
    return (
      <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-center text-yellow-700">
        📭 No attendance data available yet.
      </div>
    )
  }

  // --------------------------------------------------
  // Monthly Attendance Table
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl overflow-x-auto rounded border border-blue-500 bg-cyan-100 p-4 shadow-2xl">

      {/* Heading */}

      <h2 className="mb-4 flex items-center justify-center gap-2 text-center text-xl font-semibold text-blue-800">
        📅 Monthly Day-Based Attendance
      </h2>

      <table className="w-full min-w-[700px] border border-gray-300 text-center text-sm">

        <thead className="bg-green-600 text-white">
          <tr>

            <th className="border border-green-700 p-2">
              🗓️ Month
            </th>

            <th className="border border-green-700 p-2">
              📅 Working Days
            </th>

            <th className="border border-green-700 p-2">
              ✅ Present Days
            </th>

            <th className="border border-green-700 p-2">
              📊 Attendance %
            </th>

            <th className="border border-green-700 p-2">
              🚨 Shortage
            </th>

            <th className="border border-green-700 p-2">
              🏷️ Status
            </th>

          </tr>
        </thead>

        <tbody>

          {monthlySummary.map(
            (
              {
                monthYear,
                workingDays,
                presentDays,
                percentage,
                shortage,
                status,
              },
              idx
            ) => {
              const pct = parseFloat(
                percentage
              )

              const isLow = pct < 75

              const rowBg = isLow
                ? 'bg-red-50'
                : idx % 2 === 0
                  ? 'bg-gray-50'
                  : 'bg-white'

              return (
                <tr
                  key={monthYear}
                  className={rowBg}
                >

                  {/* Month */}

                  <td className="border p-2 font-semibold">
                    {monthYear}
                  </td>

                  {/* Working Days */}

                  <td className="border p-2 font-medium">
                    {workingDays}
                  </td>

                  {/* Present Days */}

                  <td className="border p-2 font-medium text-green-700">
                    {presentDays}
                  </td>

                  {/* Percentage */}

                  <td
                    className={`border p-2 font-bold ${
                      isLow
                        ? 'text-red-600'
                        : 'text-green-700'
                    }`}
                  >
                    {percentage}%
                  </td>

                  {/* Shortage */}

                  <td
                    className={`border p-2 ${
                      shortage > 0
                        ? 'font-bold text-orange-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {shortage > 0
                      ? shortage
                      : '—'}
                  </td>

                  {/* Status */}

                  <td className="border p-2">
                    {status}
                  </td>

                </tr>
              )
            }
          )}

          {/* ------------------------------------------------
              Total Row
          ------------------------------------------------ */}

          <tr className="bg-emerald-100 font-bold text-blue-900">

            <td className="border p-2 text-right">
              📌 Total
            </td>

            <td className="border p-2">
              {totalWorking}
            </td>

            <td className="border p-2 text-green-700">
              {totalPresent}
            </td>

            <td
              className={`border p-2 ${
                parseFloat(totalPercent) < 75
                  ? 'text-red-600'
                  : 'text-green-700'
              }`}
            >
              {totalPercent}%
            </td>

            <td
              className="border p-2"
              colSpan={2}
            />

          </tr>

        </tbody>
      </table>

      {/* --------------------------------------------------
          Day-level rule explanation
      -------------------------------------------------- */}

      <div className="mt-4 rounded-xl border border-blue-200 bg-white/80 p-3 text-center text-xs font-semibold text-slate-600">

        ℹ️ Attendance is calculated by
        <span className="font-black text-blue-700">
          {' '}working days
        </span>
        {' '}and
        <span className="font-black text-green-700">
          {' '}present days
        </span>
        . If a student is Present in at least one session
        (FN/AN), that calendar day is counted as Present.

      </div>

    </div>
  )
}