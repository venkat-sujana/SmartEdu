//app/page.js
'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

import { motion } from 'framer-motion'
import {
  Users,
  ClipboardList,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react'

import DashboardFooter from '@/components/layout/Footer'

export default function Page() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900" />
    )
  }

  return (
    <main className="min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* Background Blur Effects */}
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 py-24 md:grid-cols-2">
          {/* LEFT CONTENT */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="rounded-full border border-indigo-400/40 bg-white/10 px-4 py-2 text-sm backdrop-blur-md">
                Smart Multi-College Management Platform
              </span>

              <h1 className="mt-6 text-5xl font-black leading-tight md:text-7xl">
                OSRA
                <span className="block bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  Student Analytics System
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Manage students, attendance, examinations and analytics across
                multiple colleges with a powerful modern platform designed for
                lecturers and principals.
              </p>

              {/* Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/auth/login"
                  className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 px-8 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-indigo-500/40"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#features"
                  className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-medium backdrop-blur-md transition hover:bg-white/20"
                >
                  Explore Features
                </Link>

                <a
                  href="https://skr-learn-portal.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-2xl bg-white px-8 py-4 font-semibold text-slate-900 transition hover:scale-105"
                >
                  Visit Portal
                </a>
              </div>
            </motion.div>
          </div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[32px] bg-gradient-to-r from-indigo-500 to-sky-500 blur-2xl opacity-30" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
              <Image
                src="/images/students-1.jpg"
                alt="OSRA Student Management"
                width={700}
                height={500}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-4 text-sm uppercase tracking-[4px] text-sky-400">
              Core Modules
            </p>

            <h2 className="text-4xl font-bold md:text-5xl">
              Everything Your College Needs
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-slate-300">
              Modern tools to simplify academic management, student tracking,
              attendance and examination analytics.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            <Feature
              icon={<Users size={34} />}
              title="Students"
              desc="Manage student records, profiles and academic information efficiently."
            />

            <Feature
              icon={<ClipboardList size={34} />}
              title="Exams"
              desc="Conduct and analyze examinations with smart reporting tools."
            />

            <Feature
              icon={<CalendarCheck size={34} />}
              title="Attendance"
              desc="Track daily and monthly attendance with advanced analytics."
            />
          </div>

          {/* Showcase Image */}
          <div className="relative mt-20 overflow-hidden rounded-[32px] border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-black/20" />

            <Image
              src="/images/college.jpg"
              alt="College Management"
              width={1200}
              height={600}
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 rounded-[40px] border border-white/10 bg-white/10 px-8 py-16 shadow-2xl backdrop-blur-xl md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm uppercase tracking-[4px] text-sky-400">
              Digital Education
            </p>

            <h2 className="text-4xl font-black leading-tight">
              Built for Modern Colleges
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              OSRA empowers lecturers and principals to automate academic
              management and reduce paperwork with smart digital workflows.
            </p>

            <Link
              href="/auth/login"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-4 font-bold text-white transition hover:scale-105"
            >
              Login Now
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-[30px] shadow-2xl">
            <Image
              src="/images/college-edu.jpg"
              alt="Education Platform"
              width={700}
              height={450}
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <DashboardFooter />
    </main>
  )
}

/* ================= FEATURE CARD ================= */

function Feature({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group rounded-[28px] border border-white/10 bg-white/10 p-8 shadow-xl backdrop-blur-xl transition duration-300 hover:border-sky-400/40 hover:bg-white/15"
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg">
        {icon}
      </div>

      <h3 className="text-2xl font-bold">{title}</h3>

      <p className="mt-4 leading-7 text-slate-300">{desc}</p>
    </motion.div>
  )
}