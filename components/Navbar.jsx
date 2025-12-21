
//app/components/Navbar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, LogOut, User } from "lucide-react";
import { AcademicCapIcon, EnvelopeIcon, UserCircleIcon,HomeIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";

export default function Navbar({ onOpenDrawer }) {
  const { data: session, status } = useSession();

  const user = session?.user;

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200 dark:bg-slate-900/80 dark:border-slate-700">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4 px-3 py-3">

        {/* left: hamburger on mobile + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open menu"
            className="md:hidden rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-100 text-white font-bold"><AcademicCapIcon className="w-5 h-5 text-emerald-500" /></div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100"></div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-300">{user?.collegeName || "Your College"}</div>
            </div>
          </Link>
        </div>

        {/* center (optional) */}
        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/" className=" flex px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><HomeIcon className="w-5 h-5 font-bold text-emerald-500" />Home</Link>
            </nav>
        </div>


        <div className="hidden md:flex items-center gap-4">
          <nav className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/components/about" className=" flex px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">ℹ️About</Link>
            </nav>
        </div>



        {/* right: user + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-blue-800 dark:text-blue-500">{user?.name || "Guest"}</span>
            <span className="text-xs font-bold text-blue-500 dark:text-blue-500">{user?.email || ""}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/profile" className="hidden sm:inline-flex font-bold items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
              <UserCircleIcon className="w-5 h-5" />
              Profile
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex font-bold items-center gap-2 rounded-md bg-red-50 text-red-600 px-3 py-1 text-sm hover:bg-red-100 dark:bg-transparent dark:hover:bg-slate-800 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
