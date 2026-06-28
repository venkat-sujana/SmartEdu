//src/components/layout/Sidebar.jsx
'use client'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
      className={`group flex items-center gap-3 rounded-2xl px-3 py-1 text-sm font-medium transition ${
        active
          ? 'bg-white text-slate-950 shadow-lg shadow-slate-950/10'
          : 'text-slate-200/85 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${
          active
            ? 'bg-slate-100 text-slate-900'
            : 'bg-white/8 text-slate-200 group-hover:bg-white/12'
        }`}
      >
        {icon}
      </span>
      <span className="leading-5">{label}</span>
    </Link>
  )
}

export default function Sidebar({ onClose }) {

  const pathname = usePathname()
  const session = useSession()
  const user = session.data?.user || {}
 const role = user.role
const isAdmin = user.role === 'admin'
const isPrincipal = role === 'principal'
const isLecturer = role === 'lecturer'
const isOffice = role === 'office'
  const canAccessAiAttendance = user.role === 'lecturer' || user.role === 'principal'
  const lecturerDashboardUrl = getDashboardRouteForLecturerSubject(user.subject)
  const attendanceFormHref = `${'/attendance-form'}?returnUrl=${encodeURIComponent(lecturerDashboardUrl)}`
  const examsFormHref = `${'/exams-form'}?returnUrl=${encodeURIComponent(lecturerDashboardUrl)}`
  const examsDashboardHref = `${'/exams'}?returnUrl=${encodeURIComponent(lecturerDashboardUrl)}`

  const links = isAdmin
    ? [
        { href: '/', label: 'Home', icon: <HomeIcon className="h-5 w-5 text-emerald-500" /> },
        {
          href: '/admin-panel',
          label: 'Admin Panel',
          icon: <ShieldCheckIcon className="h-5 w-5 text-cyan-500" />,
        },
        {
          href: '/student-table',
          label: 'Student Table',
          icon: <UserGroupIcon className="h-5 w-5 text-violet-500" />,
        },
        {
          href: '/lecturer-registration',
          label: 'Lecturer Registration',
          icon: <AcademicCapIcon className="h-5 w-5 text-amber-500" />,
        },
        {
          href: '/principal-registration',
          label: 'Principal Registration',
          icon: <UserCircleIcon className="h-5 w-5 text-indigo-500" />,
        },
      ]
    : [


        ...(isPrincipal
  ? [
      {
        href: '/timetable',
        label: 'Academic Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/dashboard',
        label: 'Time Table Dashboard',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/lecturer',
        label: 'Lecturer Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/student',
        label: 'Student Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
    ]
  : isOffice
  ? [
      {
        href: '/timetable/dashboard',
        label: 'Time Table Dashboard',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/lecturer',
        label: 'Lecturer Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/student',
        label: 'Student Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
    ]
  : isLecturer
  ? [
      {
        href: '/timetable/dashboard',
        label: 'Time Table Dashboard',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
      {
        href: '/timetable/lecturer',
        label: 'My Time Table',
        icon: <CalendarDaysIcon className="h-5 w-5 text-cyan-500" />,
      },
    ]
  : []),


        {
          href: examsFormHref,
          label: 'Marks Posting',
          icon: <PencilSquareIcon className="h-5 w-5 text-indigo-500" />,
        },
        {
          href: examsDashboardHref,
          label: 'Exam Dashboard',
          icon: <CalendarDaysIcon className="h-5 w-5 text-blue-500" />,
        },
        {
          href: '/attendance-records/monthly-summary',
          label: 'CAR',
          icon: <UserGroupIcon className="h-5 w-5 text-violet-500" />,
        },
        {
          href: '/attendance-records/attendance-calendar',
          label: 'Calendar View',
          icon: <CalendarDaysIcon className="h-5 w-5 text-blue-500" />,
        },
        {
          href: '/attendance-records/individual',
          label: 'Update Attendance',
          icon: <PencilSquareIcon className="h-5 w-5 text-blue-500" />,
        },
        {
          href: '/absentees-table',
          label: "Today's Absentees",
          icon: <XCircleIcon className="h-5 w-5 text-rose-500" />,
        },
        {
          href: attendanceFormHref,
          label: 'Take Attendance',
          icon: <PencilSquareIcon className="h-5 w-5 text-emerald-500" />,
        },
        {
      href: '/invigilation/login',
      label: 'Invigilation',
      icon: <ShieldCheckIcon className="h-4 w-4" />,
      accent: 'text-cyan-600',
    },

        {
  href: '/faculty-monitor',
  label: 'Faculty Monitor',
  icon: <UserGroupIcon className="h-5 w-5 text-cyan-500" />,
},
{
  href: '/notifications',
  label: 'Notifications',
  icon: <CalendarDaysIcon className="h-5 w-5 text-amber-500" />,
},
{
  href: '/sms-center',
  label: 'SMS Center',
  icon: <PencilSquareIcon className="h-5 w-5 text-green-500" />,
},
{
  href: '/principal-tools',
  label: 'Principal Tools',
  icon: <ShieldCheckIcon className="h-5 w-5 text-red-500" />,
},
{
  href: '/ai-reports',
  label: 'AI Reports',
  icon: <AcademicCapIcon className="h-5 w-5 text-purple-500" />,
},
{
  href: '/student-analytics',
  label: 'Student Analytics',
  icon: <UserCircleIcon className="h-5 w-5 text-blue-500" />,
},
{
  href: '/attendance-insights',
  label: 'Attendance Insights',
  icon: <CalendarDaysIcon className="h-5 w-5 text-teal-500" />,
},
{
  href: '/performance-tracker',
  label: 'Performance Tracker',
  icon: <AcademicCapIcon className="h-5 w-5 text-pink-500" />,
},
{
  href: '/parent-communication',
  label: 'Parent Communication',
  icon: <UserGroupIcon className="h-5 w-5 text-orange-500" />,
},
{
  href: '/staff-directory',
  label: 'Staff Directory',
  icon: <UserCircleIcon className="h-5 w-5 text-indigo-500" />,
},
{
  href: '/reports-center',
  label: 'Reports Center',
  icon: <CalendarDaysIcon className="h-5 w-5 text-sky-500" />,
},
{
  href: '/data-export',
  label: 'Data Export',
  icon: <PencilSquareIcon className="h-5 w-5 text-lime-500" />,
},
{
  href: '/audit-log',
  label: 'Audit Log',
  icon: <ShieldCheckIcon className="h-5 w-5 text-rose-500" />,
},
{
  href: '/college-settings',
  label: 'College Settings',
  icon: <UserCircleIcon className="h-5 w-5 text-yellow-500" />,
},
{
  href: '/help-center',
  label: 'Help Center',
  icon: <AcademicCapIcon className="h-5 w-5 text-cyan-400" />,
},


        ...(canAccessAiAttendance
          ? [
              {
                href: '/attendance/ai-chat',
                label: 'AI Attendance Assistant',
                icon: <AcademicCapIcon className="h-5 w-5 text-lime-500" />,
              },
            ]
          : []),
      ]

  return (
    // ✅ overflow-hidden — content aside బయటకి వెళ్ళదు
    <aside className="flex h-screen w-60 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#111827_100%)] px-3 py-4 text-slate-100 shadow-2xl lg:w-64">
      {/* Header — shrink-0 గా fix చేసాను, scroll లో కదలదు */}
      <div className="mb-3 shrink-0 rounded-[28px] border border-white/10 bg-white/6 p-3 shadow-lg shadow-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-2.5 text-cyan-200 ring-1 ring-cyan-300/20">
            <Menu className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              Workspace
            </h3>
            <p className="truncate text-sm font-bold text-white">
              {user.collegeName || (isAdmin ? 'System Admin' : 'Your College')}
            </p>
          </div>
        </div>
      </div>

      <nav
        className="flex-1 overflow-x-hidden gap-1 overflow-y-auto pr-1"
        style={{
          maxHeight: 'calc(100vh - 220px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >

        
        {links.map(link => {
          const activeHref = link.href.split('?')[0]
          const active =
            activeHref === '/' ? pathname === activeHref : pathname?.startsWith(activeHref)

          return (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={Boolean(active)}
              onClick={onClose}
            />
          )
        })}
      </nav>

      {/* Footer — shrink-0 గా fix చేసాను, scroll లో కదలదు */}
      <div className="mt-3 shrink-0 rounded-[28px] border border-white/10 bg-white/6 p-3 shadow-lg shadow-slate-950/20">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          Signed In As
        </p>
        <p className="mt-1.5 truncate text-sm font-bold text-white">{user.name || 'Guest'}</p>
        <p className="truncate text-xs text-cyan-200/85">{user.email || ''}</p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-white/8">
          <div className="h-1.5 w-2/3 rounded-full bg-linear-to-r from-cyan-400 via-sky-400 to-emerald-400" />
        </div>
      </div>

      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 8px;
        }

        nav::-webkit-scrollbar-thumb {
          background: rgba(34, 211, 238, 0.5);
          border-radius: 9999px;
        }

        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 211, 238, 0.8);
        }

        nav::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 9999px;
        }
      `}</style>
    </aside>
  )
}
