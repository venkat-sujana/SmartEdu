//src/components/attendance/cards/AttendanceTrendCard.jsx
'use client'

import { TrendingUp } from 'lucide-react'

export default function AttendanceTrendCard({
  title = 'Attendance Trend',
  trendData = [],
}) {
  const validTrendData = trendData.filter(
    day => day.hasData
  )

  // Empty State
  if (!validTrendData.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">
            {title}
          </h2>
        </div>

        <div className="py-6 text-center">
          <TrendingUp className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 font-medium text-slate-500">
            No attendance trend available
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Start marking attendance to generate analytics.
          </p>
        </div>
      </div>
    )
  }

  const latest =
    validTrendData[validTrendData.length - 1]?.percentage || 0

  const previous =
    validTrendData[validTrendData.length - 2]?.percentage || 0

  const change = latest - previous

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-indigo-600" />
        <h2 className="font-semibold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-slate-800">
          {latest}%
        </h1>

        <div
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            change >= 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </div>
      </div>

      <div className="space-y-2">
        {validTrendData.map(day => (
          <div
            key={day.date}
            className="flex items-center gap-3"
          >
            <span className="w-12 text-xs text-slate-500">
              {day.label}
            </span>

            <div className="h-2 flex-1 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{
                  width: `${day.percentage}%`,
                }}
              />
            </div>

            <span className="w-10 text-right text-sm font-medium text-slate-700">
              {day.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}