//src/app/lecturer/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import {
  GraduationCap,
  Users,
  BookOpen,
  CalendarCheck2,
  UserRound,
  ClipboardCheck,
  AlertTriangle,
  Clock3,
  RefreshCw,
  UserPlus,
  FileText,
  ClipboardList,
  CalendarDays,
  FolderOpen,
  Camera,
  X,
  Loader2,
} from 'lucide-react'

import OverallAttendanceMatrixCard from '@/components/OverallAttendanceMatrixCard/OverallAttendanceMatrixCard'
import TodayAbsenteesTable from '@/components/attendance/TodayAbsenteesTable'
// import OverallStrengthCard from '@/components/dashboard/OverallStrengthCard'
import AttendanceShortageTable from '@/components/attendance-shortage-summary/AttendanceShortageSummary'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'

const fetcher = async (...args) => {
  const res = await fetch(...args)

  if (!res.ok) {
    throw new Error('Unable to load dashboard data')
  }

  return res.json()
}

const GROUP_ROUTE_SEGMENTS = {
  MPC: 'mpc',
  'M&AT': 'mandat',
  CET: 'cet',
  MLT: 'mlt',
  BiPC: 'bipc',
  BIPC: 'bipc',
  CEC: 'cec',
  HEC: 'hec',
  GFC: 'gfc',
}

function getGroupRouteSegment(groupName) {
  return GROUP_ROUTE_SEGMENTS[String(groupName || '').trim()] || null
}

