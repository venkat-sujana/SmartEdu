
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
    <div className={`rounded-3xl p-4 text-white shadow-sm sm:p-5 ${className}`}>
      <p className="text-xs text-white/80 sm:text-sm">{title}</p>
      <p className="mt-2 text-xl font-black sm:text-2xl">{value}</p>
      {note ? <p className="mt-2 text-xs text-white/75">{note}</p> : null}
    </div>
  )
}

function QuickLinkCard({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
    >
      <p className="text-base font-bold text-slate-900 sm:text-lg">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
    </Link>
  )
}

function HeaderActionLink({ href, label, theme, variant = 'theme' }) {
  const className =
    variant === 'neutral'
      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      : `${theme.pill}`

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm font-semibold shadow-sm transition sm:px-4 ${className}`}
    >
      <UserPlus className="h-4 w-4" />
      {label}
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
      
      className: 'bg-cyan-600',
    },
    {
      title: 'Second Year Fee',
      value: `${secondYearFee.paid} / ${secondYearFee.total}`,
      
      className: 'bg-violet-600',
    },
   
  ]

  const footerAddress = [collegeDetails?.address, collegeDetails?.district].filter(Boolean).join(', ')

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-3 sm:p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div
          className={`flex flex-col gap-4 rounded-3xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{groupName}</h1>
            <p className="text-[11px] font-black text-slate-900 tracking-[0.2em] uppercase sm:text-xs">Lecturer Dashboard</p>
            <p className="mt-1 text-sm font-black text-slate-900">{collegeName}</p>
            
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <HeaderActionLink href={addStudentHref} label="Add Student" theme={theme} />
            <HeaderActionLink
              href={`${baseDashboardHref}/attendance`}
              label="Take Attendance"
              theme={theme}
            />
            <HeaderActionLink href={marksPostingHref} label="Post Marks" theme={theme} />
            <HeaderActionLink href={examDashboardHref} label="Exam Dashboard" theme={theme} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
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

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Fee Overview</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map(card => (
                  <OverviewCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Quick Links</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
