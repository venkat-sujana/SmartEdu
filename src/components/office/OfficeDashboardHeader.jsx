'use client'

import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { BadgeCheck, Briefcase, Users } from 'lucide-react'

export default function OfficeDashboardHeader({
  todayLabel,
  attendancePercentage = 0,
  todayPresent = 0,
  todayAbsent = 0,
  totalStudents = 0,
  totalLecturers = 0,
  totalGroups = 0,
  loading = false,
}) {
  const { data: session } = useSession()
  const officeUser = session?.user

  const staffName = officeUser?.name || 'Office Staff'
  const collegeName = officeUser?.collegeName || 'Your College'
  const designation = officeUser?.designation || 'Administrative Staff'
  const photo = officeUser?.photo
  const today = todayLabel
    || new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-xl">
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-6 text-white sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-lg">
              {photo ? (
                <Image
                  src={photo}
                  alt={staffName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white/90">
                  {staffName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <p className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.24em] uppercase text-cyan-100">
                Office Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {collegeName}
              </h1>
              <p className="mt-2 text-sm text-slate-200 sm:text-base">
                Administrative overview for attendance follow-up and daily records.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <BadgeCheck className="h-4 w-4 text-cyan-200" />
                  {staffName}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <Briefcase className="h-4 w-4 text-cyan-200" />
                  {designation}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem]">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-100 uppercase">
                Today
              </p>
              <p className="mt-2 text-lg font-semibold text-white">{today}</p>
              <p className="mt-1 text-sm text-slate-300">Live attendance snapshot</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-100 uppercase">
                Attendance
              </p>
              <p className="mt-2 text-3xl font-black text-white">
                {loading ? '...' : `${attendancePercentage}%`}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {todayPresent} present and {todayAbsent} absent
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 bg-slate-50/80 px-6 py-5 sm:grid-cols-2 sm:px-8 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Designation
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{designation}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Total Students
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {loading ? '...' : totalStudents}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
            Active Lecturers
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {loading ? '...' : totalLecturers}
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                Active Groups
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {loading ? '...' : totalGroups}
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
