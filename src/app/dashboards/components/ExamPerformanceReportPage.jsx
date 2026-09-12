'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import GroupExamDashboardPanel from '@/components/exams/GroupExamDashboardPanel'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

export default function ExamPerformanceReportPage({ groupName, routeSegment }) {
  const { data: session } = useSession()
  const theme = getGroupTheme(groupName)
  const collegeName = session?.user?.collegeName || 'College'

  return (
    <main className={`min-h-screen bg-linear-to-br ${theme.shell} p-3 sm:p-4 md:p-6`}>
      <div className="mx-auto max-w-6xl space-y-4">
        <header className={`flex flex-col gap-3 rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{collegeName}</p>
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{groupName} Exam Performance</h1>
            <p className="mt-1 text-sm text-slate-600">Detailed exam performance, pass rate, and student outcome analysis.</p>
          </div>
          <Link href={`/dashboards/${routeSegment}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </header>

        <GroupExamDashboardPanel groupName={groupName} />
      </div>
    </main>
  )
}
