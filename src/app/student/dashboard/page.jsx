// src/app/student/dashboard/page.jsx

'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import StudentTodayAttendance from '@/components/StudentTodayAttendance/StudentTodayAttendance'
import StudentIndividualExams from '@/components/StudentIndividualExams/StudentIndividualExams'
import StudentMonthlyAttendanceSummary from '@/components/StudentMonthlyAttendanceSummary/StudentMonthlyAttendanceSummary'
import StudentAttendanceAlert from '@/components/StudentAttendanceAlert/StudentAttendanceAlert'
import StudentLateComingHistory from '@/components/StudentLateComingHistory/StudentLateComingHistory'
import StudentFeeStatus from '@/components/StudentFeeStatus/StudentFeeStatus'

export default function StudentDashboard() {
  const { data: session, status } = useSession()

  const studentId = session?.user?.id

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-red-500">
          Please log in to continue
        </p>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="mx-auto mt-2 max-w-5xl space-y-10 rounded bg-linear-to-br from-indigo-100 via-white to-blue-50 p-3 px-4 py-12 font-bold shadow">

      {/* ── Page Title ── */}
      <h1 className="flex items-center justify-center gap-2 text-xl font-extrabold tracking-tight text-blue-700">
        🎓 Student Dashboard
      </h1>

      {/* ── College Name ── */}
      <h2 className="mx-auto mb-5 flex max-w-5xl items-center justify-center gap-2 rounded border border-blue-500 bg-black p-3 text-center text-xl font-bold text-white shadow">
        🏫 {user.collegeName || '---'}
      </h2>

      {/* ── Profile Card ── */}
      <div className="rounded-3xl border border-blue-400 bg-cyan-50 p-10 shadow-xl transition-transform hover:scale-[1.01]">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">

          <div className="relative">
            <Image
              src={user.photo || '/default-avatar.png'}
              alt={user.name || 'Student'}
              width={144}
              height={144}
              className="h-36 w-36 rounded-full border-2 border-blue-400 object-cover shadow-xl"
              unoptimized
            />

            <span className="absolute right-2 bottom-2 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>

          <div className="flex-1 space-y-3 text-gray-700">

            <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              👤 {user.name}
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">

              <p>
                <span className="font-bold text-gray-800">
                  🆔 Admission No:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.admissionNo || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  🏫 College:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.collegeName || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  📅 Year:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.yearOfStudy || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  📚 Group:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.group || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  👨‍👧 Father Name:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.fatherName || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  📱 Mobile:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.mobile || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  🧑‍🤝‍🧑 Caste:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.caste || '---'}
                </span>
              </p>

              <p>
                <span className="font-bold text-gray-800">
                  🚻 Gender:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.gender || '---'}
                </span>
              </p>

              <p className="md:col-span-2">
                <span className="font-bold text-gray-800">
                  🏠 Address:
                </span>{' '}
                <span className="font-bold text-gray-600">
                  {user.address || '---'}
                </span>
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* ── Today's FN / AN Attendance ── */}
<section>
  <StudentTodayAttendance studentId={studentId} />
</section>



      {/* ── Attendance Alert ── */}
      <section>
        <StudentAttendanceAlert studentId={studentId} />
      </section>

      {/* ── Monthly Day-Based Attendance ── */}
      <section>
        <StudentMonthlyAttendanceSummary studentId={studentId} />
      </section>

      {/* ── Late Coming History ── */}
      <section>
        <StudentLateComingHistory studentId={studentId} />
      </section>

      {/* ── Fee Payment Status ── */}
      <section>
        <StudentFeeStatus studentId={studentId} />
      </section>

      {/* ── Exam Results ── */}
      <section>
        <StudentIndividualExams studentId={studentId} />
      </section>

    </div>
  )
}