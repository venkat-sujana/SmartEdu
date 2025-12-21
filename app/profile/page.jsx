"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { User } from "lucide-react";
import { AcademicCapIcon, EnvelopeIcon, UserCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/solid";
export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow">
        {/* Profile Photo */}
        <div className="relative w-28 h-28 rounded-full overflow-hidden border">
        <Image
            src="/images/profile.jpg"   // 👈 public/images path
            alt="Profile Photo"
            fill
            className="object-cover"
            priority
        />
        </div>


        {/* Basic Info */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {user?.name || "Your Name"}
          </h1>
          <p className="text-slate-600">{user?.email}</p>
          <p className="text-sm text-slate-500 mt-1">
            Lecturer | Mechanical Engineering
          </p>
        </div>
      </div>

      {/* Educational Qualifications */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          🎓 Educational Qualifications
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-slate-700">
          <li>B.Tech (Mechanical Engineering)</li>
          <li>M.Tech (Mechanical Engineering)</li>
        </ul>
      </section>

      {/* Technical Skills */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          💻 Technical Skills
        </h2>

        {/* Frontend */}
        <div className="mb-4">
          <h3 className="font-medium text-slate-700 mb-2">Frontend</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "HTML",
              "CSS",
              "Bootstrap",
              "Material UI",
              "Tailwind CSS",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-sm rounded-full bg-blue-50 text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Backend */}
        <div className="mb-4">
          <h3 className="font-medium text-slate-700 mb-2">Backend</h3>
          <div className="flex flex-wrap gap-2">
            {["Node.js", "Express.js", "Next.js","Python(Django)"].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-sm rounded-full bg-green-50 text-green-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Database */}
        <div>
          <h3 className="font-medium text-slate-700 mb-2">Database</h3>
          <div className="flex flex-wrap gap-2">
            {["SQL", "MySQL", "MongoDB"].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-sm rounded-full bg-purple-50 text-purple-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About / Experience */}
      <section className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          🧑‍🏫 Professional Summary
        </h2>
        <p className="text-slate-700 leading-relaxed">
          Passionate Mechanical Engineering lecturer with strong interest in
          modern web technologies. Experienced in building responsive,
          role-based academic management systems using Next.js, Tailwind CSS,
          Node.js, and MongoDB. Actively working on OSRA (Online Student Record
          Automation) platform.
        </p>

        <p className="text-slate-700 leading-relaxed">
          OSRA (Online Student Record & Attendance System) is a smart college management
solution designed to simplify academic administration. It helps institutions
efficiently manage student records, attendance, examinations, and performance
tracking in one secure digital platform.

        </p>

        <p className="text-slate-700 leading-relaxed">
          OSRA empowers colleges to streamline their academic processes and
          enhance student engagement. It provides a user-friendly interface for
          instructors, administrators, and students, allowing them to access
          essential information in real-time. With OSRA, colleges can optimize
          resource allocation, improve student engagement, and enhance
          <em> overall academic performance.
          </em>
        </p>
        <p>
          • Student Registration & Records Management  <br/>
• Daily & Monthly Attendance Tracking <br/> 
• Examination & Marks Management <br/> 
• Role-Based Access (Lecturer / Principal)  <br/>
• College-wise Secure Data Filtering  <br/>
• Reports & Performance Analysis  <br/>
• Mobile & Desktop Friendly Interface<br/>

        </p>
      </section>
    </div>
  );
}
