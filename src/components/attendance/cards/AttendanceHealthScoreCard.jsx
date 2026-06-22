'use client'

import { Activity } from 'lucide-react'
import { getAttendanceHealth } from '@/utils/attendanceHealth'

export default function AttendanceHealthScoreCard({
  attendancePercentage = 0,
  totalStudents = 0,
  presentStudents = 0,
  absentStudents = 0,
}) {
  const health = getAttendanceHealth(attendancePercentage)

  // Empty State
  if (totalStudents === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800">
            Attendance Health Score
          </h2>
        </div>

        <div className="py-10 text-center">
          <Activity className="mx-auto h-10 w-10 text-slate-300" />

          <p className="mt-3 font-medium text-slate-500">
            No attendance data available
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Attendance health score will appear after attendance is marked.
          </p>
        </div>
      </div>
    )
  }

  const progressColor =
    attendancePercentage >= 90
      ? 'bg-emerald-500'
      : attendancePercentage >= 80
        ? 'bg-yellow-500'
        : attendancePercentage >= 75
          ? 'bg-orange-500'
          : 'bg-red-500'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-800">
          Attendance Health Score
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            Overall Health
          </p>

          <div
            className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-medium ${health.bg} ${health.text}`}
          >
            {health.label}
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800">
          {attendancePercentage}%
        </h1>
      </div>

      <div className="mt-3">
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full ${progressColor}`}
            style={{
              width: `${attendancePercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-green-50 px-3 py-2 text-center">
          <p className="text-xs text-slate-500">
            Present
          </p>
          <p className="text-xl font-bold text-green-600">
            {presentStudents}
          </p>
        </div>

        <div className="rounded-xl bg-red-50 px-3 py-2 text-center">
          <p className="text-xs text-slate-500">
            Absent
          </p>
          <p className="text-xl font-bold text-red-600">
            {absentStudents}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 px-3 py-2 text-center">
          <p className="text-xs text-slate-500">
            Total
          </p>
          <p className="text-xl font-bold text-slate-800">
            {totalStudents}
          </p>
        </div>
      </div>
    </div>
  )
}