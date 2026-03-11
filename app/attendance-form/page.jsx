'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Loader2,
  Menu,
  Settings,
  Users,
} from 'lucide-react'

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
            <p className="text-xs uppercase tracking-wide text-slate-500">OSRA</p>
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
      className={['relative inline-flex h-6 w-11 items-center rounded-full transition', bgClass].join(' ')}
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
  const { data: session } = useSession()

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedGroup, setSelectedGroup] = useState(groupOptions[0])
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

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedGroup) return
      try {
        setLoadingStudents(true)
        setFeedback({ type: '', message: '' })

        const res = await fetch(`/api/students?group=${encodeURIComponent(selectedGroup)}`, {
          cache: 'no-store',
        })
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
      } catch (error) {
        setStudents([])
        setAttendanceMap({})
        setFeedback({ type: 'error', message: 'Unable to fetch students.' })
      } finally {
        setLoadingStudents(false)
      }
    }

    fetchStudents()
  }, [selectedGroup, selectedYear])

  const totalStudents = students.length
  const presentCount = Object.values(attendanceMap).filter(status => status === 'Present').length
  const absentCount = Object.values(attendanceMap).filter(status => status === 'Absent').length
  const attendancePercentage = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0.0'

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
    if (!selectedDate || !selectedGroup || !selectedYear || !selectedSession || students.length === 0) {
      setFeedback({ type: 'error', message: 'Select date, group, year, session and ensure students are loaded.' })
      return
    }

    const payload = students.map(student => ({
      studentId: student._id,
      date: selectedDate,
      status: attendanceMap[student._id] || 'Absent',
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
        setFeedback({ type: 'success', message: json.message || 'Attendance submitted successfully.' })
      } else {
        setFeedback({ type: 'error', message: json?.message || 'Failed to submit attendance.' })
      }
    } catch (error) {
      setFeedback({ type: 'error', message: 'Submission failed. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const contentPadding = sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-sm">
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapsed={() => setSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className={[contentPadding, 'flex h-full flex-col transition-all duration-300'].join(' ')}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
              <CalendarDays className="h-4 w-4 text-blue-700" />
              <span>{todayDateLabel}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto w-full max-w-6xl space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[150px]">
                  <h1 className="text-base font-semibold text-slate-900">Mark Attendance</h1>
                  <p className="mt-1 text-xs text-slate-500">{todayDateLabel}</p>
                </div>

                <div className="min-w-[150px]">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="min-w-[140px] flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Group</label>
                  <select
                    value={selectedGroup}
                    onChange={e => setSelectedGroup(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    {groupOptions.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-[140px] flex-1">
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

                <div className="min-w-[120px] flex-1">
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

                <div className="min-w-[150px] flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
                  >
                    {subjectOptions.map(subject => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={submitAttendance}
                    disabled={submitting || loadingStudents}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Submit
                  </button>
                </div>
              </div>

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

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center gap-2">
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
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="px-3 py-2 text-left font-medium">S.No</th>
                      <th className="px-3 py-2 text-left font-medium">Student Name</th>
                      <th className="px-3 py-2 text-left font-medium">Roll Number</th>
                      <th className="px-3 py-2 text-center font-medium">Present</th>
                      <th className="px-3 py-2 text-center font-medium">Absent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading students...
                          </span>
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
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
                            <td className="px-3 py-2">{index + 1}</td>
                            <td className="px-3 py-2 font-medium">{student.name}</td>
                            <td className="px-3 py-2">{student.admissionNo || student.rollNumber || 'N/A'}</td>
                            <td className="px-3 py-2 text-center">
                              <ToggleSwitch
                                checked={current === 'Present'}
                                color="green"
                                onChange={() => setStudentStatus(student._id, 'Present')}
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
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

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="rounded-lg bg-blue-50 px-3 py-2">
                  <p className="text-xs text-blue-700">Attendance Percentage</p>
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
