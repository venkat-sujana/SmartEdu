'use client'

import { Trophy } from 'lucide-react'

export default function GroupPerformanceCard({ title = 'Group Performance', groups = [] }) {
  if (!groups.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-slate-800">{title}</h2>
        </div>

        <div className="py-6 text-center">
          <Trophy className="mx-auto h-8 w-8 text-slate-300" />

          <p className="mt-3 font-medium text-slate-500">No group performance data available</p>

          <p className="mt-1 text-sm text-slate-400">
            Performance metrics will appear after attendance is marked.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-600" />
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </div>

      <div className="space-y-3">
        {groups.map(group => {
          const badgeColor =
            group.percentage >= 90
              ? 'bg-emerald-100 text-emerald-700'
              : group.percentage >= 80
                ? 'bg-yellow-100 text-yellow-700'
                : group.percentage >= 75
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-red-100 text-red-700'

          return (
            <div key={group.name} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-slate-700">{group.name}</span>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                  {group.percentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full ${
                    group.percentage >= 90
                      ? 'bg-emerald-500'
                      : group.percentage >= 80
                        ? 'bg-yellow-500'
                        : group.percentage >= 75
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                  }`}
                  style={{
                    width: `${group.percentage}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
