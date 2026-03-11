'use client'

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: Users },
  { label: 'Attendance', icon: ClipboardCheck },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
]

const monthOptions = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const yearOptions = [2025, 2026, 2027]
const groupOptions = ['MPC', 'BiPC', 'CEC', 'HEC', 'MLT', 'CET', 'M&AT']
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
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
            <p className="text-xs uppercase tracking-wide text-slate-500">Academic</p>
            <h1 className="text-sm font-semibold text-slate-900">Monthly Calendar</h1>
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

function getAttendanceColor(percent, hasData) {
  if (!hasData) return 'bg-slate-100 border-slate-200 text-slate-500'
  if (percent >= 75) return 'bg-emerald-50 border-emerald-200 text-emerald-800'
  if (percent >= 50) return 'bg-amber-50 border-amber-200 text-amber-800'
  return 'bg-rose-50 border-rose-200 text-rose-800'
}

function createDummyStudents(day, group) {
  const names = [
    'Aarav',
    'Nitya',
    'Harsha',
    'Keerthi',
    'Charan',
    'Meghana',
    'Rahul',
    'Pranav',
    'Divya',
    'Sanjay',
  ]

  return names.slice(0, 8).map((name, index) => {
    const present = (day + index) % 3 !== 0
    return {
      id: `${day}-${index + 1}`,
      name: `${name} ${group}`,
      rollNo: `${group}-${String(index + 1).padStart(3, '0')}`,
      status: present ? 'Present' : 'Absent',
    }
  })
}

function buildCalendarData(monthName, year, group) {
  const monthIndex = monthOptions.indexOf(monthName)
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const firstDay = new Date(year, monthIndex, 1).getDay()

  const cells = []

  for (let i = 0; i < firstDay; i += 1) {
    cells.push({ empty: true, id: `empty-start-${i}` })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const noData = day % 9 === 0
    const totalStudents = noData ? 0 : 56 + (day % 8)
    const presentCount = noData ? 0 : Math.max(0, totalStudents - ((day * 3) % 20))
    const absentCount = noData ? 0 : totalStudents - presentCount
    const percent = totalStudents > 0 ? Number(((presentCount / totalStudents) * 100).toFixed(1)) : 0
    const students = noData ? [] : createDummyStudents(day, group)

    cells.push({
      id: `day-${day}`,
      day,
      dateLabel: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      presentCount,
      absentCount,
      percent,
      totalStudents,
      hasData: !noData,
      students,
    })
  }

  while (cells.length % 7 !== 0) {
    cells.push({ empty: true, id: `empty-end-${cells.length}` })
  }

  return cells
}

export default function MonthlySummaryPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[now.getMonth()])
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedGroup, setSelectedGroup] = useState(groupOptions[0])
  const [selectedDate, setSelectedDate] = useState(null)

  const calendarData = useMemo(
    () => buildCalendarData(selectedMonth, selectedYear, selectedGroup),
    [selectedMonth, selectedYear, selectedGroup]
  )

  const filledDays = calendarData.filter(item => !item.empty && item.hasData)
  const monthAverage =
    filledDays.length > 0
      ? (filledDays.reduce((sum, day) => sum + day.percent, 0) / filledDays.length).toFixed(1)
      : '0.0'
  const totalWorkingDays = filledDays.length
  const bestDay = filledDays.reduce((best, day) => (day.percent > (best?.percent ?? -1) ? day : best), null)
  const lowestDay = filledDays.reduce((low, day) => (day.percent < (low?.percent ?? 101) ? day : low), null)

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
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
              <CalendarDays className="h-4 w-4 text-blue-700" />
              <span>Monthly Attendance</span>
            </div>

            <div className="ml-auto flex flex-wrap gap-2">
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {monthOptions.map(month => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              >
                {groupOptions.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto w-full max-w-7xl space-y-4">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Month Average %</p>
                <p className="mt-1 text-lg font-semibold text-blue-700">{monthAverage}%</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Total Working Days</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{totalWorkingDays}</p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Best Attendance Day</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {bestDay ? `${bestDay.dateLabel} (${bestDay.percent}%)` : 'N/A'}
                </p>
              </article>
              <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500">Lowest Attendance Day</p>
                <p className="mt-1 text-sm font-semibold text-rose-700">
                  {lowestDay ? `${lowestDay.dateLabel} (${lowestDay.percent}%)` : 'N/A'}
                </p>
              </article>
            </section>

            <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
              Historical context: attendance reports use the year saved in each attendance record.
            </p>

            <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="mb-2 hidden grid-cols-7 gap-2 md:grid">
                {weekDays.map(day => (
                  <div key={day} className="rounded-lg bg-slate-100 px-2 py-2 text-center text-xs font-medium text-slate-600">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
                {calendarData.map(item => {
                  if (item.empty) {
                    return <div key={item.id} className="hidden md:block" />
                  }

                  const colorClass = getAttendanceColor(item.percent, item.hasData)

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDate(item)}
                      className={[
                        'group relative min-h-28 rounded-lg border px-2 py-2 text-left shadow-sm transition hover:-translate-y-0.5',
                        colorClass,
                      ].join(' ')}
                    >
                      <p className="text-right text-[11px] font-medium">{item.day}</p>
                      <div className="mt-1 space-y-1 text-[11px]">
                        <p>Present: <span className="font-semibold">{item.presentCount}</span></p>
                        <p>Absent: <span className="font-semibold">{item.absentCount}</span></p>
                        <p>Attendance: <span className="font-semibold">{item.hasData ? `${item.percent}%` : 'No data'}</span></p>
                      </div>

                      <div className="pointer-events-none absolute top-2 left-2 z-20 hidden w-44 rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700 shadow-sm group-hover:block">
                        <p className="font-semibold text-slate-900">{item.dateLabel}</p>
                        <p>Total: {item.totalStudents}</p>
                        <p>Present: {item.presentCount}</p>
                        <p>Absent: {item.absentCount}</p>
                        <p>Attendance: {item.hasData ? `${item.percent}%` : 'No data'}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>
          </div>
        </main>
      </div>

      {selectedDate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Attendance Details - {selectedDate.dateLabel}</h3>
                <p className="text-xs text-slate-500">Group: {selectedGroup}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-slate-200 px-4 py-3 text-xs">
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                Present: <span className="font-semibold">{selectedDate.presentCount}</span>
              </div>
              <div className="rounded-lg bg-rose-50 px-3 py-2 text-rose-700">
                Absent: <span className="font-semibold">{selectedDate.absentCount}</span>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto px-4 py-3">
              {selectedDate.students.length === 0 ? (
                <p className="text-xs text-slate-500">No student-wise data for this date.</p>
              ) : (
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="px-2 py-2 text-left font-medium">S.No</th>
                      <th className="px-2 py-2 text-left font-medium">Student Name</th>
                      <th className="px-2 py-2 text-left font-medium">Roll No</th>
                      <th className="px-2 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDate.students.map((student, index) => (
                      <tr key={student.id} className="border-b border-slate-100">
                        <td className="px-2 py-2">{index + 1}</td>
                        <td className="px-2 py-2">{student.name}</td>
                        <td className="px-2 py-2">{student.rollNo}</td>
                        <td className="px-2 py-2">
                          <span
                            className={[
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              student.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700',
                            ].join(' ')}
                          >
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
