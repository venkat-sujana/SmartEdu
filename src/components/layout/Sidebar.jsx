// src/components/layout/Sidebar.jsx
"use client"
import Link from "next/link"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  HomeIcon,
  UserGroupIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid"

export default function Sidebar({ onClose }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user || {}

  const links = [
    { href: "/", label: "Home", icon: <HomeIcon className="h-5 w-5" /> },
    { href: "/timetable-management/login", label: "Time Table Management", icon: <PencilSquareIcon className="w-5 h-5 text-blue-500" /> },
    { href: "/timetable", label: "Academic Time Table", icon: <CalendarDaysIcon className="w-5 h-5 text-cyan-500" /> },
    { href: "/register", label: "Add Student", icon: <AcademicCapIcon className="w-5 h-5 text-red-500 font-bold" /> },
    // { href: "/principal/dashboard", label: "Principal Dashboard", icon: <BuildingOffice2Icon className="w-5 h-5 text-amber-500" /> },
    { href: "/attendance-dashboard", label: "Attendance", icon: <UserCircleIcon className="w-5 h-5 text-yellow-500" /> },
    { href: "/exams-form", label: "Marks Posting ", icon: <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-500" /> },
    { href: "/exam-report", label: "CMR", icon: <PencilSquareIcon className="w-5 h-5 text-violet-500" /> },
    { href: "/attendance-records/monthly-summary", label: "CAR", icon: <UserGroupIcon className="w-5 h-5 text-purple-500" /> },
    { href: "/student-table", label: "Students", icon: <UserGroupIcon className="w-5 h-5 text-green-500" /> },
    { href: "/attendance-records/attendance-calendar", label: "Calendar View ", icon: <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> },
    { href: "/attendance-records/individual", label: "Update Attendance ", icon: <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> },
    { href: "/absentees-table", label: "Today's Absentees ", icon: <XCircleIcon className="w-5 h-5 text-red-500" /> },
    { href: "/components/attendance-shortage-summary", label: "Attendance Shortage ", icon: <CalendarDaysIcon className="w-5 h-5 text-blue-500" /> },
    { href: "/attendance-form", label: "Take Attendance ", icon: <PencilSquareIcon className="w-5 h-5 text-blue-500" /> },
  ]

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-slate-700/50 bg-linear-to-b from-slate-900 via-slate-900 to-slate-800 px-3 py-4 text-slate-100 shadow-2xl lg:w-60">
      <div className="mb-4 rounded-2xl border border-slate-700/80 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-300 ring-1 ring-cyan-300/30">
            <Menu className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Dashboard
            </h3>
            <p className="truncate text-sm font-bold text-slate-100">
              {user.collegeName || "Your College"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition ${
                active
                  ? "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/40"
                  : "text-slate-200/85 hover:bg-white/8 hover:text-white"
              }`}
              onClick={onClose}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  active ? "bg-cyan-300/20" : "bg-white/8 group-hover:bg-white/15"
                }`}
              >
                {l.icon}
              </span>
              <span className="leading-5">{l.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-white/5 p-3">
        <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Signed in as</p>
        <p className="truncate text-sm font-bold text-slate-100">{user.name || "Guest"}</p>
        <p className="truncate text-xs text-cyan-200/90">{user.email || ""}</p>
        <div className="mt-2 h-1 w-full rounded-full bg-linear-to-r from-cyan-400/70 to-emerald-400/70" />
      </div>

      <style jsx>{`
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.35);
          border-radius: 9999px;
        }
        nav::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </aside>
  )
}
