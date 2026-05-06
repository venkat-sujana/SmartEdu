"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  CircleHelp,
  CircleUserRound,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Table2,
} from "lucide-react";
import { motion } from "framer-motion";

function NavLink({ href, icon, label, active = false, accent = "text-slate-500" }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-slate-950 text-white shadow-lg shadow-slate-200"
          : "text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      <span
        className={`rounded-xl p-1.5 transition ${
          active ? "bg-white/12 text-white" : `bg-slate-100 ${accent} group-hover:bg-slate-200`
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default function Navbar({ onOpenDrawer }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user || null;
  const canAccessAiAttendance =
    user?.role === "lecturer" || user?.role === "principal";

  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: <Home className="h-4 w-4" />,
      accent: "text-emerald-600",
    },
    {
      href: "/invigilation/login",
      label: "Invigilation",
      icon: <ShieldCheck className="h-4 w-4" />,
      accent: "text-cyan-600",
    },
    {
      href: "/timetable-management/login",
      label: "Time Table",
      icon: <Table2 className="h-4 w-4" />,
      accent: "text-indigo-600",
    },
    {
      href: "/about",
      label: "About",
      icon: <CircleHelp className="h-4 w-4" />,
      accent: "text-violet-600",
    },
  ];

  if (canAccessAiAttendance) {
    navItems.push({
      href: "/attendance/ai-chat",
      label: "AI Chat",
      icon: <Sparkles className="h-4 w-4" />,
      accent: "text-emerald-600",
    });
  }

  if (user?.role === "admin") {
    navItems.push({
      href: "/admin-panel",
      label: "Admin Panel",
      icon: <ShieldEllipsis className="h-4 w-4" />,
      accent: "text-rose-600",
    });
  }

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-40 border-b border-white/50 bg-white/75 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open menu"
            className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-500 via-sky-500 to-emerald-500 text-white shadow-lg shadow-cyan-200/70">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                OSRA Workspace
              </p>
              <p className="max-w-[220px] truncate text-sm font-bold text-slate-900">
                {user?.collegeName || "Your College"}
              </p>
            </div>
          </Link>
        </div>

        {user && (
          <nav className="hidden items-center gap-2 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-2 shadow-inner shadow-white/80 lg:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={Boolean(isActive)}
                  accent={item.accent}
                />
              );
            })}
          </nav>
        )}

        {!user ? (
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-200/70 transition hover:from-cyan-500 hover:to-sky-500"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-3 rounded-[24px] border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <CircleUserRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="max-w-[180px] truncate text-sm font-bold text-slate-900">
                  {user.name}
                </p>
                <p className="max-w-[220px] truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
            >
              <CircleUserRound className="h-4 w-4" />
              Profile
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}
