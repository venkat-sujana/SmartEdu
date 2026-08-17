
'use client'

import Link from 'next/link'
import { Menu, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { getDashboardRouteForLecturerSubject } from '@/utils/lecturerDashboardRoute'

import {
  AcademicCapIcon,
  CalendarDaysIcon,
  HomeIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid'

function SidebarLink({ href, label, icon, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[13px] font-medium transition ${
        active
          ? 'bg-white text-slate-950 shadow-md shadow-slate-950/10'
          : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
          active
            ? 'bg-slate-100 text-slate-900'
            : 'bg-white/8 text-slate-200 group-hover:bg-white/12'
        }`}
      >
        {icon}
      </span>

      <span className="truncate leading-5">
        {label}
      </span>
    </Link>
  )
}

function SidebarCategory({
  title,
  icon,
  open,
  onToggle,
  children,
}) {
  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left transition hover:bg-white/8"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white/8 text-cyan-300">
            {icon}
          </span>

          <span className="truncate text-[10px] font-bold tracking-[0.14em] text-slate-400 uppercase">
            {title}
          </span>
        </span>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5 pl-1">
          {children}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ onClose }) {
  const pathname = usePathname()
  const session = useSession()
  const user = session.data?.user || {}

  const role = user.role

  const isAdmin = role === 'admin'
  const isPrincipal = role === 'principal'
  const isLecturer = role === 'lecturer'
  const isOffice = role === 'office'

  const canAccessAiAttendance =
    role === 'lecturer' || role === 'principal'

  const lecturerDashboardUrl =
    getDashboardRouteForLecturerSubject(user.subject)

  const attendanceFormHref =
    `/attendance-form?returnUrl=${encodeURIComponent(
      lecturerDashboardUrl
    )}`

  const examsFormHref =
    `/exams-form?returnUrl=${encodeURIComponent(
      lecturerDashboardUrl
    )}`

  const examsDashboardHref =
    `/exams?returnUrl=${encodeURIComponent(
      lecturerDashboardUrl
    )}`

  // --------------------------------------------------
  // Category state
  // --------------------------------------------------

  const [openCategories, setOpenCategories] = useState({
    attendance: true,
    exams: true,
    timetable: false,
    students: false,
    reports: false,
    administration: false,
    tools: false,
  })

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  // --------------------------------------------------
  // Active route
  // --------------------------------------------------

  const isActive = (href) => {
    const activeHref = href.split('?')[0]

    return activeHref === '/'
      ? pathname === activeHref
      : pathname?.startsWith(activeHref)
  }

  // --------------------------------------------------
  // Admin links
  // --------------------------------------------------

  const adminLinks = [
    {
      href: '/',
      label: 'Home',
      icon: <HomeIcon className="h-4 w-4 text-emerald-500" />,
    },
    {
      href: '/admin-panel',
      label: 'Admin Panel',
      icon: (
        <ShieldCheckIcon className="h-4 w-4 text-cyan-500" />
      ),
    },
    {
      href: '/student-table',
      label: 'Student Table',
      icon: (
        <UserGroupIcon className="h-4 w-4 text-violet-500" />
      ),
    },
    {
      href: '/lecturer-registration',
      label: 'Lecturer Registration',
      icon: (
        <AcademicCapIcon className="h-4 w-4 text-amber-500" />
      ),
    },
    {
      href: '/principal-registration',
      label: 'Principal Registration',
      icon: (
        <UserCircleIcon className="h-4 w-4 text-indigo-500" />
      ),
    },
  ]

  // --------------------------------------------------
  // Timetable
  // --------------------------------------------------

  const timetableLinks = isPrincipal
    ? [
        {
          href: '/timetable',
          label: 'Academic Time Table',
          icon: (
            <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
          ),
        },
        {
          href: '/timetable/dashboard',
          label: 'Time Table Dashboard',
          icon: (
            <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
          ),
        },
        {
          href: '/timetable/lecturer',
          label: 'Lecturer Time Table',
          icon: (
            <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
          ),
        },
        {
          href: '/timetable/student',
          label: 'Student Time Table',
          icon: (
            <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
          ),
        },
      ]
    : isOffice
      ? [
          {
            href: '/timetable/dashboard',
            label: 'Time Table Dashboard',
            icon: (
              <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
            ),
          },
          {
            href: '/timetable/lecturer',
            label: 'Lecturer Time Table',
            icon: (
              <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
            ),
          },
          {
            href: '/timetable/student',
            label: 'Student Time Table',
            icon: (
              <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
            ),
          },
        ]
      : isLecturer
        ? [
            {
              href: '/timetable/dashboard',
              label: 'Time Table Dashboard',
              icon: (
                <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
              ),
            },
            {
              href: '/timetable/lecturer',
              label: 'My Time Table',
              icon: (
                <CalendarDaysIcon className="h-4 w-4 text-cyan-500" />
              ),
            },
          ]
        : []

  // --------------------------------------------------
  // Common links
  // --------------------------------------------------

  const attendanceLinks = [
    {
      href: attendanceFormHref,
      label: 'Take Attendance',
      icon: (
        <PencilSquareIcon className="h-4 w-4 text-emerald-500" />
      ),
    },
    {
      href: '/absentees-table',
      label: "Today's Absentees",
      icon: (
        <XCircleIcon className="h-4 w-4 text-rose-500" />
      ),
    },
    {
      href: '/attendance-records/individual',
      label: 'Update Attendance',
      icon: (
        <PencilSquareIcon className="h-4 w-4 text-blue-500" />
      ),
    },
    {
      href: '/attendance-records/attendance-calendar',
      label: 'Calendar View',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
      ),
    },
    {
      href: '/attendance-records/monthly-summary',
      label: 'CAR',
      icon: (
        <UserGroupIcon className="h-4 w-4 text-violet-500" />
      ),
    },
    {
      href: '/late-entry',
      label: 'Late Entry',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
      ),
    },
    {
      href: '/late-entry-register',
      label: 'Late Entry Register',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-amber-500" />
      ),
    },
  ]

  const examLinks = [
    {
      href: examsFormHref,
      label: 'Marks Posting',
      icon: (
        <PencilSquareIcon className="h-4 w-4 text-indigo-500" />
      ),
    },
    {
      href: examsDashboardHref,
      label: 'Exam Dashboard',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-blue-500" />
      ),
    },
  ]

  const studentLinks = [
    {
      href: '/student-table',
      label: 'Student Table',
      icon: (
        <UserGroupIcon className="h-4 w-4 text-violet-500" />
      ),
    },
    {
      href: '/student-analytics',
      label: 'Student Analytics',
      icon: (
        <UserCircleIcon className="h-4 w-4 text-blue-500" />
      ),
    },
  ]

  const reportLinks = [
    {
      href: '/ai-reports',
      label: 'AI Reports',
      icon: (
        <AcademicCapIcon className="h-4 w-4 text-purple-500" />
      ),
    },
    {
      href: '/attendance-insights',
      label: 'Attendance Insights',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-teal-500" />
      ),
    },
    {
      href: '/performance-tracker',
      label: 'Performance Tracker',
      icon: (
        <AcademicCapIcon className="h-4 w-4 text-pink-500" />
      ),
    },
    {
      href: '/reports-center',
      label: 'Reports Center',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-sky-500" />
      ),
    },
  ]

  const administrationLinks = [
    {
      href: '/faculty-monitor',
      label: 'Faculty Monitor',
      icon: (
        <UserGroupIcon className="h-4 w-4 text-cyan-500" />
      ),
    },
    {
      href: '/notifications',
      label: 'Notifications',
      icon: (
        <CalendarDaysIcon className="h-4 w-4 text-amber-500" />
      ),
    },
    {
      href: '/sms-center',
      label: 'SMS Center',
      icon: (
        <PencilSquareIcon className="h-4 w-4 text-green-500" />
      ),
    },
    {
      href: '/principal-tools',
      label: 'Principal Tools',
      icon: (
        <ShieldCheckIcon className="h-4 w-4 text-red-500" />
      ),
    },
    {
      href: '/college-settings',
      label: 'College Settings',
      icon: (
        <UserCircleIcon className="h-4 w-4 text-yellow-500" />
      ),
    },
    {
      href: '/data-export',
      label: 'Data Export',
      icon: (
        <PencilSquareIcon className="h-4 w-4 text-lime-500" />
      ),
    },
    {
      href: '/audit-log',
      label: 'Audit Log',
      icon: (
        <ShieldCheckIcon className="h-4 w-4 text-rose-500" />
      ),
    },
  ]

  const toolLinks = [
    {
      href: '/invigilation/login',
      label: 'Invigilation',
      icon: (
        <ShieldCheckIcon className="h-4 w-4 text-cyan-500" />
      ),
    },
    {
      href: '/parent-communication',
      label: 'Parent Communication',
      icon: (
        <UserGroupIcon className="h-4 w-4 text-orange-500" />
      ),
    },
    {
      href: '/staff-directory',
      label: 'Staff Directory',
      icon: (
        <UserCircleIcon className="h-4 w-4 text-indigo-500" />
      ),
    },
    {
      href: '/help-center',
      label: 'Help Center',
      icon: (
        <AcademicCapIcon className="h-4 w-4 text-cyan-400" />
      ),
    },
  ]

  if (canAccessAiAttendance) {
    toolLinks.push({
      href: '/attendance/ai-chat',
      label: 'AI Attendance Assistant',
      icon: (
        <AcademicCapIcon className="h-4 w-4 text-lime-500" />
      ),
    })
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-2.5 py-3 text-slate-100 shadow-2xl sm:w-64">

      {/* Header */}

      <div className="mb-2 shrink-0 rounded-2xl border border-white/10 bg-white/6 p-2.5 shadow-lg">

        <div className="flex items-center gap-2.5">

          <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-200 ring-1 ring-cyan-300/20">
            <Menu className="h-5 w-5" />
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-[9px] font-bold tracking-[0.18em] text-slate-400 uppercase">
              Workspace
            </h3>

            <p className="truncate text-xs font-bold text-white">
              {user.collegeName ||
                (isAdmin ? 'System Admin' : 'Your College')}
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav
        className="flex-1 overflow-x-hidden overflow-y-auto pr-1"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >

        {/* ================= HOME / ADMIN ================= */}

        {isAdmin ? (
          <>
            {adminLinks.map((link) => (
              <SidebarLink
                key={link.href}
                {...link}
                active={isActive(link.href)}
                onClick={onClose}
              />
            ))}
          </>
        ) : (
          <>

            {/* ================= ATTENDANCE ================= */}

            <SidebarCategory
              title="Attendance"
              icon={
                <CalendarDaysIcon className="h-4 w-4" />
              }
              open={openCategories.attendance}
              onToggle={() =>
                toggleCategory('attendance')
              }
            >
              {attendanceLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

            {/* ================= EXAMS ================= */}

            <SidebarCategory
              title="Exams"
              icon={
                <AcademicCapIcon className="h-4 w-4" />
              }
              open={openCategories.exams}
              onToggle={() =>
                toggleCategory('exams')
              }
            >
              {examLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

            {/* ================= TIMETABLE ================= */}

            {timetableLinks.length > 0 && (
              <SidebarCategory
                title="Timetable"
                icon={
                  <CalendarDaysIcon className="h-4 w-4" />
                }
                open={openCategories.timetable}
                onToggle={() =>
                  toggleCategory('timetable')
                }
              >
                {timetableLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    {...link}
                    active={isActive(link.href)}
                    onClick={onClose}
                  />
                ))}
              </SidebarCategory>
            )}

            {/* ================= STUDENTS ================= */}

            <SidebarCategory
              title="Students"
              icon={
                <UserGroupIcon className="h-4 w-4" />
              }
              open={openCategories.students}
              onToggle={() =>
                toggleCategory('students')
              }
            >
              {studentLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

            {/* ================= REPORTS ================= */}

            <SidebarCategory
              title="Reports & Insights"
              icon={
                <AcademicCapIcon className="h-4 w-4" />
              }
              open={openCategories.reports}
              onToggle={() =>
                toggleCategory('reports')
              }
            >
              {reportLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

            {/* ================= ADMINISTRATION ================= */}

            <SidebarCategory
              title="Administration"
              icon={
                <ShieldCheckIcon className="h-4 w-4" />
              }
              open={openCategories.administration}
              onToggle={() =>
                toggleCategory('administration')
              }
            >
              {administrationLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

            {/* ================= OTHER TOOLS ================= */}

            <SidebarCategory
              title="Other Tools"
              icon={
                <PencilSquareIcon className="h-4 w-4" />
              }
              open={openCategories.tools}
              onToggle={() =>
                toggleCategory('tools')
              }
            >
              {toolLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  {...link}
                  active={isActive(link.href)}
                  onClick={onClose}
                />
              ))}
            </SidebarCategory>

          </>
        )}

      </nav>

      {/* Footer */}

      <div className="mt-2 shrink-0 rounded-2xl border border-white/10 bg-white/6 p-2.5 shadow-lg">

        <p className="text-[9px] font-bold tracking-[0.18em] text-slate-400 uppercase">
          Signed In As
        </p>

        <p className="mt-1 truncate text-xs font-bold text-white">
          {user.name || 'Guest'}
        </p>

        <p className="truncate text-[11px] text-cyan-200/85">
          {user.email || ''}
        </p>

        <div className="mt-2 h-1 w-full rounded-full bg-white/8">

          <div className="h-1 w-2/3 rounded-full bg-linear-to-r from-cyan-400 via-sky-400 to-emerald-400" />

        </div>

      </div>

      {/* Scrollbar */}

      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }

        nav::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.45);
          border-radius: 9999px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.75);
        }

        nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 9999px;
        }
      `}</style>

    </aside>
  )
}