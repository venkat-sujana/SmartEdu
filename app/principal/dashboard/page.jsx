//app/principal/dashboard/page.jsx

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Users, BookOpen, Calendar } from "lucide-react"
import useSWR from "swr"
import AbsenteesTable from "@/app/absentees-table/page"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion";

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PrincipalDashboard() {

  const { data: session } = useSession()

  const principal = session?.user
  const collegeName = session?.user?.collegeName || "Your College"

  const today = new Date().toISOString().split("T")[0]

  // 🔹 Students Count
  const { data: studentData } = useSWR("/api/students", fetcher)
  const totalStudents = studentData?.data?.length || 0

  // 🔹 Lecturers Count
  const { data: lecturerData } = useSWR("/api/lecturers", fetcher)
  const totalLecturers = lecturerData?.data?.length || 0

  // 🔹 Today Absentees and Attendance Summary
  const { data, error, isLoading } = useSWR("/api/attendance/today-absentees", fetcher)

  const absentees = data?.absentees || [];


  // Correct keys as per API response
  const presentCount = data?.present ?? "--"
  const absentCount = data?.absent ?? "--"
  const percentage = data?.percentage ?? "--"


  // inside PrincipalDashboard

const { data: unit1Failures } = useSWR("/api/exams/failures?examType=UNIT-1", fetcher)
const { data: unit2Failures } = useSWR("/api/exams/failures?examType=UNIT-2", fetcher)


  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="hidden w-64 bg-white p-6 shadow-md md:block">
        <h2 className="mb-8 text-2xl font-bold text-blue-600">OSRA</h2>
        <nav className="space-y-4">
          <a className="flex items-center gap-2 text-gray-700 transition hover:text-blue-600">
            <Users className="h-5 w-5" /> Students
          </a>
          <a className="flex items-center gap-2 text-gray-700 transition hover:text-blue-600">
            <BookOpen className="h-5 w-5" /> Exams
          </a>
          <a className="flex items-center gap-2 text-gray-700 transition hover:text-blue-600">
            <Calendar className="h-5 w-5" /> Attendance
          </a>
          <a className="flex items-center gap-2 text-gray-700 transition hover:text-blue-600">
            <BarChart className="h-5 w-5" /> Reports
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/*header */}
          <header className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{collegeName}</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{principal?.name}</span>
          </p>
          <p className="text-sm text-gray-500">{principal?.email}</p>
        </div>
        <Button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 whitespace-nowrap">
          + Add Announcement
        </Button>
      </header>


        <Card className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-lg sm:max-w-md md:max-w-lg">
          <div className="mt-4 flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
            {/* Principal Photo */}
            {session?.user?.photo ? (
              <img
                src={session.user.photo}
                alt="Principal"
                className="h-24 w-24 rounded-full border object-cover shadow sm:h-28 sm:w-28"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 sm:h-28 sm:w-28">
                No Photo
              </div>
            )}

            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold">{session?.user?.name || 'Principal'}</p>
              <p className="text-gray-600">{session?.user?.email || ''}</p>
              <p className="text-sm text-gray-500">{session?.user?.collegeName || ''}</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <section className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-blue-600">{totalStudents}</CardContent>
          </Card>

          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Lecturers</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">
              {totalLecturers}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Attendance %</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-purple-600">
              {isLoading
                ? '--%'
                : error || typeof data?.percentage === 'undefined'
                  ? '0%'
                  : `${percentage}%`}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Present Count</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-green-700">
              {isLoading || error ? '--' : presentCount}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Absent Count</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">
              {isLoading || error ? '--' : absentCount}
            </CardContent>
          </Card>
        </section>

        {/* Absentees List Section */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Today Absentees List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-600">Failed to load</p>
              ) : !data || !data.absentees ? (
                <p className="text-gray-500">No attendance recorded</p>
              ) : data.absentees.length === 0 ? (
                <p className="text-green-600">🎉 No Absentees Today</p>
              ) : (
                <AbsenteesTable absentees={absentees} />
              )}
            </CardContent>
          </Card>

                 <Link href="/lecturer/attendance/group-wise">
                    <div className="cursor-pointer p-5 bg-yellow-100 hover:bg-yellow-200 rounded-xl text-center shadow-md">
                      <p className="text-xl font-semibold text-yellow-800">📅 Group wise Attendance</p>
                    </div>
                  </Link>

                          <Link href="/attendance-records">
                            <div className="cursor-pointer p-5 bg-indigo-100 hover:bg-indigo-200 rounded-xl text-center shadow-md">
                              <p className="text-xl font-semibold text-indigo-800">
                                📆 Attendance Records
                              </p>
                            </div>
                          </Link>



                                    <Link href="/student-table">
                                      <motion.div
                                        whileHover={{ scale: 1.1, rotate: 2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="cursor-pointer p-5 bg-blue-100 hover:bg-blue-200 rounded-xl text-center shadow-md transition-all"
                                      >
                                        <p className="text-xl font-semibold text-blue-800">📋 View Students</p>
                                      </motion.div>
                                    </Link>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>📅 Quarterly Exam - 15th Sept</li>
                <li>📅 Unit-III Exam - 10th Oct</li>
                <li>📅 Half Yearly - 17th Nov</li>
                <li>📅 Pre-Public 1 - 15th Dec</li>
                <li>📅 Pre-Public 2 - 21st Jan</li>
              </ul>
            </CardContent>
          </Card>

          {/* UNIT-1 Failed Students */}
          <Card>
            <CardHeader>
              <CardTitle>UNIT-1 Failed Students</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2">Stream</th>
                    <th className="p-2">Year</th>
                    <th className="p-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {unit1Failures?.failedStudents?.map((s, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2 text-center">{s.stream}</td>
                      <td className="p-2 text-center">{s.yearOfStudy}</td>
                      <td className="p-2 text-center text-red-600">{s.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table> */}
            </CardContent>
          </Card>

          {/* UNIT-2 Failed Students */}
          <Card>
            <CardHeader>
              <CardTitle>UNIT-2 Failed Students</CardTitle>
            </CardHeader>
            <CardContent>
              {/* <table className="w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2">Stream</th>
                    <th className="p-2">Year</th>
                    <th className="p-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {unit2Failures?.failedStudents?.length > 0 ? (
                    unit2Failures.failedStudents.map((s, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{s.name}</td>
                        <td className="p-2 text-center">{s.stream}</td>
                        <td className="p-2 text-center">{s.yearOfStudy}</td>
                        <td className="p-2 text-center text-red-600">{s.percentage}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">
                        ✅ No Failures
                      </td>
                    </tr>
                  )}
                </tbody>
              </table> */}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="rounded-2xl bg-white shadow-md">
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-gray-700">
                <li className="border-b pb-2">📢 College Fest on 10th Sept</li>
                <li className="border-b pb-2">📢 Exams start from 20th Sept</li>
                <li>📢 New Faculty Orientation</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
