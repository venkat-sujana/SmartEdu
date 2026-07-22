
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserPlus } from 'lucide-react'
import ExternalLinks from '@/components/ExternalLinks'
import LecturerInfoCard from '@/components/dashboard/LecturerInfoCard'
import GroupAttendanceCard from '@/components/OverallAttendanceMatrixCard/GroupAttendanceCard'
import DashboardFooter from '@/components/layout/Footer'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
import GroupDashboardSidebar from './GroupDashboardSidebar'

const fetcher = async url => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

function OverviewCard({ title, value, note, className }) {
  return (
    <div className={`rounded-3xl p-4 text-white shadow-sm ${className}`}>
      <p className="text-sm text-white/80">{title}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {note ? <p className="mt-2 text-xs text-white/75">{note}</p> : null}
    </div>
  )
}

function QuickLinkCard({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <p className="text-lg font-bold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </Link>
  )
}

export default function GroupDashboardPage({
  groupName,
  routeSegment,
  includeExternalLinks = false,
  includeEditAttendance = true,
 
}) {
  const { data: session } = useSession()
  const user = session?.user
  const theme = getGroupTheme(groupName)
  const collegeName = user?.collegeName || 'College'
  const baseDashboardHref = `/dashboards/${routeSegment}`
  const addStudentHref = `/register?group=${encodeURIComponent(groupName)}&returnUrl=${encodeURIComponent(baseDashboardHref)}`
  const marksPostingHref = `/exams-form?returnUrl=${encodeURIComponent(baseDashboardHref)}`
  const examDashboardHref = `/exams?returnUrl=${encodeURIComponent(baseDashboardHref)}`

  const { data: collegeDetails } = useSWR(
    user?.collegeId ? `/api/colleges/${user.collegeId}` : null,
    fetcher
  )
  const { data: groupDashboardData } = useSWR(
    user?.collegeId ? `/api/attendance/group-wise-today?collegeId=${user.collegeId}` : null,
    fetcher
  )
  const feeSummary = groupDashboardData?.feeSummary?.[groupName] || {}
  const firstYearFee = feeSummary['First Year'] || { total: 0, paid: 0 }
  const secondYearFee = feeSummary['Second Year'] || { total: 0, paid: 0 }
  const overviewCards = [
    {
      title: 'First Year Fee',
      value: `${firstYearFee.paid} / ${firstYearFee.total}`,
      note: 'Students paid vs total',
      className: 'bg-cyan-600',
    },
    {
      title: 'Second Year Fee',
      value: `${secondYearFee.paid} / ${secondYearFee.total}`,
      note: 'Students paid vs total',
      className: 'bg-violet-600',
    },
   
  ]

  const footerAddress = [collegeDetails?.address, collegeDetails?.district].filter(Boolean).join(', ')

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div
          className={`flex flex-col gap-4 rounded-3xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            
            <h1 className="mt-1 text-2xl font-black text-slate-900">{groupName}</h1>
            <p className="text-xs font-black text-slate-900 tracking-[0.25em] uppercase">Lecturer Dashboard</p>
            <p className="mt-1 text-sm font-black text-slate-900">{collegeName}</p>
            
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Link
              href={addStudentHref}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </Link>
            <Link
              href={`${baseDashboardHref}/attendance`}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
            >
              <UserPlus className="h-4 w-4" />
              Take Attendance
            </Link>
            <Link
              href={marksPostingHref}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
            >
              <UserPlus className="h-4 w-4" />
              Post Marks
            </Link>
            <Link
              href={examDashboardHref}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
            >
              <UserPlus className="h-4 w-4" />
              Exam Dashboard
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <GroupDashboardSidebar
              groupName={groupName}
              routeSegment={routeSegment}
              includeEditAttendance={includeEditAttendance}
              activeSection="overview"
            />
            <LecturerInfoCard user={user} groupName={groupName} />
            <div className="xl:hidden">
              <GroupAttendanceCard groupName={groupName} />
            </div>
            {includeExternalLinks ? (
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <ExternalLinks />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="hidden xl:block">
              <GroupAttendanceCard groupName={groupName} />
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-black text-slate-900">Fee Overview</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map(card => (
                  <OverviewCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-2xl font-black text-slate-900">Quick Links</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <QuickLinkCard
                  href={`${baseDashboardHref}/attendance`}
                  title="Attendance"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/students`}
                  title="Students"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/absentees`}
                  title="Absentees"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/absentees`}
                  title="Consecutive Absentees"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/monthly`}
                  title="Monthly Reports"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/exams`}
                  title="Exam Dashboard"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/fees`}
                  title="Fee Dashboard"
                  
                />
                {includeEditAttendance ? (
                  <QuickLinkCard
                    href={`${baseDashboardHref}/edit`}
                    title="Edit Attendance"
                    
                  />
                ) : null}
              </div>
            </section>

          </div>
        </div>

        <section
          className={`rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} shadow-sm`}
        >
          <DashboardFooter
            collegeName={collegeDetails?.name || collegeName}
            address={footerAddress || 'Address not available'}
            phone={collegeDetails?.phone || 'Phone not available'}
            email={collegeDetails?.email || 'Email not available'}
            groupName={groupName}
            facebookUrl="https://facebook.com/yourcollege"
            instagramUrl="https://instagram.com/yourcollege"
            twitterUrl="https://x.com/yourcollege"
            youtubeUrl="https://youtube.com/@yourcollege"
          />
        </section>
      </div>
    </div>
  )
}
