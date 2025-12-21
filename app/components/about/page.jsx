//app/components/about/page.jsx
import React from 'react'
import { AcademicCapIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline'

export default function AboutPage() {
  const imageSrc = '/images/profile.jpg'

  return (
    <main className="min-h-screen bg-linear-to-b from-indigo-100 via-white to-indigo-50 flex items-center justify-center p-6 mt-20">
      <section className="max-w-5xl w-full bg-white shadow-xl rounded-3xl p-10 grid md:grid-cols-3 gap-10 items-center border border-indigo-100">
        {/* Profile */}
        <div className="col-span-1 flex flex-col items-center text-center">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-lg ring-4 ring-indigo-200">
            <img
              src={imageSrc}
              alt="Venkataiah Embeti photo"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold text-indigo-700">Venkataiah Embeti</h1>
          <p className="mt-1 text-sm text-slate-500">Lecturer — Government Junior College</p>

          <div className="mt-5 flex gap-3">
            <a href="#contact" className="px-5 py-2 rounded-full border border-indigo-300 text-indigo-600 text-sm hover:bg-indigo-50">Contact</a>
            <a href="#osra" className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm hover:bg-indigo-700">OSRA</a>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-semibold text-indigo-700">About Me</h2>
            <p className="text-slate-700 leading-relaxed">
              I am a lecturer passionate about teaching and digital tools. I built <span className="font-semibold">OSRA</span>,
              a multi-college attendance and exam management platform using <span className="font-semibold">Next.js</span> and <span className="font-semibold">Tailwind CSS</span>.
              My focus is on creating fast and reliable tools for lecturers and principals.
            </p>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Stat label="Years Teaching" value="15+" />
              <Stat label="Modules" value="Student, Exam, Attendance" />
              <Stat label="Tech" value="Next.js, Tailwind" />
              <Stat label="Focus" value="Multi-college App" />
            </div>

            {/* Roles Section */}
            <div className="mt-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <h3 className="text-indigo-700 text-lg font-semibold">Roles in OSRA</h3>
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                {/* Principal */}
                <div className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                  <h4 className="text-indigo-600 font-semibold">Principal Role</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-snug">
                    • View overall attendance & exam analytics.<br/>
                    • Manage college-wide lecturer & student data.<br/>
                    • Monitor academic activity and approve changes.
                  </p>
                </div>

                {/* Lecturer */}
                <div className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                  <h4 className="text-indigo-600 font-semibold">Lecturer Role</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-snug">
                    • Mark FN/AN attendance daily.<br/>
                    • Manage student records & exam marks entry.<br/>
                    • View day-wise, month-wise, and group-wise attendance.
                  </p>
                </div>

                {/* Student */}
                <div className="p-4 bg-white border border-indigo-100 rounded-xl shadow-sm">
                  <h4 className="text-indigo-600 font-semibold">Student Role</h4>
                  <p className="text-slate-600 text-sm mt-2 leading-snug">
                    • Log in using Admission Number.<br/>
                    • View personal profile & academic information.<br/>
                    • Check daily/monthly attendance status.<br/>
                    • View exam marks & progress reports.<br/>
                    • Easily show records to parents.
                  </p>
                </div>
              </div>
            </div>

            {/* OSRA */}
            <div id="osra" className="mt-6 bg-white border border-indigo-100 p-5 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-indigo-700">About OSRA</h3>
              <p className="mt-2 text-slate-600 text-sm leading-snug">
                OSRA is a simple but powerful academic management system with role-based login,
                multi-college filtering, student/exam/attendance modules, PDF/Excel export, and secure data storage.
              </p>

              {/* Groups Section */}
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <h4 className="text-indigo-700 font-semibold flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" /> Groups in OSRA
                </h4>
                <p className="text-slate-600 text-sm mt-2 leading-snug">
                  OSRA supports multiple groups such as MPC, BiPC, CEC, HEC, M&AT, MLT, CET for both 1st & 2nd year.
                  Each lecturer can manage group-wise attendance, exams, and student records.
                </p>
              </div>

              {/* Edit Features */}
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <h4 className="text-indigo-700 font-semibold flex items-center gap-2">
                  <AcademicCapIcon className="w-5 h-5" /> Edit Options
                </h4>
                <p className="text-slate-600 text-sm mt-2 leading-snug">
                  OSRA provides edit permissions based on role:
                  <br/>• Principals can edit lecturer & student details.
                  <br/>• Lecturers can edit attendance, student info, and exam marks for their groups.
                  <br/>• Students can only view their information but cannot edit it.
                </p>
              </div>
            </div>

            <div id="contact" className="mt-6"> 
              <h3 className="text-lg font-semibold text-indigo-700">Get in Touch</h3>
              <p className="mt-2 text-sm text-slate-600">
                Need custom UI, extra pages, or OSRA improvements? Tell me — I can design and code them instantly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-indigo-700 text-base">{value}</div>
    </div>
  )
}
