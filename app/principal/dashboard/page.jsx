//app/principal/dashboard/page.jsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, Calendar, BarChart } from 'lucide-react'
import useSWR from 'swr'
import AbsenteesTable from '@/app/absentees-table/page'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import React, { useEffect, useState } from "react";
import GroupWiseAttendanceTable from '@/app/components/groupwise-attendance-table/page'
import ActiveLecturersCard from '@/app/components/active-lecturers-card/page'
import AttendanceShortageSummary from '@/app/components/attendance-shortage-summary/page'




const fetcher = url => fetch(url).then(res => res.json())

export default function PrincipalDashboard() {
  const [shortageData, setShortageData] = useState([]);
  const { data: session } = useSession();
  const principal = session?.user;
  const collegeName = principal?.collegeName || 'Your College';

  useEffect(() => {
    fetch('/api/attendance/shortage-summary')
      .then(res => res.json())
      .then(data => setShortageData(data.data || []));
  }, []);

  

  const { data: studentData } = useSWR('/api/students', fetcher);
  const totalStudents = studentData?.data?.length || 0;

  const { data: lecturerData } = useSWR('/api/lecturers', fetcher);
  const totalLecturers = lecturerData?.data?.length || 0;
  
  const { data: activeLecturersData, error: activeLecturersError } = useSWR('/api/lecturers/active', fetcher);



const { data, error, isLoading } = useSWR('/api/attendance/today-absentees', fetcher);
const absentees = data?.absentees || [];




// Fetch today's present students list from API response (assuming it has)
const todaysPresent = data?.presentStudents || []; // ఈ array API లో ఉండాలి

// Calculate present and absent counts for stats cards
const presentCount = todaysPresent.length;
const absentCount = absentees.length;

// Initialize counts
const presentAbsentByYear = {
  firstYear: { present: 0, absent: 0 },
  secondYear: { present: 0, absent: 0 },
};

// Count absent students by year (absentees array)
absentees.forEach(student => {
  if (student.yearOfStudy?.toLowerCase().includes('first')) {
    presentAbsentByYear.firstYear.absent++;
  } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
    presentAbsentByYear.secondYear.absent++;
  }
});

// Count present students by year (todaysPresent array)
todaysPresent.forEach(student => {
  if (student.yearOfStudy?.toLowerCase().includes('first')) {
    presentAbsentByYear.firstYear.present++;
  } else if (student.yearOfStudy?.toLowerCase().includes('second')) {
    presentAbsentByYear.secondYear.present++;
  }
});



  const { data: unit1Failures } = useSWR('/api/exams/failures?examType=UNIT-1', fetcher);
  const { data: unit2Failures } = useSWR('/api/exams/failures?examType=UNIT-2', fetcher);




  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden w-64 bg-white p-6 shadow-md md:block">
        <h2 className="mb-8 text-2xl font-bold text-blue-600">OSRA</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Users className="h-5 w-5" /> Students
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <BookOpen className="h-5 w-5" /> Exams
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <Calendar className="h-5 w-5" /> Attendance
          </Link>
          <Link href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
            <BarChart className="h-5 w-5" /> Reports
          </Link>
        </nav>
      </aside>

      <main className="flex-1 space-y-6 p-6">
        {/* Header */}
        <header className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{collegeName}</h1>
            <p className="text-gray-600">
              Welcome,Principal <span className="font-semibold">{principal?.name}</span>
            </p>
            <p className="text-sm text-gray-500">{principal?.email}</p>
          </div>
          <Button className="rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700">
            + Add Announcement
          </Button>
        </header>




        {/* Profile Card */}
        <Card className="max-w-md rounded-2xl bg-white p-4 shadow-lg">
          <div className="flex items-center space-x-6">
            {principal?.photo ? (
              <img
                src={principal.photo}
                alt="Principal"
                className="h-28 w-28 rounded-full border object-cover shadow"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                No Photo
              </div>
            )}
            <div>
              <p className="text-xl font-semibold">{principal?.name || 'Principal'}</p>
              <p className="text-gray-600">{principal?.email}</p>
              <p className="text-sm text-gray-500">{principal?.collegeName}</p>
            </div>
          </div>
        </Card>

      <ActiveLecturersCard
      lecturers={activeLecturersData?.data || []}
      loading={!activeLecturersData && !activeLecturersError}
      error={activeLecturersError}
      title="Currently Active Lecturers"
    />

        {/* Stats Cards */}
        <section className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
          {[
            {
              title: 'Total Students',
              value: totalStudents,
              color: 'text-blue-600',
            },
            {
              title: 'Lecturers',
              value: totalLecturers,
              color: 'text-green-600',
            },
            {
              title: 'Attendance %',
              value: isLoading
                ? '--%'
                : error || typeof data?.percentage === 'undefined'
                  ? '0%'
                  : `${percentage}%`,
              color: 'text-purple-600',
            },
            {
              title: 'Present Today',
              value: isLoading || error ? '--' : presentCount,
              color: 'text-green-700',
            },
            {
              title: 'Absent Today',
              value: isLoading || error ? '--' : absentCount,
              color: 'text-red-600',
            },
          ].map(({ title, value, color }) => (
            <Card key={title} className="rounded-2xl bg-white shadow-md">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className={`text-3xl font-bold ${color} text-center`}>
                {value}
              </CardContent>
            </Card>
          ))}
        </section>


