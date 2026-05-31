//src/app/invigilation/components/InvigilationSidebar.jsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function SidebarLink({ href, label }) {
  const pathname = usePathname()

  const active = pathname === href

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        active ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
    </Link>
  )
}

export default function InvigilationSidebar({ role }) {
  const adminLinks = [
    {
      href: '/invigilation/admin/dashboard',

      label: 'Admin Dashboard',
    },

    {
      href: '/invigilation/admin/rooms',

      label: 'Room Management',
    },

    {
      href: '/invigilation/admin/lecturers',

      label: 'Lecturers',
    },

    {
      href: '/invigilation/admin/exams',

      label: 'Exam Schedule',
    },

    {
      href: '/invigilation/admin/duties',

      label: 'Duty Allocation',
    },

    {
      href: '/invigilation/admin/availability',

      label: 'Lecturer Availability',
    },
    {
      href: '/invigilation/admin/dashboard/duty-load',

      label: 'Duty Load Dashboard',
    },
  ]

  

  const lecturerLinks = [
    {
      href: '/invigilation/lecturer/dashboard',

      label: 'Lecturer Dashboard',
    },

    {
      href: '/invigilation/lecturer/duties',

      label: 'Assigned Duties',
    },

    {
      href: '/invigilation/lecturer/availability',

      label: 'Manage Availability',
    },

    {
      href: '/invigilation/lecturer/summary',

      label: 'Monthly Summary',
    },
  ]

  const links = role === 'admin' ? adminLinks : lecturerLinks

  return (
    <aside className="w-full rounded-xl border bg-white p-4 shadow-sm md:w-64">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-800">Invigilation</h2>

        <p className="text-xs text-slate-500">Management System</p>
      </div>

      <div className="space-y-1">
        {links.map(l => (
          <SidebarLink key={l.href} href={l.href} label={l.label} />
        ))}
      </div>

      <div className="mt-6 border-t pt-3">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-700">Logged in as</p>

          <p className="mt-1 text-sm font-semibold text-blue-700 capitalize">{role}</p>
        </div>

        <p className="mt-4 text-xs text-slate-500">© 2026 OSRA Invigilation</p>
      </div>
    </aside>
  )
}
