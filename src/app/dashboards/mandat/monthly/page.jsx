import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import GroupAttendanceSummary from '@/components/attendance/GroupAttendanceSummary'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

const YEARS = ['First Year', 'Second Year']

export default function MonthlyAttendancePage() {
  const groupName = 'M&AT'
  const routeSegment = 'mandat'
  const dashboardReturnUrl = `/dashboards/${routeSegment}`
  const theme = getGroupTheme(groupName)

  return (
    <main
      className={`min-h-screen bg-linear-to-br ${theme.shell} px-2 py-3 sm:px-3 sm:py-4 md:px-4`}
    >
      <div className="mx-auto w-full max-w-7xl space-y-2.5 sm:space-y-3">

        {/* Page Header */}
        <header
          className={`
            rounded-xl border ${theme.softBorder}
            bg-linear-to-r ${theme.soft}
            px-3 py-2.5
            shadow-sm
            sm:px-4 sm:py-3
          `}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Lecturer Dashboard
              </p>

              <h1 className="mt-0.5 text-base font-black tracking-tight text-slate-900 sm:text-lg">
                Monthly Attendance
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {groupName} • Monthly Attendance Register
              </p>
            </div>

            <Link
              href={dashboardReturnUrl}
              className="
                inline-flex min-h-9 shrink-0 items-center justify-center
                gap-1.5 rounded-lg
                border border-slate-200
                bg-white
                px-3 py-1.5
                text-xs font-bold text-slate-700
                shadow-sm
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:bg-slate-50
                hover:shadow-md
                active:scale-[0.98]
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>

          </div>
        </header>

        {/* Monthly Attendance */}
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-3 py-2.5 sm:px-4 sm:py-3">
            <h2 className="text-sm font-black text-slate-900 sm:text-base">
              Monthly Attendance Register
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
              Full attendance register for each academic year.
            </p>
          </div>

          <div className="space-y-3 p-2 sm:p-3 md:p-4">
            {YEARS.map(year => (
              <div
                key={year}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50/60"
              >
                <div className="border-b border-slate-200 bg-white px-3 py-2">
                  <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                    {year}
                  </h3>
                </div>

                <div className="overflow-x-auto p-1.5 sm:p-2">
                  <GroupAttendanceSummary
                    group={groupName}
                    yearOfStudy={year}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  )
}