function getGroupQuickActions(groupName) {
  const group = String(groupName || '').trim()
  const returnUrl = '/lecturer/dashboard'

  return [
    {
      label: 'Today’s Attendance',
      icon: CalendarCheck2,
      href: `/attendance-form?groups=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Today’s Absentees',
      icon: UserRound,
      href: '/lecturer/dashboard#todays-absentees',
    },
    {
      label: 'Update Attendance',
      icon: RefreshCw,
      href: '/attendance-edit-form',
    },
    {
      label: 'Monthly Attendance',
      icon: CalendarDays,
      href: '/attendance-records/monthly-summary',
    },
    {
      label: 'Add Student',
      icon: UserPlus,
      href: `/register?group=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Student Records',
      icon: FolderOpen,
      href: '/students',
    },
    {
      label: 'Exam Dashboard',
      icon: FileText,
      href: `/exams?stream=${encodeURIComponent(group)}&returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Assignment Marks',
      icon: ClipboardList,
      href: '/assignments',
    },
    {
      label: 'Post Marks',
      icon: BookOpen,
      href: `/exams-form?returnUrl=${encodeURIComponent(returnUrl)}`,
    },
    {
      label: 'Attendance Calendar',
      icon: CalendarDays,
      href: '/attendance-records/attendance-calendar',
    },
    {
      label: 'Late Entry',
      icon: Clock3,
      href: '/late-entry',
    },
    {
      label: 'Invigilation Duties',
      icon: ClipboardCheck,
      href: '/invigilation/lecturer/duties',
    },

    {
      label: 'Late Entry Register',
      icon: Clock3,
      href: '/late-entry-register',
    },
    {
      label: 'Timetable Dashboard',
      icon: GraduationCap,
      href: '/timetable/dashboard',
    },
    {
      label: 'Lecturer Timetable',
      icon: BookOpen,
      href: '/timetable/lecturer',
    },
    {
      label: 'Fee Dashboard',
      icon: GraduationCap,
      href: getGroupRouteSegment(group)
        ? `/dashboards/${getGroupRouteSegment(group)}/fees`
        : '/fee',
    },
  ]
}

function SectionHeading({ icon: Icon, eyebrow, title, description }) {
  return (
    <div className="mb-4 flex items-start gap-3 sm:mb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 sm:h-11 sm:w-11 sm:rounded-2xl">
        <Icon size={20} className="sm:hidden" />
        <Icon size={21} className="hidden sm:block" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold tracking-[0.16em] text-indigo-600 uppercase">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500 sm:max-w-3xl">{description}</p>
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, description }) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight wrap-break-word text-slate-900 sm:mt-3 sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
          <Icon size={22} />
        </div>
      </div>

      {description && <p className="mt-3 text-xs leading-5 text-slate-500">{description}</p>}
    </div>
  )
}

function SectionPanel({ children, className = '' }) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </section>
  )
}

export default function LecturerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [collegeName, setCollegeName] = useState('')
  const [studentCount, setStudentCount] = useState(0)
  const [studentCountLoading, setStudentCountLoading] = useState(true)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)

  const user = session?.user || {}
  const collegeId = user.collegeId
  const currentPhoto = user.photo || null
  // Load all groups mapped to the signed-in lecturer
  const {
    data: groupMappingData,
    error: groupMappingError,
    isLoading: groupsLoading,
  } = useSWR(status === 'authenticated' ? '/api/lecturer/group-mapping' : null, fetcher)

  const { data: shortageApiData, error: shortageError } = useSWR(
    status === 'authenticated' ? '/api/attendance/shortage-summary' : null,
    fetcher
  )

  const {
    data: absApiData,
    error: attendanceError,
    isLoading: attendanceLoading,
  } = useSWR(status === 'authenticated' ? '/api/attendance/today-absentees' : null, fetcher)

  const {
    data: consecutiveData,
    error: consecutiveError,
    isLoading: consecutiveLoading,
  } = useSWR(
    status === 'authenticated' && collegeId
      ? `/api/attendance/consecutive-absentees?collegeId=${encodeURIComponent(collegeId)}`
      : null,
    fetcher
  )

  const shortageData = shortageApiData?.data || []
  const sessionWisePresent = absApiData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absApiData?.sessionWiseAbsentees || {}
  const consecutiveAbsentees = consecutiveData?.absentees || []
  const mappedGroups = Array.isArray(groupMappingData?.groups) ? groupMappingData.groups : []

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/lecturer/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !collegeId) return

    let cancelled = false

    const loadCollegeName = async () => {
      try {
        const res = await fetch(`/api/colleges/${encodeURIComponent(collegeId)}`)
        if (!res.ok) return

        const data = await res.json()

        if (!cancelled && data?.name) {
          setCollegeName(data.name)
        }
      } catch (error) {
        console.error('College name fetch error:', error)
      }
    }

    const loadStudentCount = async () => {
      setStudentCountLoading(true)

      try {
        const params = new URLSearchParams({ collegeId })

        if (user.subject) {
          params.set('subject', user.subject)
        }

        const res = await fetch(`/api/students/count?${params.toString()}`)
        if (!res.ok) throw new Error('Unable to load student count')

        const data = await res.json()

        if (!cancelled && data?.count !== undefined) {
          setStudentCount(data.count)
        }
      } catch (error) {
        console.error('Student count fetch error:', error)
      } finally {
        if (!cancelled) {
          setStudentCountLoading(false)
        }
      }
    }

    loadCollegeName()
    loadStudentCount()

    return () => {
      cancelled = true
    }
  }, [status, collegeId, user.subject])

  const handlePhotoSelect = event => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = e => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handlePhotoUpload = async () => {
    if (!photoPreview) return

    setPhotoUploading(true)
    try {
      const formData = new FormData()
      const response = await fetch('/api/lecturer/photo', {
        method: 'POST',
        body: (() => {
          const byteString = atob(photoPreview.split(',')[1])
          const mimeString = photoPreview.split(',')[0].split(':')[1].split(';')[0]
          const ab = new ArrayBuffer(byteString.length)
          const ia = new Uint8Array(ab)
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i)
          }
          const blob = new Blob([ab], { type: mimeString })
          formData.append('photo', blob, 'photo.jpg')
          return formData
        })(),
      })

      const data = await response.json()
      if (data.success) {
        setPhotoPreview(null)
        router.refresh()
      } else {
        alert(data.message || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('Failed to upload photo')
    } finally {
      setPhotoUploading(false)
    }
  }

  const handlePhotoRemove = async () => {
    setPhotoUploading(true)
    try {
      const response = await fetch('/api/lecturer/photo', { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        router.refresh()
      } else {
        alert(data.message || 'Failed to remove photo')
      }
    } catch (error) {
      console.error('Photo remove error:', error)
      alert('Failed to remove photo')
    } finally {
      setPhotoUploading(false)
    }
  }

  const handleDragOver = e => {
    e.preventDefault()
    e.currentTarget.classList.add('ring-2', 'ring-indigo-400', 'bg-indigo-50')
  }

  const handleDragLeave = e => {
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50')
  }

  const handleDrop = e => {
    e.preventDefault()
    e.currentTarget.classList.remove('ring-2', 'ring-indigo-400', 'bg-indigo-50')
    const file = e.dataTransfer.files[0]
    if (file) {
      const event = { target: { files: [file] } }
      handlePhotoSelect(event)
    }
  }

  if (status === 'loading' || (status === 'authenticated' && !collegeId)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <RefreshCw className="animate-spin text-indigo-600" size={22} />
          <div>
            <p className="font-semibold text-slate-800">Loading dashboard</p>
            <p className="mt-1 text-sm text-slate-500">Preparing your college overview...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const lecturerName = user.name || user.lecturerName || 'Lecturer'
  const subjectName = user.subject || 'Assigned subject'

  return (
    <main className="min-h-screen bg-slate-50/90 px-3 py-4 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-5 sm:space-y-7">
        {/* Dashboard header */}
        <header className="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-slate-950 via-indigo-950 to-indigo-800 px-4 py-6 text-white shadow-xl sm:rounded-3xl sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -top-20 -right-12 -z-10 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="pointer-events-none absolute right-1/3 -bottom-24 -z-10 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner backdrop-blur sm:h-14 sm:w-14 sm:rounded-2xl">
                <GraduationCap className="h-6 w-6 sm:h-[30px] sm:w-[30px]" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold tracking-[0.2em] text-indigo-200 uppercase">
                  OSRA Lecturer Portal
                </p>

                <h1 className="mt-2 text-xl font-extrabold tracking-tight sm:text-3xl">
                  Lecturer Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 wrap-break-word text-indigo-100 sm:text-base">
                  {collegeName || user.collegeName || 'Your College'}
                </p>
              </div>
            </div>

            <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm sm:min-w-64 sm:p-4 lg:w-auto">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0" role="region" aria-label="Profile photo">
                  {photoPreview ? (
                    <Image
                      src={photoPreview}
                      alt={`${lecturerName}'s photo preview`}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                    />
                  ) : currentPhoto ? (
                    <Image
                      src={currentPhoto}
                      alt={`${lecturerName}'s photo`}
                      width={64}
                      height={64}
                      unoptimized
                      className="h-16 w-16 rounded-full object-cover ring-2 ring-white/30"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
                      <UserRound size={28} className="text-white/70" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="photo-upload"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="sr-only"
                    disabled={photoUploading}
                  />
                  {!photoUploading && !photoPreview && (
                    <label
                      htmlFor="photo-upload"
                      className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Camera size={24} className="text-white" />
                    </label>
                  )}
                  {(photoPreview || photoUploading) && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-full bg-black/60">
                      {photoUploading ? (
                        <Loader2 size={24} className="animate-spin text-white" />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handlePhotoUpload}
                            disabled={photoUploading}
                            className="rounded-full bg-green-500 p-2 text-white transition-colors hover:bg-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none"
                            aria-label="Save photo"
                          >
                            <ClipboardCheck size={20} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPhotoPreview(null)}
                            disabled={photoUploading}
                            className="rounded-full bg-red-500 p-2 text-white transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
                            aria-label="Cancel photo upload"
                          >
                            <X size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {currentPhoto && !photoPreview && !photoUploading && (
                    <button
                      type="button"
                      onClick={handlePhotoRemove}
                      disabled={photoUploading}
                      className="absolute -right-1 -bottom-1 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
                      aria-label="Remove photo"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-indigo-200">Signed in as</p>
                  <p className="mt-1 truncate font-bold text-white">{lecturerName}</p>
                  <p className="mt-1 truncate text-sm text-indigo-100">{subjectName}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <SectionPanel>
          {groupsLoading ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              Loading your mapped groups...
            </p>
          ) : groupMappingError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Unable to load your mapped groups. Please refresh and try again.
            </p>
          ) : mappedGroups.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
              No groups are currently mapped to your lecturer account.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
              {mappedGroups.map(groupName => (
                <div
                  key={groupName}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                      <Users size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{groupName}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 min-[460px]:grid-cols-2">
                    {getGroupQuickActions(groupName).map(action => {
                      const Icon = action.icon
                      return (
                        <a
                          key={action.label}
                          href={action.href}
                          className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 sm:min-h-11 sm:py-2.5 sm:text-sm"
                        >
                          <Icon size={17} className="shrink-0" />
                          <span>{action.label}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionPanel>

        <section>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              icon={Users}
              label="Total Student Strength"
              value={studentCountLoading ? '' : studentCount}
            />

            <MetricCard
              icon={CalendarCheck2}
              label="Attendance Status"
              value={attendanceLoading ? 'Loading' : attendanceError ? 'Unavailable' : 'Updated'}
              description={attendanceError ? 'Attendance summary could not be loaded.' : ''}
            />

            <MetricCard icon={BookOpen} label="Teaching Subject" value={subjectName} />
          </div>
        </section>

        {/* Mapped group attendance cards */}
        <SectionPanel>
          <SectionHeading icon={Users} eyebrow="Group-wise monitoring" />

          <OverallAttendanceMatrixCard />
        </SectionPanel>

        {/* Today's absentees */}
        <SectionPanel>
          <div id="todays-absentees" className="scroll-mt-6">
            <SectionHeading icon={UserRound} eyebrow="Daily monitoring" title="Todays Absentees" />

            <TodayAbsenteesTable collegeId={collegeId} header={true} />
          </div>
        </SectionPanel>

        {/* Consecutive absentees */}
        <SectionPanel>
          <SectionHeading
            icon={Clock3}
            eyebrow="Student follow-up"
            title="Long Absentees"
            description="Review repeated absences and identify students who may require attention."
          />

          {consecutiveError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Long absentee information could not be loaded.
            </div>
          ) : (
            <ConsecutiveAbsenteesCard data={consecutiveAbsentees} loading={consecutiveLoading} />
          )}
        </SectionPanel>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-2 py-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p> {new Date().getFullYear()} OSRA System. All rights reserved.</p>
          <p className="font-medium text-slate-400">
            Lecturer Portal · Attendance & Student Monitoring
          </p>
        </footer>
      </div>
    </main>
  )
}
