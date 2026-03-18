"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, School, ShieldCheck, Users } from "lucide-react";
import DashboardFooter from "@/components/layout/Footer";

const collegeName = "College";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-sky-50 via-indigo-50 to-blue-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute left-24 top-40 hidden h-24 w-24 rounded-full border-2 border-cyan-600 bg-cyan-400/60 md:block"
          animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-24 top-64 hidden h-20 w-20 rounded-full border-2 border-indigo-600 bg-indigo-400/60 md:block"
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-6 md:pt-16">
        <section className="pb-6 pt-6 md:pt-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl px-6 text-center"
          >
            <h1 className="text-4xl font-bold text-blue-900 drop-shadow-sm md:text-5xl">
              Welcome to SmartCollege Portal
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-700">
              Manage students, lecturers, principals, and administration in one connected platform.
            </p>
          </motion.div>
        </section>

        <section className="w-full py-12">
          <h3 className="mb-8 text-center text-3xl font-bold text-blue-800 drop-shadow-sm">Login as</h3>

          <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2 xl:grid-cols-4">
            <LoginCard
              icon={<ShieldCheck className="mx-auto h-10 w-10 text-cyan-700" />}
              title="Admin"
              desc="Full CRUD access across the entire platform."
              link="/admin/login"
              color="cyan"
            />
            <LoginCard
              icon={<ClipboardList className="mx-auto h-10 w-10 text-green-600" />}
              title="Lecturer"
              desc="Manage attendance and exams."
              link="/lecturer/login"
              color="green"
            />
            <LoginCard
              icon={<School className="mx-auto h-10 w-10 text-purple-600" />}
              title="Principal"
              desc="Monitor academics and performance."
              link="/principal/login"
              color="purple"
            />
            <LoginCard
              icon={<Users className="mx-auto h-10 w-10 text-blue-600" />}
              title="Student"
              desc="Access courses, attendance, and results."
              link="/student/login"
              color="blue"
            />
          </div>
        </section>

        <DashboardFooter
          collegeName={collegeName}
          facebookUrl="https://facebook.com/yourcollege"
          instagramUrl="https://instagram.com/yourcollege"
          twitterUrl="https://x.com/yourcollege"
          youtubeUrl="https://youtube.com/@yourcollege"
        />
      </div>
    </div>
  );
}

function LoginCard({ icon, title, desc, link, color }) {
  const bg = {
    blue: "from-blue-50/80 to-sky-50/90 hover:from-blue-100/90 hover:to-sky-100",
    green: "from-emerald-50/80 to-green-50/90 hover:from-emerald-100/90 hover:to-green-100",
    purple: "from-violet-50/80 to-fuchsia-50/90 hover:from-violet-100/90 hover:to-fuchsia-100",
    cyan: "from-cyan-50/80 to-teal-50/90 hover:from-cyan-100/90 hover:to-teal-100",
  }[color];

  const btn = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    cyan: "bg-cyan-600 hover:bg-cyan-700",
  }[color];

  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`rounded-2xl border border-white/60 bg-linear-to-br p-8 shadow-xl backdrop-blur-md ${bg}`}
    >
      {icon}
      <h4 className="mb-2 mt-4 text-center text-xl font-semibold text-gray-900">{title}</h4>
      <p className="mb-4 text-center text-gray-700">{desc}</p>

      <div className="flex justify-center">
        <Link
          href={link}
          className={`inline-block rounded-xl px-6 py-3 font-medium text-white shadow-lg transition hover:shadow-xl ${btn}`}
        >
          {title} Login
        </Link>
      </div>
    </motion.div>
  );
}
