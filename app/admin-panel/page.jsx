"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  LayoutDashboard,
  School,
  ShieldCheck,
  Table2,
  UserCheck,
  UsersRound,
} from "lucide-react";

const sections = [
  {
    title: "Core Operations",
    links: [
      { href: "/register", label: "Student Registration", icon: UserCheck },
      { href: "/student-table", label: "Student Table", icon: UsersRound },
      { href: "/attendance-form", label: "Take Attendance", icon: ClipboardList },
      { href: "/exam-report", label: "Exam Reports", icon: BookOpenCheck },
    ],
  },
  {
    title: "Management Modules",
    links: [
      { href: "/principal/dashboard", label: "Principal Dashboard", icon: LayoutDashboard },
      { href: "/timetable-management/login", label: "Timetable Management", icon: Table2 },
      { href: "/invigilation/login", label: "Invigilation Module", icon: ShieldCheck },
      { href: "/timetable", label: "Academic Timetable", icon: CalendarClock },
    ],
  },
  {
    title: "Monitoring & Analytics",
    links: [
      { href: "/attendance-dashboard", label: "Attendance Dashboard", icon: ClipboardList },
      { href: "/attendance-records/monthly-summary", label: "Monthly Summary", icon: CalendarClock },
      { href: "/dashboard", label: "Institution Dashboard", icon: LayoutDashboard },
      { href: "/components/attendance-shortage-summary", label: "Attendance Shortage", icon: BookOpenCheck },
    ],
  },
];

export default function AdminPanelPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-100 via-cyan-50 to-indigo-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-xl border border-cyan-100 bg-linear-to-r from-white via-cyan-50 to-blue-50 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Control Center</p>
              <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-600">
                {user?.collegeName || "College"} | {user?.name || "Principal"}
              </p>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm"
            >
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.links.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 transition hover:border-cyan-200 hover:bg-cyan-50"
                    >
                      <Icon className="h-4 w-4 text-cyan-700" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
