// app/auth/login/page.jsx - Public login landing page
"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, ClipboardList, School } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white text-gray-800 text-center mt-2">
      <section className="pt-5 md:pt-28 pb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto px-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800">
            Welcome to SmartCollege Portal
          </h1>
          <p className="mt-2 text-gray-600 text-lg">
            Manage Students, Lecturers, and Principals in one connected platform.
          </p>
        </motion.div>
      </section>
      {/* ===== CTA : M&AT Question Paper Generator ===== */}
<div className="mt-8">
  <div className="rounded-2xl border border-indigo-200 bg-liner-to-br from-indigo-50 to-blue-50 p-6 shadow-sm hover:shadow-md transition">
    <div className="flex items-start gap-4">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <ClipboardList className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-indigo-900">
          Generate Vocational Question Papers Instantly
        </h3>

        <p className="mt-2 text-gray-700">
          Create professional <strong>Vocational question papers</strong>
           for Intermediate Vocational exams in just a few clicks.
        </p>

        {/* CTA Button */}
        <div className="mt-4">
          <Link
            href="https://advanced-question-paper-tailwindcss.netlify.app/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-2 py-2 text-white font-semibold hover:bg-indigo-700 transition mr-3 mb-2"
          >
            Go to  M&AT Qp Generator →
          </Link>
          <Link
            href="https://skr-learn-portal.netlify.app/"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-2 py-2 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Go to Voc Qp Generator →
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>


      <section id="login" className="py-8 bg-white">
        <h3 className="text-3xl font-bold text-blue-700 mb-10">Login as</h3>
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
  )
}

function LoginCard({ icon, title, desc, link, color }) {
  const bg = {
    blue: "bg-blue-50 hover:bg-blue-100",
    green: "bg-green-50 hover:bg-green-100",
    purple: "bg-purple-50 hover:bg-purple-100",
  }[color]

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-8 rounded-2xl shadow-md ${bg} transition-all border border-gray-100 hover:shadow-xl hover:border-blue-200`}
    >
      {icon}
      <h4 className="text-xl font-semibold mt-3 mb-2 text-gray-800">{title}</h4>
      <p className="text-gray-600 mb-4">{desc}</p>
      <Link
        href={link}
        className={`inline-block text-white bg-${color}-600 hover:bg-${color}-700 px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
      >
        {title} Login →
      </Link>
    </motion.div>
  )
}
