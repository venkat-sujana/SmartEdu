
"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  LogOut,
  GraduationCap,
  House,
  ShieldCheck,
  Table2,
  CircleHelp,
  CircleUserRound,
  ShieldEllipsis,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar({ onOpenDrawer }) {
  const { data: session } = useSession();
  const user = session?.user || null;

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-40 border-b border-cyan-200 bg-linear-to-r from-cyan-50 via-sky-50 to-blue-100/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-3 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open menu"
            className="rounded-md p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-white font-bold">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-300">
                {user?.collegeName || "Your College"}
              </div>
            </div>
          </Link>
        </div>

        {user && (
          <>
            <div className="hidden items-center gap-4 md:flex">
              <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Link
                  href="/"
                  className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <House className="h-4 w-4 text-emerald-500" />
                  Home
                </Link>
                <Link
                  href="/invigilation/login"
                  className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <ShieldCheck className="h-4 w-4 text-cyan-600" />
                  Invigilation
                </Link>
                <Link
                  href="/timetable-management/login"
                  className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <Table2 className="h-4 w-4 text-indigo-600" />
                  Time Table
                </Link>
                <Link
                  href="/components/about"
                  className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <CircleHelp className="h-4 w-4 text-violet-600" />
                  About
                </Link>
                <Link
                  href="/attendance/ai-chat"
                  className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                >
                  <GraduationCap className="h-4 w-4 text-emerald-600" />
                  AI Chat
                </Link>
                {user?.role === "admin" && (
                  <Link
                    href="/admin-panel"
                    className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-100"
                  >
                    <ShieldEllipsis className="h-4 w-4 text-rose-600" />
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>
          </>
        )}

        {!user ? (
          <Link
            href="/auth/login"
            className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col text-right sm:flex">
              <span className="text-sm font-bold text-blue-800 dark:text-blue-500">{user.name}</span>
              <span className="text-xs font-bold text-blue-500 dark:text-blue-500">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-md px-2 py-1 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 sm:inline-flex"
              >
                <CircleUserRound className="h-5 w-5" />
                Profile
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex cursor-pointer items-center gap-2 rounded-md bg-red-50 px-3 py-1 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-transparent dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}