<section className="grid gap-6 md:grid-cols-4 lg:grid-cols-6">
  <Card className="rounded-2xl bg-white shadow-md">
    <CardHeader><CardTitle>First Year Present</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold text-green-700 text-center">
      {presentAbsentByYear.firstYear.present}
    </CardContent>
  </Card>

  <Card className="rounded-2xl bg-white shadow-md">
    <CardHeader><CardTitle>First Year Absent</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold text-red-600 text-center">
      {presentAbsentByYear.firstYear.absent}
    </CardContent>
  </Card>

  <Card className="rounded-2xl bg-white shadow-md">
    <CardHeader><CardTitle>Second Year Present</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold text-green-700 text-center">
      {presentAbsentByYear.secondYear.present}
    </CardContent>
  </Card>

  <Card className="rounded-2xl bg-white shadow-md">
    <CardHeader><CardTitle>Second Year Absent</CardTitle></CardHeader>
    <CardContent className="text-3xl font-bold text-red-600 text-center">
      {presentAbsentByYear.secondYear.absent}
    </CardContent>
  </Card>
  {/* Existing other cards */}
</section>


        {/* Modules - Attendance and Exams */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Attendance Module */}
          <Card className="rounded-2xl bg-white p-4 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Attendance Overview
              </CardTitle>
            </CardHeader>
            <div className="mt-4">
              <h3 className="mb-2 font-semibold">Today's Group-wise Attendance</h3>
              {session?.user && (
                <GroupWiseAttendanceTable
                  collegeId={session.user.collegeId}
                  collegeName={session.user.collegeName}
                />
              )}
            </div>

            
            <CardContent className="space-y-4">
              {isLoading ? (
                <p>Loading attendance data...</p>
              ) : error ? (
                <p className="text-red-600">Failed to load attendance data</p>
              ) : (
                <>
                 <div className="mt-4">
                    <h3 className="mb-2 font-semibold">Today's Absentees</h3>
                    {absentees.length === 0 ? (
                      <p className="text-green-600">🎉 No Absentees Today</p>
                    ) : (
                      <AbsenteesTable absentees={absentees} />
                    )}
                  </div>
                </>
              )}
            </CardContent>
                  {/* <AttendanceShortageSummary data={shortageData} /> */}
                  <AttendanceShortageSummary data={shortageData} />


          </Card>

          {/* Exam Module */}
          <Card className="rounded-2xl bg-white p-4 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Exams Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Upcoming Exams</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  <li>📅 Quarterly Exam - 15th Sept</li>
                  <li>📅 Unit-III Exam - 10th Oct</li>
                  <li>📅 Half Yearly - 17th Nov</li>
                  <li>📅 Pre-Public 1 - 15th Dec</li>
                  <li>📅 Pre-Public 2 - 21st Jan</li>
                </ul>
              </div>
              {/* You can style unit1Failures, unit2Failures tables here */}
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <section className="grid gap-6 md:grid-cols-3">
          <Link
            href="/attendance-records"
            className="cursor-pointer rounded-xl bg-indigo-100 p-5 text-center shadow-md transition hover:bg-indigo-200"
          >
            <p className="text-xl font-semibold text-indigo-800">📆 Attendance Records</p>
          </Link>
          <Link href="/student-table">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer rounded-xl bg-blue-100 p-5 text-center shadow-md transition hover:bg-blue-200"
            >
              <p className="text-xl font-semibold text-blue-800">📋 View Students</p>
            </motion.div>
          </Link>
          <Link href="/announcements">
            <p className="cursor-pointer rounded-xl bg-green-100 p-5 text-center shadow-md transition hover:bg-green-200">
              <span className="text-xl font-semibold text-green-800">📢 Announcements</span>
            </p>
          </Link>
        </section>
      </main>
    </div>
  )
}
