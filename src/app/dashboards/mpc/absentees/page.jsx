import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from '@/components/attendance/TodayAbsenteesTable'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

export default function AbsenteesPage() {
  const groupName = 'MPC'
  const routeSegment = 'mpc'
  const dashboardReturnUrl = `/dashboards/${routeSegment}`
  const theme = getGroupTheme(groupName)

  return (
    <main
      className={`min-h-screen bg-linear-to-br ${theme.shell} px-2 py-3 sm:px-3 sm:py-4 md:px-4`}
    >
      <div className="mx-auto w-full max-w-6xl space-y-2.5 sm:space-y-3">

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
                Today&apos;s Absentees
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {groupName} • Attendance Reports
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

        {/* Today's Absentees */}
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="p-2 sm:p-3 md:p-4">
            <TodayAbsenteesTable
              groupFilter={groupName}
              header={true}
              collegeName="College"
            />
          </div>
        </section>

        
      </div>
    </main>
  )
}