//src/app/lecturer/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck2,
  UserRound,
  ClipboardCheck,
  AlertTriangle,
  Clock3,
  RefreshCw,
  UserPlus,
  FileText,
  ClipboardList,
  CalendarDays,
  FolderOpen,
} from 'lucide-react'

import OverallAttendanceMatrixCard from '@/components/OverallAttendanceMatrixCard/OverallAttendanceMatrixCard'
import TodayAbsenteesTable from '@/components/attendance/TodayAbsenteesTable'
// import OverallStrengthCard from '@/components/dashboard/OverallStrengthCard'
import AttendanceShortageTable from '@/components/attendance-shortage-summary/AttendanceShortageSummary'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'

const fetcher = async (...args) => {
  const res = await fetch(...args)

  if (!res.ok) {
    throw new Error('Unable to load dashboard data')
  }

  return res.json()
}

const GROUP_ROUTE_SEGMENTS = {
  MPC: 'mpc',
  'M&AT': 'mandat',
  CET: 'cet',
  MLT: 'mlt',
  BiPC: 'bipc',
  BIPC: 'bipc',
  CEC: 'cec',
  HEC: 'hec',
  GFC: 'gfc',
}

function getGroupRouteSegment(groupName) {
  return GROUP_ROUTE_SEGMENTS[String(groupName || '').trim()] || null
}


function getGroupQuickActions(groupName) {
  const group = String(groupName || '').trim()
  const returnUrl = '/lecturer/dashboard'

  return [
    {
      label: 'Add Student',
      icon: UserPlus,
      href: `/register?group=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Student Records',
      icon: FolderOpen,
      href: '/students',
    },
    {
      label: 'Exam Dashboard',
      icon: FileText,
      href: `/exams?stream=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Assignment Marks',
      icon: ClipboardList,
      href: '/assignments',
    },
    {
      label: 'Post Marks',
      icon: BookOpen,
      href: `/exams-form?returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Attendance Calendar',
      icon: CalendarDays,
      href: '/attendance-records/attendance-calendar',
    },
    {
      label: 'Late Entry',
      icon: Clock3,
      href: '/late-entry',
    },
    {
      label: 'Invigilation Duties',
      icon: ClipboardCheck,
      href: '/invigilation/lecturer/duties',
    },
    
    {
      label: 'Today’s Attendance',
      icon: CalendarCheck2,
      href: `/attendance-form?groups=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Today’s Absentees',
      icon: UserRound,
      href: '/lecturer/dashboard#todays-absentees',
    },
    {
      label: 'Update Attendance',
      icon: RefreshCw,
      href: '/attendance-edit-form',
    },
    {
      label: 'Monthly Attendance',
      icon: CalendarDays,
      href: '/attendance-records/monthly-summary',
    },
    {
      label: 'Late Entry Register',
      icon: Clock3,
      href: '/late-entry-register',
    },
    {
      label: 'Timetable Dashboard',
      icon: GraduationCap,
      href: '/timetable/dashboard',
    },
    {
      label: 'Lecturer Timetable',
      icon: BookOpen,
      href: '/timetable/lecturer',
    },
    {
  label: 'Fee Dashboard',
  icon: GraduationCap,
  href: getGroupRouteSegment(group)
    ? `/dashboards/${getGroupRouteSegment(group)}/fees`
    : '/fee',
},
  ]
}


function SectionHeading({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3 sm:mb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 sm:h-11 sm:w-11 sm:rounded-2xl">
        <Icon size={20} className="sm:hidden" />
        <Icon size={21} className="hidden sm:block" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500 sm:max-w-3xl">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 wrap-break-word text-2xl font-extrabold tracking-tight text-slate-900 sm:mt-3 sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
          <Icon size={22} />
        </div>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-5 text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}

function SectionPanel({ children, className = '' }) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  )
}

