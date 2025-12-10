//app/page.jsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Users, ClipboardList, School } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800 text-center mt-10">
      <section className="pt-20 md:pt-28 pb-16">
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
  );
}

function LoginCard({ icon, title, desc, link, color }) {
  const bg = {
    blue: "bg-blue-50 hover:bg-blue-100",
    green: "bg-green-50 hover:bg-green-100",
    purple: "bg-purple-50 hover:bg-purple-100",
  }[color];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`p-8 rounded-2xl shadow-md ${bg} transition-all`}
    >
      {icon}
      <h4 className="text-xl font-semibold mt-3 mb-2">{title}</h4>
      <p className="text-gray-600 mb-4">{desc}</p>
      <Link
        href={link}
        className={`text-white bg-${color}-600 px-4 py-2 rounded-lg hover:bg-${color}-700 transition-all`}
      >
        {title} Login
      </Link>
    </motion.div>
  );
}

