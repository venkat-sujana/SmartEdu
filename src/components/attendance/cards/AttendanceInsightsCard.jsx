'use client'

import { Brain } from 'lucide-react'

export default function AttendanceInsightsCard({
  attendancePercentage = 0,
  previousAttendancePercentage = 0,
  totalAbsent = 0,
  bestGroup = '',
}) {
  const insights = []

  const change = attendancePercentage - previousAttendancePercentage

  if (change > 0) {
    insights.push(`Attendance improved by ${change}% compared to the previous day.`)
  }

  if (change < 0) {
    insights.push(`📉 Attendance dropped by ${Math.abs(change)}% compared to the previous day.`)
  }

  if (attendancePercentage < 75) {
    insights.push('⚠️ Attendance is below the recommended threshold of 75%.')
  }

  if (totalAbsent > 0) {
    insights.push(`${totalAbsent} 👥 students were absent today.`)
  }

  if (bestGroup) {
    insights.push(`🏆 ${bestGroup} is currently the best-performing group.`)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-violet-600" />
        <h2 className="font-semibold text-slate-800">Attendance Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="rounded-xl bg-violet-50 px-3 py-2 text-sm text-slate-700">
            • {insight}
          </div>
        ))}
      </div>
    </div>
  )
}
