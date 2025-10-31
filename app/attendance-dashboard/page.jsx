'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, Users, FileText, Edit, BarChart, ClipboardList, UserCheck, AlertCircle, TrendingUp, Home
} from 'lucide-react'

import AttendanceShortageSummary from '@/app/components/attendance-shortage-summary/page'
import useSWR from 'swr'
import AbsenteesTable from '../absentees-table/page'

// Define attendance features for the dashboard
const attendanceFeatures = [
  {
    title: 'Take Attendance',
    description: 'Quickly mark student attendance for FN/AN sessions.',
    href: '/attendance-form',
    icon: <UserCheck className="h-6 w-6" />,
    gradient: 'from-blue-100 to-blue-200'
  },
  {
    title: 'Monthly Attendance',
    description: 'Detailed attendance reports and analytics.',
    href: '/attendance-records/monthly-summary',
    icon: <BarChart className="h-6 w-6" />,
    gradient: 'from-green-100 to-green-200'
  },
  {
    title: 'Calender View',
    description: 'See who is absent today and take action.',
    href: '/attendance-records/attendance-calendar',
    icon: <AlertCircle className="h-6 w-6" />,
    gradient: 'from-red-100 to-red-200'
  },
  {
    title: 'Group-Wise View',
    description: 'Monitor students with attendance shortage.',
    href: '/lecturer/attendance/group-wise',
    icon: <ClipboardList className="h-6 w-6" />,
    gradient: 'from-purple-100 to-purple-200'
  },
  {
    title: 'Edit-Records',
    description: 'Edit attendance records for corrections.',
    href: '/attendance-records/individual',
    icon: <Edit className="h-6 w-6" />,
    gradient: 'from-yellow-100 to-yellow-200'
  },
  {
    title: 'Attendance with names',
    description: 'View attendance in a calendar format.',
    href: '/lecturer/attendance',
    icon: <Calendar className="h-6 w-6" />,
    gradient: 'from-indigo-100 to-indigo-200'
  }
]

