//src/app/auth/login
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import DashboardFooter from "@/components/layout/Footer";
const collegeName = "College";

const LOGIN_OPTIONS = [
  {
    value: "admin",
    title: "Admin",
    desc: "Full CRUD access across the entire platform.",
    short: "Platform control",
    link: "/admin/login",
    color: "cyan",
    Icon: ShieldCheck,
  },
  {
    value: "lecturer",
    title: "Lecturer",
    desc: "Manage attendance and exams.",
    short: "Teaching workflow",
    link: "/lecturer/login",
    color: "green",
    Icon: ClipboardList,
  },
  {
    value: "principal",
    title: "Principal",
    desc: "Monitor academics and performance.",
    short: "Academic oversight",
    link: "/principal/login",
    color: "purple",
    Icon: School,
  },
  {
    value: "office",
    title: "Office Staff",
    desc: "Monitor attendance, student records and office operations.",
    short: "Office operations",
    link: "/office/login",
    color: "orange",
    Icon: Briefcase,
  },
  {
    value: "student",
    title: "Student",
    desc: "Access courses, attendance, and results.",
    short: "Student access",
    link: "/student/login",
    color: "blue",
    Icon: Users,
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(LOGIN_OPTIONS[0].value);
  const activeOption = useMemo(
    () => LOGIN_OPTIONS.find(option => option.value === selectedRole) || LOGIN_OPTIONS[0],
    [selectedRole]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-sky-50 via-indigo-50 to-blue-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(255,255,255,0.15)_35%,transparent_60%)]" />
        <motion.div
          className="absolute top-40 left-24 hidden h-24 w-24 rounded-full border-2 border-cyan-600 bg-cyan-400/60 md:block"
          animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-64 right-24 hidden h-20 w-20 rounded-full border-2 border-indigo-600 bg-indigo-400/60 md:block"
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-6 md:pt-16">
        <section className="pt-6 pb-6 md:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-blue-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Unified Login
            </div>
            <h1 className="text-4xl font-bold text-blue-900 drop-shadow-sm md:text-5xl">
              Welcome to SmartCollege Portal
            </h1>
            
          </motion.div>
        </section>

        <section className="w-full py-2 pb-10">
          <div className="mx-auto max-w-xl px-6">
            <LoginSelectorCard
              activeOption={activeOption}
              selectedRole={selectedRole}
              onChangeRole={setSelectedRole}
            />
          </div>
        </section>

        {/* <DashboardFooter
          collegeName={collegeName}
          facebookUrl="https://facebook.com/yourcollege"
          instagramUrl="https://instagram.com/yourcollege"
          twitterUrl="https://x.com/yourcollege"
          youtubeUrl="https://youtube.com/@yourcollege"
        /> */}
      </div>
    </div>
  )
}

function LoginSelectorCard({ activeOption, selectedRole, onChangeRole }) {
  const bg = {
    blue: "from-blue-50/95 via-white to-sky-100/80",
    green: "from-emerald-50/95 via-white to-green-100/80",
    purple: "from-violet-50/95 via-white to-fuchsia-100/80",
    cyan: "from-cyan-50/95 via-white to-teal-100/80",
    orange: "from-orange-50/95 via-white to-amber-100/80",
  }[activeOption.color];

  const btn = {
    blue: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-300",
    green: "bg-green-600 hover:bg-green-700 focus-visible:ring-green-300",
    purple: "bg-purple-600 hover:bg-purple-700 focus-visible:ring-purple-300",
    cyan: "bg-cyan-600 hover:bg-cyan-700 focus-visible:ring-cyan-300",
    orange: "bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-300",
  }[activeOption.color];

  const iconColor = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    cyan: "text-cyan-700",
    orange: "text-orange-600",
  }[activeOption.color];

  const ActiveIcon = activeOption.Icon;

  return (
    <motion.div
      whileHover={{ scale: 1.015, y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`relative overflow-hidden rounded-[28px] border border-white/70 bg-linear-to-br p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-6 ${bg}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-white/75 to-transparent" />

      <div className="relative">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/70 bg-white/85 shadow-sm">
          <ActiveIcon className={`h-7 w-7 ${iconColor}`} />
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Login Workspace
          </p>
          <h4 className="mt-1.5 text-xl font-black text-slate-900 sm:text-2xl">{activeOption.title}</h4>
          <p className="mt-1.5 text-sm font-medium text-slate-500">{activeOption.short}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {activeOption.desc}
          </p>
        </div>

        <div className="mt-5 rounded-3xl border border-white/80 bg-white/75 p-3.5 shadow-sm backdrop-blur-sm sm:p-4">
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-700">Choose Login Role</label>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedRole}
              onChange={event => onChangeRole(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 pr-11 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
            >
              {LOGIN_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

        </div>

        <div className="mt-5 flex justify-center">
          <Link
            href={activeOption.link}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg ring-4 ring-white/40 transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 ${btn}`}
          >
            Continue as {activeOption.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
