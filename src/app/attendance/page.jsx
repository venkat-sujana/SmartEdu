'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'

const fetcher = url => fetch(url).then(res => res.json())

const sidebarLinks = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Students', icon: Users },
  { label: 'Attendance', icon: UserCheck },
  { label: 'Reports', icon: FileText },
  { label: 'Settings', icon: Settings },
]

const groups = ['All Groups', 'MPC', 'BiPC', 'CEC', 'HEC', 'MLT']

const fallbackRecords = [
  { date: '2026-03-04', group: 'MPC', total: 220, present: 203, percentage: 92.3 },
  { date: '2026-03-04', group: 'BiPC', total: 210, present: 187, percentage: 89.0 },
  { date: '2026-03-04', group: 'CEC', total: 180, present: 161, percentage: 89.4 },
  { date: '2026-03-04', group: 'HEC', total: 170, present: 150, percentage: 88.2 },
  { date: '2026-03-04', group: 'MLT', total: 160, present: 145, percentage: 90.6 },
]

const fallbackMonthlyChart = [
  { date: 'Feb 26', percent: 88 },
  { date: 'Feb 27', percent: 90 },
  { date: 'Feb 28', percent: 89 },
  { date: 'Mar 01', percent: 91 },
  { date: 'Mar 02', percent: 92 },
  { date: 'Mar 03', percent: 90 },
  { date: 'Mar 04', percent: 93 },
]

function toIso(date) {
  return new Date(date).toISOString().slice(0, 10)
}

function shiftDays(isoDate, days) {
  const value = new Date(isoDate)
  value.setDate(value.getDate() + days)
  return toIso(value)
}

function formatShortDate(isoDate) {
  const dt = new Date(isoDate)
  return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
}