export default function LecturerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [collegeName, setCollegeName] = useState('')
  const [studentCount, setStudentCount] = useState(0)
  const [studentCountLoading, setStudentCountLoading] = useState(true)

  const user = session?.user || {}
  const collegeId = user.collegeId
  // Load all groups mapped to the signed-in lecturer
  const {
    data: groupMappingData,
    error: groupMappingError,
    isLoading: groupsLoading,
  } = useSWR(
    status === 'authenticated' ? '/api/lecturer/group-mapping' : null,
    fetcher
  )

  const { data: shortageApiData, error: shortageError } = useSWR(
    status === 'authenticated' ? '/api/attendance/shortage-summary' : null,
    fetcher
  )

  const {
    data: absApiData,
    error: attendanceError,
    isLoading: attendanceLoading,
  } = useSWR(
    status === 'authenticated' ? '/api/attendance/today-absentees' : null,
    fetcher
  )

  const {
    data: consecutiveData,
    error: consecutiveError,
    isLoading: consecutiveLoading,
  } = useSWR(
    status === 'authenticated' && collegeId
      ? `/api/attendance/consecutive-absentees?collegeId=${encodeURIComponent(collegeId)}`
      : null,
    fetcher
  )

  const shortageData = shortageApiData?.data || []
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}
  const consecutiveAbsentees = consecutiveData?.absentees || []
  const mappedGroups = Array.isArray(groupMappingData?.groups) ? groupMappingData.groups : []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/lecturer/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !collegeId) return

    let cancelled = false

    const loadCollegeName = async () => {
      try {
        const res = await fetch(`/api/colleges/${encodeURIComponent(collegeId)}`)
        if (!res.ok) return

        const data = await res.json()

        if (!cancelled && data?.name) {
          setCollegeName(data.name)
        }
      } catch (error) {
        console.error('College name fetch error:', error)
      }
    }

    const loadStudentCount = async () => {
      setStudentCountLoading(true)

      try {
        const params = new URLSearchParams({ collegeId })

        if (user.subject) {
          params.set('subject', user.subject)
        }

        const res = await fetch(`/api/students/count?${params.toString()}`)
        if (!res.ok) throw new Error('Unable to load student count')

        const data = await res.json()

        if (!cancelled && data?.count !== undefined) {
          setStudentCount(data.count)
        }
      } catch (error) {
        console.error('Student count fetch error:', error)
      } finally {
        if (!cancelled) {
          setStudentCountLoading(false)
        }
      }
    }

    loadCollegeName()
    loadStudentCount()

    return () => {
      cancelled = true
    }
  }, [status, collegeId, user.subject])

  if (status === 'loading' || (status === 'authenticated' && !collegeId)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <RefreshCw className="animate-spin text-indigo-600" size={22} />
          <div>
            <p className="font-semibold text-slate-800">Loading dashboard</p>
            <p className="mt-1 text-sm text-slate-500">
              Preparing your college overview...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const lecturerName = user.name || user.lecturerName || 'Lecturer'
  const subjectName = user.subject || 'Assigned subject'

  return (
    <main className="min-h-screen bg-slate-50/90 px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-5 sm:space-y-7">

        {/* Dashboard header */}
        <header className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-slate-950 via-indigo-950 to-indigo-800 px-4 py-6 text-white shadow-xl sm:rounded-3xl sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/3 -z-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner backdrop-blur sm:h-14 sm:w-14 sm:rounded-2xl">
                <GraduationCap className="h-6 w-6 sm:h-[30px] sm:w-[30px]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
                  OSRA Lecturer Portal
                </p>

                <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-3xl">
                  Lecturer Dashboard
                </h1>

                <p className="mt-2 max-w-2xl wrap-break-word text-sm leading-6 text-indigo-100 sm:text-base">
                  {collegeName || user.collegeName || 'Your College'}
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:min-w-64 sm:p-4 lg:w-auto">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <UserRound size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-indigo-200">
                    Signed in as
                  </p>
                  <p className="mt-1 truncate font-bold text-white">
                    {lecturerName}
                  </p>
                  <p className="mt-1 truncate text-sm text-indigo-100">
                    {subjectName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/15 pt-4 text-xs font-medium text-indigo-100 sm:mt-7 sm:pt-5 sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <CalendarCheck2 size={15} />
              Attendance overview
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <ClipboardCheck size={15} />
              Student monitoring
            </span>
          </div>
        </header>

        {/* Quick Actions */}
        <SectionPanel>
          <SectionHeading
            icon={ClipboardList}
            eyebrow="Quick access"
            title="Quick Actions"
            description="Choose a mapped group to access common student and academic tasks."
          />

          {groupsLoading ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading your mapped groups...
            </p>
          ) : groupMappingError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Unable to load your mapped groups. Please refresh and try again.
            </p>
          ) : mappedGroups.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No groups are currently mapped to your lecturer account.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
              {mappedGroups.map((groupName) => (
                <div
                  key={groupName}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{groupName}</h3>
                      <p className="text-xs text-slate-500">Mapped group actions</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 min-[460px]:grid-cols-2">
                    {getGroupQuickActions(groupName).map((action) => {
                      const Icon = action.icon
                      return (
                        <a
                          key={action.label}
                          href={action.href}
                          className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:min-h-11 sm:py-2.5 sm:text-sm"
                        >
                          <Icon size={17} className="shrink-0" />
                          <span>{action.label}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>
        {/* At-a-glance metrics */}
        <section>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              At a glance
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
              Your college overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick view of your student strength and attendance activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              icon={Users}
              label="Total Student Strength"
              value={studentCountLoading ? '' : studentCount}
              description="Student count available to your lecturer account."
            />

            <MetricCard
              icon={CalendarCheck2}
              label="Attendance Status"
              value={attendanceLoading ? 'Loading' : attendanceError ? 'Unavailable' : 'Updated'}
              description={
                attendanceError
                  ? 'Attendance summary could not be loaded.'
                  : 'Todays attendance summary.'
              }
            />

            <MetricCard
              icon={BookOpen}
              label="Teaching Subject"
              value={subjectName}
              description="Subject associated with your account."
            />
          </div>
        </section>

        {/* Attendance overview */}
        {/* <SectionPanel>
          <SectionHeading
            icon={ClipboardCheck}
            eyebrow="Attendance analytics"
            title="Attendance Overview"
            description="Review present and absent student counts for available sessions."
          />

          {attendanceError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Attendance overview could not be loaded. Please refresh the page and try again.
            </div>
          ) : (
            <OverallStrengthCard
              sessionWisePresent={sessionWisePresent}
              sessionWiseAbsentees={sessionWiseAbsentees}
            />
          )}
        </SectionPanel> */}

        {/* Mapped group attendance cards */}
        <SectionPanel>
          <SectionHeading
            icon={Users}
            eyebrow="Group-wise monitoring"
            title="My Group Attendance"
            description="Separate attendance cards are displayed for the groups mapped to your lecturer account."
          />

          <OverallAttendanceMatrixCard />
        </SectionPanel>

        {/* Today's absentees */}
        <SectionPanel>
          <div id="todays-absentees" className="scroll-mt-6">
          <SectionHeading
            icon={UserRound}
            eyebrow="Daily monitoring"
            title="Todays Absentees"
            description="Review session-wise absentee information and use the PDF export option when needed."
          />

          <TodayAbsenteesTable
            collegeId={collegeId}
            header={true}
          />
          </div>
        </SectionPanel>

        {/* Attendance shortage */}
        <SectionPanel>
          <SectionHeading
            icon={AlertTriangle}
            eyebrow="Student follow-up"
            title="Attendance Shortage"
            description="Identify students who may need attendance-related follow-up."
          />

          {shortageError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Attendance shortage information could not be loaded.
            </div>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <AttendanceShortageTable data={shortageData} />
            </div>
          )}
        </SectionPanel>

        {/* Consecutive absentees */}
        <SectionPanel>
          <SectionHeading
            icon={Clock3}
            eyebrow="Student follow-up"
            title="Consecutive Absentees"
            description="Review repeated absences and identify students who may require attention."
          />

          {consecutiveError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Consecutive absentee information could not be loaded.
            </div>
          ) : (
            <ConsecutiveAbsenteesCard
              data={consecutiveAbsentees}
              loading={consecutiveLoading}
            />
          )}
        </SectionPanel>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-2 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p> {new Date().getFullYear()} OSRA System. All rights reserved.</p>
          <p className="font-medium text-slate-400">
            Lecturer Portal Â· Attendance & Student Monitoring
          </p>
        </footer>
      </div>
    </main>
  )
}

