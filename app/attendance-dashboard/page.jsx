'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

import AttendanceShortageSummary from '@/app/components/attendance-shortage-summary/page'
import useSWR from 'swr'
import AbsenteesTable from '../absentees-table/page'

export default function AttendanceDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  const [firstYearPresent, setFirstYearPresent] = useState(0)
  const [secondYearPresent, setSecondYearPresent] = useState(0)
  const [firstYearAbsent, setFirstYearAbsent] = useState(0)
  const [secondYearAbsent, setSecondYearAbsent] = useState(0)
  const [totalPresent, setTotalPresent] = useState(0)
  const [attendancePercent, setAttendancePercent] = useState(0)

  const fetcher = url => fetch(url).then(res => res.json())

  const { data: shortageApiData } = useSWR('/api/attendance/shortage-summary', fetcher)
  const shortageData = shortageApiData?.data || []
  const { data: absApiData } = useSWR('/api/attendance/today-absentees', fetcher)
  const absentees = absApiData?.absentees || []
  console.log("Today's absentees:", absentees)

  const [showShortage, setShowShortage] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.collegeId) {
      fetch(`/api/attendance/today-absentees?collegeId=${session.user.collegeId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            const absentees = data.absentees || []
            const presentStudents = data.presentStudents || []

            let firstYearP = 0,
              firstYearA = 0
            let secondYearP = 0,
              secondYearA = 0

            presentStudents.forEach(student => {
              if (student.yearOfStudy?.toLowerCase().includes('first')) {
                firstYearP++
              } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
                secondYearP++
              }
            })

            absentees.forEach(student => {
              if (student.yearOfStudy?.toLowerCase().includes('first')) {
                firstYearA++
              } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
                secondYearA++
              }
            })

            setFirstYearPresent(firstYearP)
            setFirstYearAbsent(firstYearA)
            setSecondYearPresent(secondYearP)
            setSecondYearAbsent(secondYearA)
            setTotalPresent(firstYearP + secondYearP)

            const totalStudents = firstYearP + firstYearA + secondYearP + secondYearA
            const percent =
              totalStudents > 0 ? Math.round(((firstYearP + secondYearP) / totalStudents) * 100) : 0
            setAttendancePercent(percent)
          }
        })
    }
  }, [status, session])

  const firstYearTotal = firstYearPresent + firstYearAbsent
  const secondYearTotal = secondYearPresent + secondYearAbsent

  const firstYearPercent =
    firstYearTotal > 0 ? Math.round((firstYearPresent / firstYearTotal) * 100) : 0

  const secondYearPercent =
    secondYearTotal > 0 ? Math.round((secondYearPresent / secondYearTotal) * 100) : 0

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  const attendanceFeatures = [
    {
      title: 'Take Attendance',
      description: "Mark today's attendance",
      icon: <UserCheck className="h-6 w-6" />,
      href: '/attendance-form',
      color: 'green',
      gradient: 'from-green-100 to-green-300',
    },
    {
      title: 'Attendance Records',
      description: 'View all attendance records',
      icon: <FileText className="h-6 w-6" />,
      href: '/attendance-records',
      color: 'blue',
      gradient: 'from-blue-100 to-blue-300',
    },
    {
      title: 'Calendar View',
      description: 'View attendance in calendar format',
      icon: <Calendar className="h-6 w-6" />,
      href: '/attendance-records/attendance-calendar',
      color: 'purple',
      gradient: 'from-purple-100 to-purple-300',
    },
    {
      title: 'Group-wise View',
      description: 'View attendance by groups',
      icon: <Users className="h-6 w-6" />,
      href: '/components/groupwise-attendance-table',
      color: 'yellow',
      gradient: 'from-yellow-100 to-yellow-300',
    },
    {
      title: 'Monthly Summary',
      description: 'View monthly attendance statistics',
      icon: <BarChart className="h-6 w-6" />,
      href: '/attendance-records/monthly-summary',
      color: 'indigo',
      gradient: 'from-indigo-100 to-indigo-300',
    },
    {
      title: 'Edit Records',
      description: 'Edit individual attendance records',
      icon: <Edit className="h-6 w-6" />,
      href: '/attendance-records/individual',
      color: 'orange',
      gradient: 'from-orange-100 to-orange-300',
    },
    {
      title: 'Attendance with Names',
      description: 'View detailed attendance list',
      icon: <ClipboardList className="h-6 w-6" />,
      href: '/lecturer/attendance',
      color: 'teal',
      gradient: 'from-teal-100 to-teal-300',
    },
    {
      title: 'Shortage Summary',
      description: 'View attendance shortage report',
      icon: <AlertCircle className="h-6 w-6" />,
      href: '/components/attendance-shortage-summary',
      color: 'red',
      gradient: 'from-red-100 to-red-300',
    },
    {
      title: "Today's Absentees",
      description: "View today's absent students",
      icon: <Users className="h-6 w-6" />,
      href: '/absentees-table',
      color: 'gray',
      gradient: 'from-gray-100 to-gray-300',
    },
  ]

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

        {/* Quick Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Overall Attendance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="rounded-2xl border-2 border-blue-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Overall Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Present</p>
                    <p className="text-3xl font-bold text-green-600">{totalPresent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Percentage</p>
                    <p className="text-3xl font-bold text-blue-600">{attendancePercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* First Year Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-2xl border-2 border-green-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  🥇 First Year
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-bold text-green-700">{firstYearPresent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-bold text-red-600">{firstYearAbsent}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Percentage:</span>
                    <span className="text-xl font-bold text-blue-700">{firstYearPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Second Year Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="rounded-2xl border-2 border-purple-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  🥈 Second Year
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Present:</span>
                    <span className="font-bold text-green-700">{secondYearPresent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absent:</span>
                    <span className="font-bold text-red-600">{secondYearAbsent}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Percentage:</span>
                    <span className="text-xl font-bold text-blue-700">{secondYearPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Feature Grid */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Attendance Features</h2>
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {attendanceFeatures.map((feature, index) =>
    feature.title === "Shortage Summary" ? (
      <motion.div
        key={feature.title}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <div
          onClick={() => setShowShortage(true)}
          className={`cursor-pointer border-2 bg-gradient-to-br transition-all duration-300 hover:shadow-xl ${feature.gradient} hover:scale-105 p-0 rounded-2xl`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-800">
              <div className="rounded-lg bg-white p-2 shadow-sm text-red-600">
                {feature.icon}
              </div>
              <span className="text-lg">{feature.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-700">{feature.description}</p>
          </CardContent>
        </div>
      </motion.div>
    ) : (
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
    )
  )}
</div>

        </div>
      </div>

      {/* Attendance Shortage Summary Modal */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Attendance Shortage Summary</h2>
        <AttendanceShortageSummary shortageData={shortageData} />
      </div>

      {/* Today's Absentees Table */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Today's Absentees</h2>
        <AbsenteesTable absentees={absentees} />
      </div>
    </div>
  )
}