function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile, darkMode }) {
  const asideBg = darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-900 border-slate-800 text-slate-100'

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/45 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <aside
        className={[
          'fixed top-0 left-0 z-40 h-screen border-r transition-all duration-300',
          asideBg,
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className={collapsed ? 'hidden' : 'block'}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">OSRA</p>
            <h1 className="text-lg font-bold text-white">Attendance</h1>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2 px-3 py-4">
          {sidebarLinks.map(link => {
            const Icon = link.icon
            return (
              <button
                key={link.label}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={collapsed ? 'hidden' : 'inline'}>{link.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default function AttendanceDashboardHome() {
  const { data: session } = useSession()
  const collegeId = session?.user?.collegeId

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchText, setSearchText] = useState('')

  const defaultDate = useMemo(() => toIso(new Date()), [])
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [selectedGroup, setSelectedGroup] = useState('All Groups')
  const [appliedFilters, setAppliedFilters] = useState({ date: defaultDate, group: 'All Groups' })

  const rangeStart = useMemo(() => shiftDays(appliedFilters.date, -29), [appliedFilters.date])
  const rangeEnd = appliedFilters.date

  const groupQuery = appliedFilters.group !== 'All Groups' ? `&group=${encodeURIComponent(appliedFilters.group)}` : ''
  const dailySummaryUrl = `/api/attendance/summary/daily-group?start=${rangeStart}&end=${rangeEnd}${groupQuery}`

  const { data: studentsData } = useSWR('/api/students', fetcher)
  const { data: todayData } = useSWR('/api/attendance/today', fetcher)
  const { data: dailySummaryData } = useSWR(dailySummaryUrl, fetcher)

  const { data: todayBreakdown } = useSWR(
    collegeId ? `/api/attendance/today?collegeId=${encodeURIComponent(collegeId)}` : null,
    fetcher
  )

  const currentDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  )

  const totalStudents = studentsData?.totalStudents || studentsData?.data?.length || 0
  const presentToday = todayBreakdown?.total ?? todayData?.summary?.grandPresent ?? 0
  const absentToday = Math.max(totalStudents - presentToday, 0)
  const attendancePercentage =
    todayBreakdown?.percent ??
    (totalStudents > 0 ? Number(((presentToday / totalStudents) * 100).toFixed(1)) : Number(todayData?.summary?.percentage || 0))

  const mergedRecords = useMemo(() => {
    const groupedByDateGroup = {}
    const source = dailySummaryData?.data || {}

    Object.values(source).forEach(records => {
      if (!Array.isArray(records)) return
      records.forEach(item => {
        const key = `${item.date}_${item.group}`
        if (!groupedByDateGroup[key]) {
          groupedByDateGroup[key] = {
            date: item.date,
            group: item.group,
            total: 0,
            present: 0,
          }
        }

        groupedByDateGroup[key].total += Number(item.total || 0)
        groupedByDateGroup[key].present += Number(item.present || 0)
      })
    })

    const normalized = Object.values(groupedByDateGroup)
      .map(item => ({
        ...item,
        percentage: item.total > 0 ? Number(((item.present / item.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return normalized.length > 0 ? normalized : fallbackRecords
  }, [dailySummaryData])

  const monthlyChartData = useMemo(() => {
    const byDate = {}

    mergedRecords.forEach(item => {
      if (!byDate[item.date]) {
        byDate[item.date] = { total: 0, present: 0 }
      }
      byDate[item.date].total += item.total
      byDate[item.date].present += item.present
    })

    const points = Object.entries(byDate)
      .map(([date, value]) => ({
        rawDate: date,
        date: formatShortDate(date),
        percent: value.total > 0 ? Number(((value.present / value.total) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate))

    return points.length > 0 ? points : fallbackMonthlyChart
  }, [mergedRecords])

  const weeklyChartData = useMemo(() => monthlyChartData.slice(-7), [monthlyChartData])

  const visibleRecords = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return mergedRecords.filter(row => {
      if (!q) return true
      return row.group.toLowerCase().includes(q) || row.date.toLowerCase().includes(q)
    })
  }, [mergedRecords, searchText])

  const contentLeftPadding = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  const rootBg = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
  const topbarBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
  const mutedText = isDarkMode ? 'text-slate-300' : 'text-slate-600'
  const headingText = isDarkMode ? 'text-slate-100' : 'text-slate-900'
  const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-slate-50 border-slate-300 text-slate-700'
  const tableHeadBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-50'
  const rowHover = isDarkMode ? 'hover:bg-slate-800/70' : 'hover:bg-slate-50'

  return (
    <div className={['h-screen overflow-hidden transition-colors duration-300', rootBg].join(' ')}>
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onToggleCollapsed={() => setIsSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        darkMode={isDarkMode}
      />

      <div className={[contentLeftPadding, 'flex h-full flex-col transition-all duration-300'].join(' ')}>
        <header className={['sticky top-0 z-20 border-b px-4 py-3 shadow-sm sm:px-6', topbarBg].join(' ')}>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={['rounded-lg border p-2 lg:hidden', isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'].join(' ')}
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-[180px] flex-1 sm:flex-none">
              <p className={['text-xs font-medium uppercase tracking-wide', mutedText].join(' ')}>Today</p>
              <p className={['text-sm font-semibold', headingText].join(' ')}>{currentDateLabel}</p>
            </div>

            <div className="relative min-w-[220px] flex-1">
              <Search className={['pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2', isDarkMode ? 'text-slate-500' : 'text-slate-400'].join(' ')} />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Search by group or date"
                className={['w-full rounded-xl py-2 pr-3 pl-9 text-sm outline-none transition focus:border-blue-500', inputBg].join(' ')}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsDarkMode(prev => !prev)}
              className={[
                'rounded-xl border px-3 py-2 text-sm font-medium transition',
                isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-2">
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setIsProfileOpen(prev => !prev)}
                className={[
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm',
                  isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700',
                ].join(' ')}
              >
                <span className="rounded-full bg-blue-100 p-1.5 text-blue-700">
                  <User className="h-4 w-4" />
                </span>
                <span className="hidden sm:inline">Profile</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen ? (
                <div
                  className={[
                    'absolute right-0 mt-2 w-44 rounded-xl border p-2 shadow-md',
                    isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    className={[
                      'w-full rounded-lg px-3 py-2 text-left text-sm',
                      isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
                    ].join(' ')}
                  >
                    Account
                  </button>
                  <button
                    type="button"
                    className={[
                      'w-full rounded-lg px-3 py-2 text-left text-sm',
                      isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100',
                    ].join(' ')}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-6">
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
                <div className="flex items-center justify-between">
                  <p className={['text-sm font-medium', mutedText].join(' ')}>Total Students</p>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className={['mt-3 text-3xl font-bold', headingText].join(' ')}>{totalStudents}</p>
              </div>

              <div className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
                <div className="flex items-center justify-between">
                  <p className={['text-sm font-medium', mutedText].join(' ')}>Present Today</p>
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <p className={['mt-3 text-3xl font-bold', headingText].join(' ')}>{presentToday}</p>
              </div>

              <div className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
                <div className="flex items-center justify-between">
                  <p className={['text-sm font-medium', mutedText].join(' ')}>Absent Today</p>
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
                <p className={['mt-3 text-3xl font-bold', headingText].join(' ')}>{absentToday}</p>
              </div>

              <div className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
                <div className="flex items-center justify-between">
                  <p className={['text-sm font-medium', mutedText].join(' ')}>Attendance %</p>
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <p className={['mt-3 text-3xl font-bold', headingText].join(' ')}>{attendancePercentage}%</p>
              </div>
            </section>

            <section className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
              <h2 className={['mb-4 text-lg font-semibold', headingText].join(' ')}>Date Filter</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="md:col-span-1">
                  <label className={['mb-1 block text-sm font-medium', mutedText].join(' ')}>Date</label>
                  <div className="relative">
                    <CalendarDays className={['pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2', isDarkMode ? 'text-slate-500' : 'text-slate-400'].join(' ')} />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className={['w-full rounded-xl py-2 pr-3 pl-9 text-sm outline-none focus:border-blue-500', inputBg].join(' ')}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={['mb-1 block text-sm font-medium', mutedText].join(' ')}>Group</label>
                  <select
                    value={selectedGroup}
                    onChange={e => setSelectedGroup(e.target.value)}
                    className={['w-full rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500', inputBg].join(' ')}
                  >
                    {groups.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1 md:self-end">
                  <button
                    type="button"
                    onClick={() => setAppliedFilters({ date: selectedDate, group: selectedGroup })}
                    className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className={['rounded-xl border px-6 py-4 shadow-md xl:col-span-2', cardBg].join(' ')}>
                <h2 className={['mb-4 text-lg font-semibold', headingText].join(' ')}>Attendance Overview</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyChartData} margin={{ top: 12, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        }}
                      />
                      <Area type="monotone" dataKey="percent" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.4} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
                <h3 className={['mb-4 text-lg font-semibold', headingText].join(' ')}>Weekly Attendance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                      <XAxis dataKey="date" tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: isDarkMode ? '#cbd5e1' : '#475569', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          borderRadius: '12px',
                          color: isDarkMode ? '#e2e8f0' : '#0f172a',
                        }}
                      />
                      <Bar dataKey="percent" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className={['rounded-xl border px-6 py-4 shadow-md', cardBg].join(' ')}>
              <h2 className={['mb-4 text-lg font-semibold', headingText].join(' ')}>Recent Attendance Records</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
                  <thead className={tableHeadBg}>
                    <tr>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>S.No</th>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>Date</th>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>Group</th>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>Total</th>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>Present</th>
                      <th className={['px-4 py-3 text-left font-semibold', mutedText].join(' ')}>Percentage</th>
                    </tr>
                  </thead>
                  <tbody className={isDarkMode ? 'divide-y divide-slate-800' : 'divide-y divide-slate-100'}>
                    {visibleRecords.slice(0, 12).map((record, index) => (
                      <tr key={`${record.date}-${record.group}`} className={rowHover}>
                        <td className={['px-4 py-3', mutedText].join(' ')}>{index + 1}</td>
                        <td className={['px-4 py-3', mutedText].join(' ')}>{record.date}</td>
                        <td className={['px-4 py-3', mutedText].join(' ')}>{record.group}</td>
                        <td className={['px-4 py-3', mutedText].join(' ')}>{record.total}</td>
                        <td className={['px-4 py-3', mutedText].join(' ')}>{record.present}</td>
                        <td className="px-4 py-3 font-semibold text-blue-600">{record.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
