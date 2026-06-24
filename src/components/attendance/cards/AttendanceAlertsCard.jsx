'use client'

import { AlertTriangle } from 'lucide-react'

export default function AttendanceAlertsCard({
  alerts = [],
}) {
  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-slate-800">
            Attendance Alerts
          </h2>
        </div>

        <div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          ✅ No critical attendance alerts today.
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <h2 className="font-semibold text-slate-800">
          Attendance Alerts
        </h2>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              alert.type === 'critical'
  ? 'bg-red-50 text-red-700'
  : alert.type === 'warning'
    ? 'bg-amber-50 text-amber-700'
    : alert.type === 'success'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-blue-50 text-blue-700'
            }`}
          >
            {alert.icon} {alert.message}
          </div>
        ))}
      </div>
    </div>
  )
}