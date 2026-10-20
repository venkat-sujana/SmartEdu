//src/app/attendance-form/page.jsx
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Loader2,
  Menu,
  Settings,
  Users,
} from 'lucide-react'
import { getDashboardRouteForLecturerSubject } from '@/utils/lecturerDashboardRoute'

const sidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: Users },
  { label: 'Attendance', icon: ClipboardCheck },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
]


const groupOptions = ['MPC', 'BiPC', 'CEC', 'HEC', 'MLT', 'CET', 'M&AT']
const yearOptions = ['First Year', 'Second Year']

const sessionOptions = ['FN', 'AN']
const subjectOptions = ['English', 'Maths', 'Physics', 'Chemistry', 'Botany', 'Zoology', 'Commerce']

function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar"
        />
      ) : null}

      <aside
        className={[
          'fixed top-0 left-0 z-40 h-screen border-r border-slate-200 bg-white transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <div className={collapsed ? 'hidden' : 'block'}>
            <p className="text-xs tracking-wide text-slate-500 uppercase">OSRA</p>
            <h1 className="text-sm font-semibold text-slate-900">Attendance Form</h1>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {sidebarLinks.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={collapsed ? 'hidden' : 'inline'}>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

function ToggleSwitch({ checked, onChange, color = 'green' }) {
  const bgClass = checked ? (color === 'green' ? 'bg-emerald-600' : 'bg-rose-600') : 'bg-slate-300'

  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
        bgClass,
      ].join(' ')}
      aria-pressed={checked}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

export default function AttendanceFormPage() {
  const router = useRouter()

  const { data: session } = useSession()
  const searchParams = useSearchParams()

  const [mappedGroups, setMappedGroups] = useState([])
const [mappingLoaded, setMappingLoaded] = useState(false)

useEffect(() => {
  if (session?.user?.role !== 'lecturer') {
    setMappingLoaded(true)
    return
  }

  let cancelled = false

  const fetchMappedGroups = async () => {
    try {
      const res = await fetch('/api/lecturer/group-mapping', {
        cache: 'no-store',
      })
      const json = await res.json()

      if (!res.ok || !json?.success || !Array.isArray(json.groups)) {
        throw new Error(json?.message || 'Failed to load group mapping')
      }

      if (!cancelled) {
        setMappedGroups(json.groups)
      }
    } catch (error) {
      if (!cancelled) {
        setMappedGroups([])
        setFeedback({
          type: 'error',
          message: error.message || 'Unable to load your group mapping.',
        })
      }
    } finally {
      if (!cancelled) setMappingLoaded(true)
    }
  }

  fetchMappedGroups()

  return () => {
    cancelled = true
  }
}, [session?.user?.role])

  
const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))

const [selectedGroup, setSelectedGroup] = useState(
  groupOptions[0]
)

const requestedGroups = useMemo(() => {
  return (searchParams.get('groups') || '')
    .split(',')
    .map(group => {
      const value = group.trim().toUpperCase()
      return groupOptions.find(
        option => option.toUpperCase() === value
      )
    })
    .filter(Boolean)
}, [searchParams])


const availableGroupOptions = useMemo(() => {
  if (session?.user?.role === 'lecturer') {
    if (!mappingLoaded) return []

    const mapped = groupOptions.filter(option =>
      mappedGroups.some(
        group => String(group).trim().toUpperCase() === option.toUpperCase()
      )
    )

    return requestedGroups.length
      ? mapped.filter(group => requestedGroups.includes(group))
      : mapped
  }

  return requestedGroups.length
    ? groupOptions.filter(group => requestedGroups.includes(group))
    : groupOptions
}, [session?.user?.role, mappingLoaded, mappedGroups, requestedGroups])



useEffect(() => {
  if (availableGroupOptions.length === 0) {
    setSelectedGroup('')
    return
  }

  if (!availableGroupOptions.includes(selectedGroup)) {
    setSelectedGroup(availableGroupOptions[0])
  }
}, [availableGroupOptions, selectedGroup])


  const [selectedYear, setSelectedYear] = useState(yearOptions[0])

  

  
  const [selectedSession, setSelectedSession] = useState(sessionOptions[0])
  const [selectedSubject, setSelectedSubject] = useState(subjectOptions[0])

  const [students, setStudents] = useState([])
  const [attendanceMap, setAttendanceMap] = useState({})
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', message: '' })

  const todayDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  const dashboardReturnUrl = useMemo(() => {
    const returnUrl = searchParams.get('returnUrl')
    if (returnUrl) return returnUrl
    if (session?.user?.role === 'lecturer') {
      return getDashboardRouteForLecturerSubject(session.user.subject)
    }
    return '/dashboards'
  }, [searchParams, session?.user?.role, session?.user?.subject])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroup) return

