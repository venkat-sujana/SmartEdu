"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  UserPlusIcon,
  AcademicCapIcon,
  ArrowUpOnSquareStackIcon,
} from "@heroicons/react/24/solid";

const defaultLinks = [
  {
    label: "Attendance Dashboard",
    href: "/attendance-dashboard",
    icon: ChartBarIcon,
    color: "from-blue-500 to-cyan-400",
  },
  {
    label: "Edit Records",
    href: "/attendance-records/individual",
    icon: PencilSquareIcon,
    color: "from-emerald-500 to-teal-400",
  },
  {
    label: "Central Attendance Register",
    href: "/attendance-records/monthly-summary",
    icon: ClipboardDocumentListIcon,
    color: "from-pink-500 to-purple-400",
  },
  {
    label: "Take Attendance",
    href: "/attendance-form",
    icon: ClipboardDocumentCheckIcon,
    color: "from-blue-500 to-cyan-400",
  },
  {
    label: "Calendar View",
    href: "/attendance-records/attendance-calendar",
    icon: CalendarDaysIcon,
    color: "from-indigo-500 to-sky-400",
  },
  {
    label: "Central Marks Register",
    href: "/exam-report",
    icon: AcademicCapIcon,
    color: "from-violet-500 to-fuchsia-400",
  },
  {
    label: "View Students",
    href: "/student-table",
    icon: UsersIcon,
    color: "from-blue-500 to-cyan-400",
  },
  {
    label: "Add Student",
    href: "/register",
    icon: UserPlusIcon,
    color: "from-emerald-500 to-lime-400",
  },
  {
    label: "Add Exam",
    href: "/exams-form",
    icon: AcademicCapIcon,
    color: "from-orange-500 to-amber-400",
  },
  {
    label: "Bulk Upload Students",
    href: "/students/bulk-upload",
    icon: ArrowUpOnSquareStackIcon,
    color: "from-slate-600 to-slate-500",
  },
  {
    label: "Lecturer Dashboard",
    href: "/lecturer/dashboard",
    icon: ChartBarIcon,
    color: "from-violet-500 to-fuchsia-400",
  },
];

export default function MainLinks({ links = defaultLinks }) {
  const pathname = usePathname();

  return (
    <div className="my-6 flex flex-wrap justify-center gap-3">
      {links.map(({ label, href, icon: Icon, color }) => {
        const active = pathname === href;

        return (
          <Link key={href} href={href}>
            <button
              className={[
                "flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-6 py-2 text-xs md:text-sm font-semibold shadow-md transition transform sm:w-auto",
                active
                  ? "scale-105 ring-2 ring-offset-2 ring-blue-500"
                  : "hover:scale-105",
                `bg-gradient-to-r ${color} text-white`,
              ].join(" ")}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Icon className="h-4 w-4" />
              </span>
              <span className="whitespace-nowrap">{label}</span>
            </button>
          </Link>
        );
      })}
    </div>
  );
}
