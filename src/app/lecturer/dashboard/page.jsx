//app/lecturer/dashboard/page.jsx
'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import useSWR from 'swr'
import AttendanceShortageTable from '@/components/attendance-shortage-summary/AttendanceShortageSummary'
import ActiveLecturersCard from '@/components/dashboard/ActiveLecturersCard'
import { UserGroupIcon } from '@heroicons/react/24/solid'
import LecturerInfoCard from '@/components/dashboard/LecturerInfoCard'
import ExternalLinks from '@/components/ExternalLinks'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
const fetcher = (...args) =>
  fetch(...args).then(res => {
    if (!res.ok) throw new Error('Network response was not ok')
    return res.json()
  })

import OverallAttendanceMatrixCard from '@/components/OverallAttendanceMatrixCard/OverallAttendanceMatrixCard'
import TodayAbsenteesTable from '@/app/absentees-table/page'
import OverallStrengthCard from '@/components/dashboard/OverallStrengthCard'
import MainLinks from '@/components/MainLinks'

export default function LecturerDashboard() {
  const { data: shortageApiData } = useSWR('/api/attendance/shortage-summary', fetcher)
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)

  const { data: consecutiveData } = useSWR(
  session?.user?.collegeId
    ? `/api/attendance/consecutive-absentees?collegeId=${session.user.collegeId}`
    : null,
  fetcher
)

  const shortageData = shortageApiData?.data || []
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}
  const { data: session, status } = useSession()
  const router = useRouter()

  const { data: activeLecturersData, error: activeLecturersError } = useSWR(
    '/api/lecturers/active',
    fetcher
  )

  // Session-wise states
  const [collegeName, setCollegeName] = useState('')
  const [studentCount, setStudentCount] = useState(0)

  const [, setFnFirstYearPresent] = useState(0)
  const [, setFnFirstYearAbsent] = useState(0)
  const [, setAnFirstYearPresent] = useState(0)
  const [, setAnFirstYearAbsent] = useState(0)

  const [, setFnSecondYearPresent] = useState(0)
  const [, setFnSecondYearAbsent] = useState(0)
  const [, setAnSecondYearPresent] = useState(0)
  const [, setAnSecondYearAbsent] = useState(0)

  const absentees = absApiData?.absentees || []

  const consecutiveAbsentees =
  consecutiveData?.absentees || []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/lecturer/login')
    }

    if (status === 'authenticated' && session?.user?.collegeId) {
      fetch(`/api/colleges/${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          if (data?.name) setCollegeName(data.name)
        })

      fetch(
        `/api/students/count?collegeId=${session.user.collegeId}&subject=${encodeURIComponent(
          session.user.subject
        )}`
      )
        .then(res => res.json())
        .then(data => {
          if (data?.count !== undefined) setStudentCount(data.count)
        })

      fetch(`/api/attendance/today-absentees?collegeId=${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          // Session-wise arrays
          const present = data?.sessionWisePresent || {}
          const absent = data?.sessionWiseAbsentees || {}

          // FN Session
          setFnFirstYearPresent(
            (present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setFnSecondYearPresent(
            (present.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )
          setFnFirstYearAbsent(
            (absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setFnSecondYearAbsent(
            (absent.FN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )

          // AN Session
          setAnFirstYearPresent(
            (present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setAnSecondYearPresent(
            (present.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )
          setAnFirstYearAbsent(
            (absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length
          )
          setAnSecondYearAbsent(
            (absent.AN || []).filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length
          )
        })
    }
  }, [status, session, router])

  if (status === 'loading') {
    return <div className="mt-10 text-center text-gray-500">Loading...</div>
  }

  const user = session?.user || {}

  return (
    <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-gray-200 bg-[url('/images/classroombg.jpg')] bg-cover bg-center p-6 bg-blend-normal shadow-lg">
      {/* College Name Title */}
      <div className="border-black-600 mb-8 flex items-center gap-4 rounded-lg border-2 bg-blue-50 px-6 py-4">
        <GraduationCap className="h-9 w-9 text-blue-700" />
        <h1 className="text-xl font-bold tracking-wide text-blue-800">
          {collegeName || 'Loading...'}
        </h1>
      </div>

      <div className="mb-10 flex items-center justify-center">
        <h1 className="text-md font-bold tracking-tight text-black">LECTURER DASHBOARD</h1>
        <image
          src="/images/classroombg.jpg"
          alt="Lecturer Dashboard Icon"
          className="mr-2 h-15 w-15 rounded object-cover"
        />
      </div>

      <MainLinks />

      <ExternalLinks />

      <LecturerInfoCard user={user} />

      {/* Active Lecturers Card */}
      <ActiveLecturersCard
        className="mx-auto mb-10 w-full max-w-md"
        lecturers={activeLecturersData?.data || []}
        loading={!activeLecturersData && !activeLecturersError}
        error={activeLecturersError}
        title="Currently Active Lecturers"
      />

      {/* Students Count Quick Card */}
      <div className="m-10 flex items-center justify-center gap-4">
        <div className="flex items-center justify-center rounded-2xl bg-linear-to-br from-indigo-100 to-blue-100 px-6 py-4 text-center shadow-lg">
          <p className="text-lg font-bold text-blue-800">Total Strength</p>&nbsp;
          <UserGroupIcon className="mr-2 h-7 w-7" />
          <p className="text-2xl font-extrabold text-indigo-900">{studentCount}</p>
        </div>
      </div>

      {/* Overall Strength Card */}
      <OverallStrengthCard
        sessionWisePresent={sessionWisePresent}
        sessionWiseAbsentees={sessionWiseAbsentees}
      />

      <OverallAttendanceMatrixCard />

      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Today Absentees</h2>
        <TodayAbsenteesTable absetees={absentees} />
      </div>

      {/* All other sections as in your original dashboard */}
      <Card className="mt-6 rounded-2xl bg-white p-2 shadow-lg">
        <AttendanceShortageTable data={shortageData} />
      </Card>


<pre className="bg-black text-white p-2 text-xs overflow-auto">
  {JSON.stringify(consecutiveAbsentees, null, 2)}
</pre>


      <ConsecutiveAbsenteesCard
  data={consecutiveAbsentees}
  loading={!consecutiveData}
/>
      {/* Footer */}
      <footer className="flex w-full flex-col items-center gap-3 pt-10 pb-6 text-gray-600">
        <div className="flex gap-6 text-xl">
          {/* Heroicons (Tailwind official) */}
          <a href="#" className="transition hover:text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.874h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
          <a href="#" className="transition hover:text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"
              />
            </svg>
          </a>
          <a href="#" className="transition hover:text-pink-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M7.75 2A5.75 5.75 0 002 7.75v8.5A5.75 5.75 0 007.75 22h8.5A5.75 5.75 0 0022 16.25v-8.5A5.75 5.75 0 0016.25 2h-8.5zm8.72 6.03a.75.75 0 011.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0L6.47 11.53a.75.75 0 011.06-1.06l3.47 3.47 4.47-4.47z" />
            </svg>
          </a>
          <a href="#" className="transition hover:text-blue-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="h-6 w-6"
            >
              <path d="M4.98 3.5C3.33 3.5 2 4.83 2 6.48v11.04C2 19.17 3.33 20.5 4.98 20.5h14.04c1.65 0 2.98-1.33 2.98-2.98V6.48c0-1.65-1.33-2.98-2.98-2.98H4.98zM8.75 17h-2v-7h2v7zm-1-8.27a1.27 1.27 0 110-2.54 1.27 1.27 0 010 2.54zM18 17h-2v-3.6c0-2.07-2.5-1.91-2.5 0V17h-2v-7h2v1.06c.87-1.61 4.5-1.73 4.5 1.55V17z" />
            </svg>
          </a>
        </div>
        <p className="text-sm">© {new Date().getFullYear()} OSRA System • All Rights Reserved</p>
      </footer>
    </div>
  )
}
