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
          <h1 className="mb-2 text-4xl font-bold text-gray-900">{collegeName}</h1>
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">
              📊Year Wise Group wise Session Wise Attendance
            </h1>
            <p className="text-lg text-gray-600">Complete attendance system in one place</p>
          </div>

          <Link href={user?.role === 'principal' ? '/principal/dashboard' : '/lecturer/dashboard'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-10 flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
            </motion.button>
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