export default function AttendanceDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  // Add FN/AN present/absent states for first, second year
  const [fnFirstYearPresent, setFnFirstYearPresent] = useState(0)
  const [fnFirstYearAbsent, setFnFirstYearAbsent] = useState(0)
  const [anFirstYearPresent, setAnFirstYearPresent] = useState(0)
  const [anFirstYearAbsent, setAnFirstYearAbsent] = useState(0)
  const [fnSecondYearPresent, setFnSecondYearPresent] = useState(0)
  const [fnSecondYearAbsent, setFnSecondYearAbsent] = useState(0)
  const [anSecondYearPresent, setAnSecondYearPresent] = useState(0)
  const [anSecondYearAbsent, setAnSecondYearAbsent] = useState(0)

  // Overall totals
  const [overallPresent, setOverallPresent] = useState(0)
  const [overallAbsent, setOverallAbsent] = useState(0)
  const [overallPercent, setOverallPercent] = useState(0)

  // Data hooks
  const fetcher = url => fetch(url).then(res => res.json())
  const { data: shortageApiData } = useSWR('/api/attendance/shortage-summary', fetcher)
  const shortageData = shortageApiData?.data || []
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)

  const absentees = absApiData?.absentees || []

  const [showShortage, setShowShortage] = useState(false)

  useEffect(() => {
    if (absApiData && absApiData.sessionWisePresent && absApiData.sessionWiseAbsentees) {
      // FN/AN present/absent
      const fnPresent = absApiData.sessionWisePresent.FN || []
      const fnAbsent = absApiData.sessionWiseAbsentees.FN || []
      const anPresent = absApiData.sessionWisePresent.AN || []
      const anAbsent = absApiData.sessionWiseAbsentees.AN || []

      setFnFirstYearPresent(fnPresent.filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length)
      setFnFirstYearAbsent(fnAbsent.filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length)
      setFnSecondYearPresent(fnPresent.filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length)
      setFnSecondYearAbsent(fnAbsent.filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length)

      setAnFirstYearPresent(anPresent.filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length)
      setAnFirstYearAbsent(anAbsent.filter(s => s.yearOfStudy?.toLowerCase().includes('first')).length)
      setAnSecondYearPresent(anPresent.filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length)
      setAnSecondYearAbsent(anAbsent.filter(s => s.yearOfStudy?.toLowerCase().includes('second')).length)

      // Overall totals
      const totalPresent = fnPresent.length + anPresent.length
      const totalAbsent = fnAbsent.length + anAbsent.length
      setOverallPresent(totalPresent)
      setOverallAbsent(totalAbsent)
      const totalStudents = totalPresent + totalAbsent
      setOverallPercent(totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0)
    }
  }, [absApiData])

  // First Year Total & Percentage
  const firstYearTotal =
    fnFirstYearPresent + fnFirstYearAbsent +
    anFirstYearPresent + anFirstYearAbsent
  const firstYearPercent = firstYearTotal > 0
    ? Math.round(((fnFirstYearPresent + anFirstYearPresent) / firstYearTotal) * 100)
    : 0

  // Second Year Total & Percentage
  const secondYearTotal =
    fnSecondYearPresent + fnSecondYearAbsent +
    anSecondYearPresent + anSecondYearAbsent
  const secondYearPercent = secondYearTotal > 0
    ? Math.round(((fnSecondYearPresent + anSecondYearPresent) / secondYearTotal) * 100)
    : 0

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  // --- UI starts here ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">📊 Attendance Management</h1>
            <p className="text-lg text-gray-600">Complete attendance system in one place</p>
          </div>
          <Link href={user?.role === 'principal' ? '/principal/dashboard' : '/lecturer/dashboard'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
            </motion.button>
          </Link>
        </div>

        {/* Attendance Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Overall Attendance Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-2xl border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Overall Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between">
                  <span>Present (FN+AN):</span>
                  <span className="font-bold text-green-700">{overallPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>Absent (FN+AN):</span>
                  <span className="font-bold text-red-600">{overallAbsent}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Attendance %:</span>
                  <span className="text-xl font-bold text-blue-700">{overallPercent}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* First Year Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="rounded-2xl border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  🥇 First Year
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-1">
                <div className="flex justify-between">
                  <span>FN Present:</span>
                  <span className="font-bold text-green-700">{fnFirstYearPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>FN Absent:</span>
                  <span className="font-bold text-red-600">{fnFirstYearAbsent}</span>
                </div>
                <div className="flex justify-between">
                  <span>AN Present:</span>
                  <span className="font-bold text-green-700">{anFirstYearPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>AN Absent:</span>
                  <span className="font-bold text-red-600">{anFirstYearAbsent}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total:</span>
                  <span className="font-bold">{firstYearTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance %:</span>
                  <span className="font-bold text-blue-700">{firstYearPercent}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Second Year Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Card className="rounded-2xl border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  🥈 Second Year
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-1">
                <div className="flex justify-between">
                  <span>FN Present:</span>
                  <span className="font-bold text-green-700">{fnSecondYearPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>FN Absent:</span>
                  <span className="font-bold text-red-600">{fnSecondYearAbsent}</span>
                </div>
                <div className="flex justify-between">
                  <span>AN Present:</span>
                  <span className="font-bold text-green-700">{anSecondYearPresent}</span>
                </div>
                <div className="flex justify-between">
                  <span>AN Absent:</span>
                  <span className="font-bold text-red-600">{anSecondYearAbsent}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Total:</span>
                  <span className="font-bold">{secondYearTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attendance %:</span>
                  <span className="font-bold text-blue-700">{secondYearPercent}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ------ Rest Dashboard content same (features, shortage summary, absentees table...) ----- */}

<div>
  <h2 className="mb-6 text-2xl font-bold text-gray-900">Attendance Features</h2>
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
    {attendanceFeatures.map((feature, index) => (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Link href={feature.href}>
          <Card className={`cursor-pointer border-2 bg-gradient-to-br transition-all duration-300 hover:shadow-xl ${feature.gradient} hover:scale-105 rounded-2xl`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-gray-800">
                <div className="rounded-lg bg-white p-2 shadow-sm text-gray-600">
                  {feature.icon}
                </div>
                <span className="text-lg">{feature.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{feature.description}</p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    ))}
  </div>
</div>


        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Attendance Shortage Summary</h2>
          <AttendanceShortageSummary shortageData={shortageData} />
        </div>
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Today's Absentees</h2>
          <AbsenteesTable absentees={absentees} />
        </div>
      </div>
    </div>
  )
}
