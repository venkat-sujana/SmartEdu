"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Users, BookOpen, Calendar } from "lucide-react"
import useSWR from "swr"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function PrincipalDashboard() {
  const today = new Date().toISOString().split("T")[0]

  // 🔹 Students Count
  const { data: studentData } = useSWR("/api/students", fetcher)
  const totalStudents = studentData?.data?.length || 0

  // 🔹 Lecturers Count
  const { data: lecturerData } = useSWR("/api/lecturers", fetcher)
  const totalLecturers = lecturerData?.data?.length || 0

  // 🔹 Today Absentees
  const { data, error, isLoading } = useSWR("/api/attendance/today-absentees", fetcher);
  const absentees = data?.data?.filter((r) => r.status === "Absent") || []

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 hidden md:block">
        <h2 className="text-2xl font-bold text-blue-600 mb-8">OSRA</h2>
        <nav className="space-y-4">
          <a className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <Users className="h-5 w-5" /> Students
          </a>
          <a className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <BookOpen className="h-5 w-5" /> Exams
          </a>
          <a className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <Calendar className="h-5 w-5" /> Attendance
          </a>
          <a className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition">
            <BarChart className="h-5 w-5" /> Reports
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Principal Dashboard</h1>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2">
            + Add Announcement
          </Button>
        </header>

        {/* Stats */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-blue-600">
              {totalStudents}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Lecturers</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-green-600">
              {totalLecturers}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Attendance %</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-purple-600">--%</CardContent>
          </Card>

          <Card className="bg-white shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Exams Scheduled</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-bold text-red-600">--</CardContent>
          </Card>
        </section>

        {/* ✅ New Section - Absentees */}
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
        ) : !data || !data.data ? (
          <p className="text-gray-500">No attendance recorded</p>
        ) : data.data.length === 0 ? (
          <p className="text-green-600">🎉 No Absentees Today</p>
        ) : (
          <ul className="list-disc pl-5">
            {data.data.map((s, i) => (
              <li key={i} className="text-red-600">
                {s.name} ({s.yearOfStudy} - {s.group})
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>



          {/* Right side - Recent Announcements */}
          <Card className="bg-white shadow-md rounded-2xl">
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
