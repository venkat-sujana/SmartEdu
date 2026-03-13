// app/auth/login/page.jsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, School, Users } from "lucide-react";
import DashboardFooter from "@/components/layout/Footer";

const collegeName = "College";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-sky-50 via-indigo-50 to-blue-100 text-slate-900">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="hidden md:block absolute top-80 left-80 h-20 w-20 rounded-full border-2 border-indigo-600 bg-indigo-400/70"
          animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hidden md:block absolute top-[200px] left-[50%] h-20 w-20 -translate-x-1/2 rounded-full border-2 border-cyan-600 bg-cyan-400/70"
          animate={{ x: [0, -30, 20, 0], y: [0, 25, -20, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hidden md:block absolute right-80 bottom-80 h-20 w-20 -translate-y-1/2 rounded-full border-2 border-violet-600 bg-violet-400/70"
          animate={{ x: [0, 25, -25, 0], y: [0, -30, 15, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
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
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-700">
              Manage students, lecturers, and principals in one connected platform.
            </p>
          </motion.div>
        </section>

        <div className="mt-6 w-full max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-2xl border border-white/50 bg-white/75 p-6 shadow-xl shadow-indigo-100/60 backdrop-blur-md"
          >
            <h3 className="text-xl font-bold text-indigo-900">
              Generate Vocational Question Papers Instantly
            </h3>
            <p className="mt-2 text-gray-800">
              Create professional <strong>vocational question papers</strong> for Intermediate
              vocational exams in just a few clicks.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="https://advanced-question-paper-tailwindcss.netlify.app/"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
              >
                M&amp;AT QP Generator &rarr;
              </Link>
              <Link
                href="https://skr-learn-portal.netlify.app/"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
              >
                Voc QP Generator &rarr;
              </Link>
              <Link
                href="https://portfolio-app-mu.vercel.app/"
                className="rounded-xl bg-indigo-600 px-8 py-2 font-semibold text-white shadow-md transition hover:bg-indigo-700 hover:shadow-lg"
              >
                My Portfolio-App &rarr;
              </Link>
            </div>
          </motion.div>
        </div>

        <section className="w-full py-12">
          <h3 className="mb-8 text-center text-3xl font-bold text-blue-800 drop-shadow-sm">Login as</h3>

          <div className="mx-auto grid max-w-5xl gap-8 px-6 md:grid-cols-3">
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
  }[color];

  const btn = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  }[color];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`rounded-2xl border border-white/60 bg-linear-to-br p-8 shadow-xl backdrop-blur-md ${bg}`}
    >
      {icon}
      <h4 className="mt-4 mb-2 text-center text-xl font-semibold text-gray-900">{title}</h4>
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
