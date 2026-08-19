'use client'

import { useEffect, useMemo, useState } from 'react'

function getTodayKey() {
  const today = new Date()

  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getRecordDateKey(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function StudentTodayAttendance({ studentId }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) {
      setLoading(false)
      return
    }

    async function loadAttendance() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(
          `/api/attendance/student/${studentId}/daily`,
          {
            cache: 'no-store',
          }
        )

        const json = await res.json()

        if (!res.ok) {
          throw new Error(
            json?.message || 'Failed to load attendance'
          )
        }

        setRecords(
          Array.isArray(json?.data)
            ? json.data
            : []
        )
      } catch (error) {
        console.error(
          'Student today attendance error:',
          error
        )

        setError(
          error.message ||
            'Failed to load today attendance'
        )
      } finally {
        setLoading(false)
      }
    }

    loadAttendance()
  }, [studentId])

  const todayAttendance = useMemo(() => {
    const todayKey = getTodayKey()

    const result = {
      FN: null,
      AN: null,
    }

    for (const record of records) {
      const recordDate = getRecordDateKey(
        record.date
      )

      if (recordDate !== todayKey) {
        continue
      }

      const session = String(
        record.session || ''
      ).toUpperCase()

      if (
        session === 'FN' ||
        session === 'AN'
      ) {
        result[session] = record
      }
    }

    return result
  }, [records])

  const fnStatus =
    todayAttendance.FN?.status || 'Not Marked'

  const anStatus =
    todayAttendance.AN?.status || 'Not Marked'

  const dayStatus =
    fnStatus === 'Absent' &&
    anStatus === 'Absent'
      ? 'Absent'
      : fnStatus === 'Present' ||
          anStatus === 'Present'
        ? 'Present'
        : 'Not Marked'

  const statusStyle = (status) => {
    if (status === 'Present') {
      return {
        box: 'border-green-300 bg-green-50',
        icon: '✅',
        text: 'text-green-700',
      }
    }

    if (status === 'Absent') {
      return {
        box: 'border-red-300 bg-red-50',
        icon: '❌',
        text: 'text-red-700',
      }
    }

    return {
      box: 'border-amber-300 bg-amber-50',
      icon: '⏳',
      text: 'text-amber-700',
    }
  }

  const dayStyle = statusStyle(dayStatus)

  if (loading) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow">
        <div className="flex items-center justify-center gap-3 py-5">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <span className="text-sm font-semibold text-slate-500">
            Loading today&apos;s attendance...
          </span>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-center">
        <p className="font-semibold text-red-700">
          ⚠️ {error}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-blue-200 bg-white p-4 shadow-lg md:p-5">

      {/* Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xl font-extrabold text-blue-800">
          📅 Today&apos;s Attendance
        </h2>

        <p className="mt-1 text-sm font-semibold text-slate-500">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* FN / AN */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* FN */}
        <div
          className={`rounded-2xl border-2 p-4 ${statusStyle(fnStatus).box}`}
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-extrabold text-slate-600">
                ☀️ FN
              </p>

              <p
                className={`mt-1 text-xl font-black ${statusStyle(fnStatus).text}`}
              >
                {statusStyle(fnStatus).icon}{' '}
                {fnStatus}
              </p>
            </div>

            <div className="text-3xl">
              {statusStyle(fnStatus).icon}
            </div>

          </div>
        </div>

        {/* AN */}
        <div
          className={`rounded-2xl border-2 p-4 ${statusStyle(anStatus).box}`}
        >
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-extrabold text-slate-600">
                🌙 AN
              </p>

              <p
                className={`mt-1 text-xl font-black ${statusStyle(anStatus).text}`}
              >
                {statusStyle(anStatus).icon}{' '}
                {anStatus}
              </p>
            </div>

            <div className="text-3xl">
              {statusStyle(anStatus).icon}
            </div>

          </div>
        </div>

      </div>

      {/* Day Status */}
      <div
        className={`mt-4 rounded-2xl border-2 p-4 text-center ${dayStyle.box}`}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Day Status
        </p>

        <p
          className={`mt-1 text-2xl font-black ${dayStyle.text}`}
        >
          {dayStyle.icon} {dayStatus}
        </p>

        {fnStatus !== 'Not Marked' &&
          anStatus !== 'Not Marked' && (
            <p className="mt-1 text-xs font-semibold text-slate-500">
              FN: {fnStatus} &nbsp;•&nbsp; AN: {anStatus}
            </p>
          )}
      </div>

    </section>
  )
}