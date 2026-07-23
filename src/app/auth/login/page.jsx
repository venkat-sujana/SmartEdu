//src/app/auth/login
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, School, ShieldCheck, Users,Briefcase} from "lucide-react";
import DashboardFooter from "@/components/layout/Footer";
const collegeName = "College";

const LOGIN_OPTIONS = [
  {
    value: "admin",
    title: "Admin",
    desc: "Full CRUD access across the entire platform.",
    link: "/admin/login",
    color: "cyan",
    Icon: ShieldCheck,
  },
  {
    value: "lecturer",
    title: "Lecturer",
    desc: "Manage attendance and exams.",
    link: "/lecturer/login",
    color: "green",
    Icon: ClipboardList,
  },
  {
    value: "principal",
    title: "Principal",
    desc: "Monitor academics and performance.",
    link: "/principal/login",
    color: "purple",
    Icon: School,
  },
  {
    value: "office",
    title: "Office Staff",
    desc: "Monitor attendance, student records and office operations.",
    link: "/office/login",
    color: "orange",
    Icon: Briefcase,
  },
  {
    value: "student",
    title: "Student",
    desc: "Access courses, attendance, and results.",
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
            <h1 className="text-4xl font-bold text-blue-900 drop-shadow-sm md:text-5xl">
              Welcome to SmartCollege Portal
            </h1>
            
          </motion.div>
        </section>

        <section className="w-full py-2">
          <h3 className="mb-8 text-center text-3xl font-bold text-blue-800 drop-shadow-sm">
            Login as
          </h3>

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
    blue: "from-blue-50/80 to-sky-50/90 hover:from-blue-100/90 hover:to-sky-100",
    green: "from-emerald-50/80 to-green-50/90 hover:from-emerald-100/90 hover:to-green-100",
    purple: "from-violet-50/80 to-fuchsia-50/90 hover:from-violet-100/90 hover:to-fuchsia-100",
    cyan: "from-cyan-50/80 to-teal-50/90 hover:from-cyan-100/50 hover:to-teal-100",
    orange:"from-orange-50/80 to-amber-50/90 hover:from-orange-100/90 hover:to-amber-100",
    
  }[activeOption.color];

  const btn = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
    orange: "bg-orange-600 hover:bg-orange-700",
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
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`rounded-2xl border border-white/60 bg-linear-to-br p-8 shadow-xl backdrop-blur-md ${bg}`}
    >
      <ActiveIcon className={`mx-auto h-10 w-10 ${iconColor}`} />
      <h4 className="mb-2 mt-4 text-center text-xl font-semibold text-gray-900">
        {activeOption.title}
      </h4>
      <p className="mb-5 text-center text-gray-700">{activeOption.desc}</p>

      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Choose Login Role
        </label>
        <select
          value={selectedRole}
          onChange={event => onChangeRole(event.target.value)}
          className="w-full rounded-xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition focus:border-slate-400"
        >
          {LOGIN_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center">
        <Link
          href={activeOption.link}
          className={`inline-block rounded-xl px-6 py-3 font-medium text-white shadow-lg transition hover:shadow-xl ${btn}`}
        >
          Continue as {activeOption.title}
        </Link>
      </div>
    </motion.div>
  );
}
