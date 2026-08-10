'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'

import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

const fetcher = async url => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch consecutive absentees')
  }

  return response.json()
}

export default function ConsecutiveAbsenteesPage() {
  const { data: session } = useSession()

  const groupName = 'M&AT'
  const routeSegment = 'mandat'
  const dashboardReturnUrl = `/dashboards/${routeSegment}`
  const theme = getGroupTheme(groupName)

  const collegeId = session?.user?.collegeId
  const collegeName = session?.user?.collegeName || 'College'

  const { data: consecutiveData, error, isLoading } = useSWR(
    collegeId
      ? `/api/attendance/consecutive-absentees?collegeId=${collegeId}`
      : null,
    fetcher
  )

  const consecutiveAbsentees = (consecutiveData?.absentees || []).filter(
    student => student.group === groupName
  )

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
                Consecutive Absentees
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {groupName} • {collegeName}
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

        {/* Consecutive Absentees */}
        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
          <div className="p-2 sm:p-3 md:p-4">

            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-4 text-center">
                <p className="text-sm font-semibold text-rose-700">
                  Unable to load consecutive absentees.
                </p>
              </div>
            ) : (
              <ConsecutiveAbsenteesCard
                data={consecutiveAbsentees}
                title={`${groupName} Consecutive Absentees`}
                loading={isLoading}
                showViewAll={false}
              />
            )}

          </div>
        </section>

      </div>
    </main>
  )
}