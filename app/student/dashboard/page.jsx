'use client'
import StudentIndividualExams from '@/app/components/StudentIndividualExams/page'
import StudentMonthlyAttendanceSummary from '@/app/components/StudentMonthlyAttendanceSummary/page'
import { useSession } from 'next-auth/react'

export default function StudentDashboard() {
  const { data: session, status } = useSession()

  console.log('Session', session)
  console.log('Status', status)

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold text-red-500">Please log in to continue</p>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="mx-auto max-w-5xl space-y-10 rounded p-3 px-4 py-12 font-bold shadow">
      {/* Header */}
      <h1 className="text-center text-xl font-extrabold tracking-tight text-blue-700">
        Student Dashboard
      </h1>

      <h2 className="mx-auto mb-5 max-w-5xl rounded border border-blue-500 bg-black p-3 text-center text-xl font-bold text-white shadow">
        {user.collegeName || '---'}
      </h2>

      {/* Profile Section */}
      <div className="bg-opacity/70 shadow-4xl rounded-3xl border border-blue-400 bg-cyan-50 p-10 backdrop-blur-md transition-transform hover:scale-[1.01]">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
          {/* Profile Photo */}
          <div className="relative">
            <img
              src={user.photo || '/default-avatar.png'}
              alt={user.name}
              className="shadow-4xl h-36 w-36 rounded-full border-2 border-blue-400 object-cover"
            />
            <span className="absolute right-2 bottom-2 h-4 w-4 rounded-full border-2 border-white bg-green-500"></span>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-gray-700">
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">
              <p>
                <span className="font-bold text-gray-800">Admission No:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.admissionNo || '---'}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">College:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.collegeName || '---'}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Year:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.yearOfStudy || '---'}</span>
              </p>

              <p>
                <span className="font-bold text-gray-800">Group:</span>&nbsp;
                <span className="font-bold text-gray-600">{user.group || '---'}</span>
              </p>

              <p className="mb-1 text-gray-600">
                <span className="font-bold">Father Name:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.fatherName || '---'}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Mobile:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.mobile || '---'}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Caste:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.caste || '---'}</span>
              </p>
              <p>
                <span className="font-bold text-gray-800">DOB:</span> &nbsp;
                <span className="font-bold text-gray-600">
                  {user.dob ? new Date(user.dob).toLocaleDateString() : '---'}
                </span>
              </p>
              <p>
                <span className="font-bold text-gray-800">Gender:</span> &nbsp;
                <span className="font-bold text-gray-600">{user.gender || '---'}</span>
              </p>
              <p className="md:col-span-2">
                <span className="font-bold text-gray-800">Address:</span>&nbsp;
                <span className="font-bold text-gray-600">{user.address || '---'}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary Section */}
      <StudentMonthlyAttendanceSummary studentId={user.id} />
      {/* Individual Exam Results Section */}
      <StudentIndividualExams studentId={user.id} />
    </div>
  )
}
