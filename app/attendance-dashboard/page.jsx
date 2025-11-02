'use client'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Calendar,
  Users,
  FileText,
  Edit,
  BarChart,
  ClipboardList,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Home,
} from 'lucide-react'

// import AttendanceShortageSummary from '@/app/components/attendance-shortage-summary/page'
import AbsenteesTable from '../absentees-table/page'
import { useEffect, useState } from 'react'
import OverallAttendanceMatrixCard from '../components/OverallAttendanceMatrixCard/page'

// Schema groups/add/remove as needed
const groupNames = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const years = ['First Year', 'Second Year']
const sessionLabels = { FN: 'Forenoon', AN: 'Afternoon', EN: 'Evening' }
const sessions = ['FN', 'AN', 'EN']

const fetcher = url => fetch(url).then(res => res.json())

export default function AttendanceDashboard() {
  const { data: shortageApiData } = useSWR('/api/attendance/shortage-summary', fetcher)
  const shortageData = shortageApiData?.data || []
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}

  const { data: session, status } = useSession()
  const user = session?.user

  const absentees = absApiData?.absentees || []

  const [collegeName, setCollegeName] = useState('')

  // Helper: given group, year, session => stats
  function stats(group, year, session) {
    const present =
      sessionWisePresent[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(s => s.group === group && s.yearOfStudy === year)
        .length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, total, percent }
  }

  // ✅ Fetch college name from API using collegeId
  useEffect(() => {
    const fetchCollegeName = async () => {
      if (session?.user?.collegeId) {
        try {
          const res = await fetch(`/api/colleges/${session.user.collegeId}`)
          const data = await res.json()
          if (res.ok) {
            setCollegeName(data.name) // assuming { name: "ABC College" }
          } else {
            console.error('College fetch failed:', data.error)
          }
        } catch (err) {
          console.error('Error fetching college name:', err)
        }
      }
    }

    fetchCollegeName()
  }, [session?.user?.collegeId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{collegeName}-ATTENDANCE DASHBOARD</h1>
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              📊Year Wise Group wise Session Wise Attendance
            </h1>
          </div>

          <div className="my-6 flex justify-center gap-4">
            <Link href="/lecturer/dashboard">
              <button className="cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
                Lecturer-Dashboard
              </button>
            </Link>
            <Link href="/attendance-records/individual">
              <button className="cursor-pointer rounded-full border-2 border-green-500 bg-white px-6 py-2 font-bold text-green-700 shadow transition hover:scale-105 hover:bg-green-50">
                Edit Records
              </button>
            </Link>
            <Link href="/attendance-records/monthly-summary">
              <button className="cursor-pointer rounded-full bg-gradient-to-r from-pink-500 to-purple-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
                MOnthly-Summary
              </button>
            </Link>

            <Link href="/attendance-form">
              <button className="cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
                Take attendance
              </button>
            </Link>
          </div>

          <Link href="/attendance-records/attendance-calendar">
            <button className="mb-4 mr-2 cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
              Calendar-View
            </button>
          </Link>

          <Link href="/exam-report">
            <button className="mb-4 mr-2 cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
              Exam Dashboard
            </button>
          </Link>
          <Link href="/student-table">
            <button className="mr-2 cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
              View Students
            </button>
          </Link>
          <Link href="/register">
            <button className="mr-2 cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
              Add Student
            </button>
          </Link>
          <Link href="/exams-form">
            <button className="cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105">
              Add Exam
            </button>
          </Link>
        </div>

        <div className="mb-12">
          <OverallAttendanceMatrixCard />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {groupNames.map((group, groupIdx) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 + groupIdx * 0.1 }}
            >
              <Card className="rounded-2xl border-2 border-blue-200 bg-white shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-blue-700">
                    {group}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-7 pt-2">
                  {years.map(year => (
                    <div key={year} className="rounded-xl bg-blue-50 p-4">
                      <div className="mb-3 text-lg font-semibold text-blue-900">{year}</div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {sessions.map(session => {
                          const s = stats(group, year, session)
                          return (
                            <div
                              key={session}
                              className="rounded-xl border border-blue-100 bg-white p-3 shadow"
                            >
                              <div className="mb-2 font-semibold text-blue-600">
                                {sessionLabels[session]}
                              </div>
                              <div className="flex justify-between">
                                <span>Present:</span>
                                <span className="font-bold text-green-700">{s.present}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Absent:</span>
                                <span className="font-bold text-red-600">{s.absent}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total:</span>
                                <span className="font-bold">{s.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>%:</span>
                                <span className="font-bold text-blue-700">{s.percent}%</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Today's Absentees</h2>
          <AbsenteesTable absentees={absentees} />
        </div>

        {/* <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Attendance Shortage Summary</h2>
          <AttendanceShortageSummary shortageData={shortageData} />
        </div> */}
      </div>
    </div>
  )
}
