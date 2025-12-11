
//app/components/Sidebar.jsx
"use client"
import { useState } from "react"
import Link from "next/link"
import { Home, Users, Calendar, BarChart, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Sidebar({ onClose }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user || {}

  const links = [
    { href: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { href: "/lecturer/dashboard", label: "Lecturer Dashboard", icon: <Users className="w-5 h-5" /> },
    { href: "/principal/dashboard", label: "Principal Dashboard", icon: <BarChart className="w-5 h-5" /> },
    { href: "/attendance", label: "Attendance", icon: <Calendar className="w-5 h-5" /> },
  ]

  return (
    <aside className="h-full w-64 shrink-0 bg-white/90 dark:bg-slate-800/95 border-r border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="rounded-lg bg-blue-600 p-2 text-white">
          <Menu className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">OSRA</h3>
          <p className="text-sm text-slate-500 dark:text-slate-300">{user.collegeName || "Your College"}</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-1">
        {links.map((l) => {
          const active = pathname === l.href
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                active ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200"
              }`}
              onClick={onClose}
            >
              {l.icon}
              <span>{l.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto px-2 py-4">
        <div className="rounded-md border border-gray-100 bg-gradient-to-r from-indigo-50 to-white p-3">
          <p className="text-xs text-gray-600">Signed in as</p>
          <p className="text-sm font-medium text-gray-800">{user.name || "Guest"}</p>
          <p className="text-xs text-gray-500">{user.email || ""}</p>
        </div>
      </div>
    </aside>
  )
}