if (
  session?.user?.role === 'lecturer' &&
  (!mappingLoaded || !availableGroupOptions.includes(selectedGroup))
) {
  setStudents([])
  setAttendanceMap({})
  setLoadingStudents(false)
  return
}
      try {
        setLoadingStudents(true)
        setFeedback({ type: '', message: '' })

        const res = await fetch(
          `/api/students?group=${encodeURIComponent(selectedGroup)}&status=all&limit=100`,
          {
            cache: 'no-store',
          }
        )
        const json = await res.json()

        if (json?.status === 'success') {
          const yearFiltered = (json.data || []).filter(s => s.yearOfStudy === selectedYear)
          setStudents(yearFiltered)

          const nextMap = {}
          yearFiltered.forEach(student => {
            nextMap[student._id] = ''
          })
          setAttendanceMap(nextMap)
        } else {
          setStudents([])
          setAttendanceMap({})
          setFeedback({ type: 'error', message: json?.message || 'Failed to load students.' })
        }
      } catch {
        setStudents([])
        setAttendanceMap({})
        setFeedback({ type: 'error', message: 'Unable to fetch students.' })
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [
  selectedGroup,
  selectedYear,
  mappingLoaded,
  session?.user?.role,
  mappedGroups,
  availableGroupOptions,
])

  const totalStudents = students.length
  const presentCount = Object.values(attendanceMap).filter(status => status === 'Present').length
  const absentCount = Object.values(attendanceMap).filter(status => status === 'Absent').length
  const naCount = Math.max(totalStudents - presentCount - absentCount, 0)
  const markedCount = presentCount + absentCount
  const attendancePercentage =
    markedCount > 0 ? ((presentCount / markedCount) * 100).toFixed(1) : '0.0'

  const setStudentStatus = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? '' : status,
    }))
  }

  const markAllPresent = () => {
    const next = {}
    students.forEach(student => {
      next[student._id] = 'Present'
    })
    setAttendanceMap(next)
  }

  const markAllAbsent = () => {
    const next = {}
    students.forEach(student => {
      next[student._id] = 'Absent'
    })
    setAttendanceMap(next)
  }

  const clearSelection = () => {
    const next = {}
    students.forEach(student => {
      next[student._id] = ''
    })
    setAttendanceMap(next)
  }

  const submitAttendance = async () => {
    if (
      !selectedDate ||
      !selectedGroup ||
      !selectedYear ||
      !selectedSession ||
      students.length === 0
    ) {
      setFeedback({
        type: 'error',
        message: 'Select date, group, year, session and ensure students are loaded.',
      })
      return
    }

    const payload = students.map(student => ({
      studentId: student._id,
      date: selectedDate,
      ...(attendanceMap[student._id] ? { status: attendanceMap[student._id] } : {}),
      group: selectedGroup,
      yearOfStudy: selectedYear,
      session: selectedSession,
      subject: selectedSubject,
    }))

    try {
      setSubmitting(true)
      setFeedback({ type: '', message: '' })

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json?.status === 'success') {
        setFeedback({
          type: 'success',
          message:
            json.message || 'Attendance submitted successfully. Unselected students remain N/A.',
        })
        router.refresh()
      } else {
        setFeedback({ type: 'error', message: json?.message || 'Failed to submit attendance.' })
      }
    } catch {
      setFeedback({ type: 'error', message: 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const contentPadding = '' // 0 padding on mobile, 64 on desktop to accommodate sidebar

  return (
    <div className="w-full h-screen overflow-hidden bg-slate-100 text-sm">
      

      <div className="flex h-full flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3">
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-between sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="order-3 flex w-full items-center gap-2 sm:order-none sm:ml-auto sm:w-auto sm:rounded-lg sm:border sm:border-slate-200 sm:bg-slate-50 sm:px-3 sm:py-2">
              <Link
                href={dashboardReturnUrl}
                className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700 sm:flex-none"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sm:hidden">Dashboard</span>
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
              <Link className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700 sm:flex-none"
              href="/late-entry">Late Entry</Link>
            </div>

            <div className="ml-auto hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 sm:inline-flex">
              <CalendarDays className="h-4 w-4 text-blue-700" />
              <span>{todayDateLabel}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          <div className="mx-auto w-full max-w-screen-2xl space-y-3 sm:space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(150px,1.2fr)_minmax(150px,1fr)_minmax(140px,1fr)_minmax(140px,1fr)_minmax(120px,0.8fr)_auto] lg:items-end">
                <div>
                  <h1 className="text-base font-semibold text-slate-900">Mark Attendance</h1>
                  <p className="mt-1 text-xs text-slate-500">{todayDateLabel}</p>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Group</label>
                  <select
                    value={selectedGroup}
                    onChange={e => setSelectedGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    {availableGroupOptions.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Year</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">Session</label>
                  <select
                    value={selectedSession}
                    onChange={e => setSelectedSession(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    {sessionOptions.map(value => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

               

                <div className="sm:col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={submitAttendance}
                    disabled={submitting || loadingStudents}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Submit
                  </button>
                </div>
              </div>
{/* 
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={markAllPresent}
                  disabled={students.length === 0}
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  disabled={students.length === 0}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={students.length === 0}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear Selection
                </button>
                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                  Selected: {markedCount} / {totalStudents}
                </span>
              </div> */}

              {feedback.message ? (
                <div
                  className={[
                    'mt-3 rounded-lg border px-3 py-2 text-xs',
                    feedback.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700',
                  ].join(' ')}
                >
                  {feedback.message}
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
              <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                <button
                  type="button"
                  onClick={markAllPresent}
                  disabled={students.length === 0}
                  className="min-h-10 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={markAllAbsent}
                  disabled={students.length === 0}
                  className="min-h-10 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={students.length === 0}
                  className="min-h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Clear Selection
                </button>
                <span className="col-span-2 rounded-lg bg-slate-100 px-3 py-2 text-center text-xs font-medium text-slate-600 sm:col-span-1">
                  Selected: {markedCount} / {totalStudents}
                </span>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full table-fixed text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="w-11 px-2 py-2 text-left font-medium sm:w-14 sm:px-3">S.No</th>
                      <th className="px-2 py-2 text-left font-medium sm:px-3">Student Name</th>
                      <th className="w-16 px-1 py-2 text-center font-medium sm:w-24 sm:px-3">Present</th>
                      <th className="w-16 px-1 py-2 text-center font-medium sm:w-24 sm:px-3">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
                          </span>
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                          No students found for selected group and year.
                        </td>
                      </tr>
                    ) : (
                      students.map((student, index) => {
                        const current = attendanceMap[student._id]
                        return (
                          <tr
                            key={student._id}
                            className="border-b border-slate-100 text-slate-700 transition hover:bg-blue-50/40"
                          >
                            <td className="px-2 py-2 text-center sm:px-3">{index + 1}</td>
                            <td className="px-2 py-2 font-medium sm:px-3">
                              <span className="block truncate">{student.name}</span>
                            </td>
                            <td className="px-1 py-2 text-center sm:px-3">
                              <ToggleSwitch
                                checked={current === 'Present'}
                                color="green"
                                onChange={() => setStudentStatus(student._id, 'Present')}
                              />
                            </td>
                            <td className="px-1 py-2 text-center sm:px-3">
                              <ToggleSwitch
                                checked={current === 'Absent'}
                                color="red"
                                onChange={() => setStudentStatus(student._id, 'Absent')}
                              />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                <div className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs text-slate-500">Total Students</p>
                  <p className="mt-1 font-semibold text-slate-900">{totalStudents}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                  <p className="text-xs text-emerald-700">Present Count</p>
                  <p className="mt-1 font-semibold text-emerald-800">{presentCount}</p>
                </div>
                <div className="rounded-lg bg-rose-50 px-3 py-2">
                  <p className="text-xs text-rose-700">Absent Count</p>
                  <p className="mt-1 font-semibold text-rose-800">{absentCount}</p>
                </div>
                <div className="rounded-lg bg-slate-100 px-3 py-2">
                  <p className="text-xs text-slate-600">N/A Count</p>
                  <p className="mt-1 font-semibold text-slate-800">{naCount}</p>
                </div>
                <div className="col-span-2 rounded-lg bg-blue-50 px-3 py-2 sm:col-span-1">
                  <p className="text-xs text-blue-700">Marked Attendance %</p>
                  <p className="mt-1 font-semibold text-blue-800">{attendancePercentage}%</p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
