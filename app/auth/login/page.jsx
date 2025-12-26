"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Users, ClipboardList, School } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
  {/* DEBUG BLOB 1 – top-left */}
  <motion.div
    className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-indigo-400/70 border-2 border-indigo-600"
    animate={{
      x: [0, 40, -20, 0],
      y: [0, -20, 30, 0],
    }}
    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
  />

  {/* DEBUG BLOB 2 – bottom-right */}
  <motion.div
    className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-cyan-400/70 border-2 border-cyan-600"
    animate={{
      x: [0, -30, 20, 0],
      y: [0, 25, -20, 0],
    }}
    transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
  />

  {/* DEBUG BLOB 3 – center-ish */}
  <motion.div
    className="absolute top-1/2 left-1/3 h-72 w-72 -translate-y-1/2 rounded-full bg-violet-400/70 border-2 border-violet-600"
    animate={{
      x: [0, 25, -25, 0],
      y: [0, -30, 15, 0],
    }}
    transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
  />
</div>


      {/* ================= CONTENT ================= */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start pt-6 md:pt-16">
        {/* HERO */}
        <section className="pt-6 md:pt-12 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto px-6 text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 drop-shadow-sm">
              Welcome to SmartCollege Portal
            </h1>
            <p className="mt-3 text-gray-700 text-lg max-w-2xl mx-auto">
              Manage Students, Lecturers, and Principals in one connected platform.
            </p>
          </motion.div>
        </section>

        {/* CTA CARD */}
        <div className="mt-6 w-full max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-2xl border border-white/50 bg-white/75 backdrop-blur-md p-6 shadow-xl shadow-indigo-100/60"
          >
            <h3 className="text-xl font-bold text-indigo-900">
              Generate Vocational Question Papers Instantly
            </h3>
            <p className="mt-2 text-gray-800">
              Create professional <strong>Vocational question papers</strong> for Intermediate
              Vocational exams in just a few clicks.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="https://advanced-question-paper-tailwindcss.netlify.app/"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              >
                Go to M&AT QP Generator →
              </Link>
              <Link
                href="https://skr-learn-portal.netlify.app/"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              >
                Go to Voc QP Generator →
              </Link>
              <Link
                href="https://portfolio-app-mu.vercel.app/"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
              >
                Go to Portfolio-App →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* LOGIN CARDS */}
        <section className="py-12 w-full">
          <h3 className="text-3xl font-bold text-blue-800 mb-8 text-center drop-shadow-sm">
            Login as
          </h3>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
            <LoginCard
              icon={<ClipboardList className="w-10 h-10 text-green-600 mx-auto" />}
              title="Lecturer"
              desc="Manage attendance and exams."
              link="/lecturer/login"
              color="green"
            />
            <LoginCard
              icon={<School className="w-10 h-10 text-purple-600 mx-auto" />}
              title="Principal"
              desc="Monitor academics and performance."
              link="/principal/login"
              color="purple"
            />
            <LoginCard
              icon={<Users className="w-10 h-10 text-blue-600 mx-auto" />}
              title="Student"
              desc="Access courses, attendance, and results."
              link="/student/login"
              color="blue"
            />
          </div>
        </section>
      </div>
    </div>
  )
}

/* ================= LOGIN CARD ================= */

function LoginCard({ icon, title, desc, link, color }) {
  const bg = {
    blue: "from-blue-50/80 to-sky-50/90 hover:from-blue-100/90 hover:to-sky-100",
    green: "from-emerald-50/80 to-green-50/90 hover:from-emerald-100/90 hover:to-green-100",
    purple: "from-violet-50/80 to-fuchsia-50/90 hover:from-violet-100/90 hover:to-fuchsia-100",
  }[color]

  const btn = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  }[color]

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`p-8 rounded-2xl bg-gradient-to-br ${bg} border border-white/60 shadow-xl backdrop-blur-md`}
    >
      {icon}
      <h4 className="text-xl font-semibold mt-4 mb-2 text-gray-900 text-center">
        {title}
      </h4>
      <p className="text-gray-700 mb-4 text-center">{desc}</p>

      <div className="flex justify-center">
        <Link
          href={link}
          className={`inline-block text-white ${btn} px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition`}
        >
          {title} Login →
        </Link>
      </div>
    </motion.div>
  )
}
