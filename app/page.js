//app/page.js
"use client"

import Image from "next/image"
import Link from "next/link"
import Navbar from "@/components/Navbar"

import { motion } from "framer-motion"
import { Users, ClipboardList, CalendarCheck } from "lucide-react"
import DashboardFooter from "./components/Footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-linear-to-br from-sky-50 via-indigo-50 to-blue-100">
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 md:grid-cols-2">
          {/* Text */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-extrabold text-indigo-700 md:text-6xl"
            >
              OSRA – Smart Academic Management
            </motion.h1>

            <p className="mt-6 text-lg">
              Manage students, attendance & exams across multiple colleges using one modern
              platform.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                href="/auth/login"
                className="rounded-xl bg-indigo-600 px-8 py-3 font-semibold text-white hover:bg-indigo-700"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="rounded-xl border border-indigo-600 px-8 py-3 text-indigo-600 hover:bg-indigo-50"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl shadow-2xl"
          >
            <Image
              src="/images/students-1.jpg"
              alt="OSRA Student Management"
              width={600}
              height={420}
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-14 text-center text-3xl font-bold">OSRA Core Modules</h2>

          <div className="grid gap-10 md:grid-cols-3">
            <Feature icon={<Users />} title="Students" />
            <Feature icon={<ClipboardList />} title="Exams" />
            <Feature icon={<CalendarCheck />} title="Attendance" />
          </div>

          {/* College Image */}
          <div className="mt-16 overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="/images/college.jpg"
              alt="College Management"
              width={1200}
              height={500}
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-indigo-700 py-24 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold">Built for Modern Colleges</h2>
            <p className="mb-8 text-lg">
              OSRA helps lecturers and principals reduce paperwork and increase academic efficiency.
            </p>
            <Link
              href="/auth/login"
              className="inline-block rounded-xl bg-white px-10 py-4 font-bold text-indigo-700 shadow"
            >
              Login Now
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-2xl">
            <Image
              src="/images/college-edu.jpg"
              alt="Education Platform"
              width={600}
              height={400}
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <DashboardFooter />
    </main>
  )
}

/* ---------- Feature Card ---------- */
function Feature({ icon, title }) {
  return (
    <div className="rounded-2xl p-8 border shadow hover:shadow-md transition text-center">
      <div className="text-indigo-600 mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  )
}
