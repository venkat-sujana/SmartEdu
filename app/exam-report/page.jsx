'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  ClipboardCheck,
  ChartColumn,
  CalendarClock,
} from 'lucide-react'

const sidebarMenu = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Unit - 1', icon: ClipboardCheck },
  { label: 'Unit - 2', icon: ClipboardCheck },
  { label: 'Unit - 3', icon: ClipboardCheck },
  { label: 'Unit - 4', icon: ClipboardCheck },
  { label: 'Quarterly', icon: CalendarClock },
  { label: 'Half Yearly', icon: CalendarClock },
  { label: 'Pre-Public - 1', icon: CalendarClock },
  { label: 'Pre-Public - 2', icon: CalendarClock },
  { label: 'Reports', icon: FileText },
]

const UNIT_EXAMS = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4']
const PUBLIC_EXAMS = ['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2']

function formatDate(dateValue) {
  if (!dateValue) return 'N/A'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleDateString('en-CA')
}

function formatAcademicYearLabel(value) {
  if (!value || !value.includes('-')) return value
  const [year, part] = value.split('-')
  if (part === '1') return `First Year (${year})`
  if (part === '2') return `Second Year (${year})`
  return value
}

function isVocational(stream) {
  return ['M&AT', 'CET', 'MLT'].includes(stream || '')
}

function isAbsentMark(mark) {
  const value = String(mark || '').toUpperCase()
  return value === 'A' || value === 'AB'
}

function isReportPass(report) {
  const subjectMarks = report.generalSubjects || report.vocationalSubjects || {}
  const marks = Object.values(subjectMarks)

  if (marks.length === 0) return false
  if (marks.some(isAbsentMark)) return false

  for (const mark of marks) {
    const numericMark = Number(mark)
    if (Number.isNaN(numericMark)) continue

    if (numericMark === 0) return false

    if (UNIT_EXAMS.includes(report.examType) && numericMark < 9) return false
    if (['QUARTERLY', 'HALFYEARLY'].includes(report.examType) && numericMark < 18) return false

    if (['PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(report.examType)) {
      if (isVocational(report.stream) && numericMark < 18) return false
      if (!isVocational(report.stream) && numericMark < 35) return false
    }
  }

  return true
}

function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close menu"
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
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Academic</p>
            <h1 className="text-base font-semibold text-slate-900">Exam Module</h1>
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

        <nav className="space-y-1 px-3 py-3">
          {sidebarMenu.map(item => {
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

function SummaryCard({ title, value, hint, icon: Icon }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{title}</p>
        <Icon className="h-4 w-4 text-blue-700" />
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </article>
  )
}

function UnitCard({ item }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30">
      <h3 className="text-sm font-semibold text-slate-900">{item.unit}</h3>
      <div className="mt-3 space-y-1 text-xs text-slate-600">
        <p>
          Total Students: <span className="font-medium text-slate-800">{item.totalStudents}</span>
        </p>
        <p>
          Pass %: <span className="font-medium text-slate-800">{item.passPercent}</span>
        </p>
        <p>
          Highest Marks: <span className="font-medium text-slate-800">{item.highestMarks}</span>
        </p>
      </div>
      <button
        type="button"
        className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
      >
        View Details
      </button>
    </article>
  )
}

function PublicExamCard({ item }) {
  const badgeClass =
    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'

  return (
    <article className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
        <span className={['rounded-full px-2 py-1 text-[11px] font-medium', badgeClass].join(' ')}>
          {item.status}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Exam Date: <span className="font-medium text-slate-800">{item.examDate}</span>
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Average %: <span className="font-medium text-slate-800">{item.average}</span>
      </p>
    </article>
  )
}

export default function ExamReportPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [academicYear, setAcademicYear] = useState('all')

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/exams', { cache: 'no-store' })
        const data = await res.json()
        if (data?.success) {
          setReports(Array.isArray(data.data) ? data.data : [])
        } else {
          setReports([])
        }
      } catch (error) {
        console.error('Failed to load exam reports', error)
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    loadReports()
  }, [])

  const academicYearOptions = useMemo(() => {
    const options = Array.from(new Set(reports.map(r => r.academicYear).filter(Boolean))).sort((a, b) =>
      b.localeCompare(a)
    )
    return ['all', ...options]
  }, [reports])

  const filteredReports = useMemo(() => {
    if (academicYear === 'all') return reports
    return reports.filter(report => report.academicYear === academicYear)
  }, [reports, academicYear])

  const summaryStats = useMemo(() => {
    const uniqueExamEvents = new Set()
    let upcoming = 0
    let completed = 0
    let passCounter = 0

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    filteredReports.forEach(report => {
      const examDay = formatDate(report.examDate)
      const key = `${report.examType}_${examDay}`

      if (!uniqueExamEvents.has(key)) {
        uniqueExamEvents.add(key)
        const date = new Date(report.examDate)
        if (!Number.isNaN(date.getTime()) && date >= today) upcoming += 1
        else completed += 1
      }

      if (isReportPass(report)) passCounter += 1
    })

    const avgPass =
      filteredReports.length > 0 ? ((passCounter / filteredReports.length) * 100).toFixed(1) : '0.0'

    return {
      totalExamsConducted: uniqueExamEvents.size,
      upcomingExams: upcoming,
      completedExams: completed,
      averagePassPercentage: `${avgPass}%`,
    }
  }, [filteredReports])

  const summaryCards = useMemo(
    () => [
      {
        title: 'Total Exams Conducted',
        value: summaryStats.totalExamsConducted,
        hint: 'Unique exam sessions',
        icon: ChartColumn,
      },
      {
        title: 'Upcoming Exams',
        value: summaryStats.upcomingExams,
        hint: 'Based on exam dates',
        icon: CalendarClock,
      },
      {
        title: 'Completed Exams',
        value: summaryStats.completedExams,
        hint: 'Published schedule entries',
        icon: ClipboardCheck,
      },
      {
        title: 'Average Pass Percentage',
        value: summaryStats.averagePassPercentage,
        hint: 'Across filtered records',
        icon: Users,
      },
    ],
    [summaryStats]
  )

  const unitPerformance = useMemo(() => {
    return UNIT_EXAMS.map(unit => {
      const unitReports = filteredReports.filter(r => r.examType === unit)
      const totalStudents = unitReports.length
      const passStudents = unitReports.filter(isReportPass).length
      const highestMarks = unitReports.reduce((max, row) => Math.max(max, Number(row.total || 0)), 0)
      const maxMarksLabel = unitReports.length > 0 ? `${highestMarks}` : '-'
      const passPercent = totalStudents > 0 ? `${((passStudents / totalStudents) * 100).toFixed(1)}%` : '0.0%'

      return {
        unit: unit.replace('UNIT-', 'Unit - '),
        totalStudents,
        passPercent,
        highestMarks: maxMarksLabel,
      }
    })
  }, [filteredReports])

  const publicExamCards = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return PUBLIC_EXAMS.map(type => {
      const rows = filteredReports.filter(r => r.examType === type)
      if (rows.length === 0) {
        return {
          name: type.replace('HALFYEARLY', 'Half Yearly').replace('-', ' - '),
          examDate: 'N/A',
          average: '0.0%',
          status: 'Upcoming',
        }
      }

      const latestDate = rows.reduce((latest, row) => {
        const dt = new Date(row.examDate)
        return dt > latest ? dt : latest
      }, new Date(rows[0].examDate))

      const passCount = rows.filter(isReportPass).length
      const passAvg = `${((passCount / rows.length) * 100).toFixed(1)}%`

      return {
        name: type
          .replace('HALFYEARLY', 'Half Yearly')
          .replace('QUARTERLY', 'Quarterly')
          .replace('PRE-PUBLIC-1', 'Pre-Public - 1')
          .replace('PRE-PUBLIC-2', 'Pre-Public - 2'),
        examDate: formatDate(latestDate),
        average: passAvg,
        status: latestDate < today ? 'Completed' : 'Upcoming',
      }
    })
  }, [filteredReports])

  const recentExamRows = useMemo(() => {
    const groups = {}

    filteredReports.forEach(row => {
      const dateLabel = formatDate(row.examDate)
      const key = `${row.examType}_${dateLabel}`

      if (!groups[key]) {
        groups[key] = {
          examName: row.examType,
          date: dateLabel,
          totalStudents: 0,
          passCount: 0,
          lastCreatedAt: new Date(row.createdAt || row.examDate || Date.now()),
        }
      }

      groups[key].totalStudents += 1
      if (isReportPass(row)) groups[key].passCount += 1

      const currentCreated = new Date(row.createdAt || row.examDate || Date.now())
      if (currentCreated > groups[key].lastCreatedAt) {
        groups[key].lastCreatedAt = currentCreated
      }
    })

    return Object.values(groups)
      .map((row, index) => ({
        id: index + 1,
        examName: row.examName
          .replace('HALFYEARLY', 'Half Yearly')
          .replace('QUARTERLY', 'Quarterly')
          .replace('PRE-PUBLIC-1', 'Pre-Public - 1')
          .replace('PRE-PUBLIC-2', 'Pre-Public - 2')
          .replace('UNIT-', 'Unit - '),
        date: row.date,
        totalStudents: row.totalStudents,
        passPercent:
          row.totalStudents > 0 ? `${((row.passCount / row.totalStudents) * 100).toFixed(1)}%` : '0.0%',
        sortDate: row.lastCreatedAt,
      }))
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 12)
  }, [filteredReports])

  const contentPadding = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onToggleCollapsed={() => setIsSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className={[contentPadding, 'flex h-full flex-col transition-all duration-300'].join(' ')}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-[220px]">
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500"
              >
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Academic Years' : formatAcademicYearLabel(year)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  AD
                </span>
                <span className="hidden sm:inline">Academic Admin</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Exam Summary</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(card => (
                  <SummaryCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Unit-Wise Performance</h2>
                <button
                  type="button"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  View All Units
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {unitPerformance.map(item => (
                  <UnitCard key={item.unit} item={item} />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Public Exams</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {publicExamCards.map(item => (
                  <PublicExamCard key={item.name} item={item} />
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">Recent Exam Results</h2>
                <span className="text-xs text-slate-500">
                  {loading ? 'Loading...' : `${recentExamRows.length} records`}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                      <th className="px-3 py-2 text-left font-medium">S.No</th>
                      <th className="px-3 py-2 text-left font-medium">Exam Name</th>
                      <th className="px-3 py-2 text-left font-medium">Date</th>
                      <th className="px-3 py-2 text-left font-medium">Total Students</th>
                      <th className="px-3 py-2 text-left font-medium">Pass %</th>
                      <th className="px-3 py-2 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!loading && recentExamRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-500">
                          No exam data available for selected academic year.
                        </td>
                      </tr>
                    ) : (
                      recentExamRows.map((row, idx) => (
                        <tr
                          key={`${row.examName}_${row.date}_${idx}`}
                          className="border-b border-slate-100 text-slate-700 transition hover:bg-blue-50/40"
                        >
                          <td className="px-3 py-2">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{row.examName}</td>
                          <td className="px-3 py-2">{row.date}</td>
                          <td className="px-3 py-2">{row.totalStudents}</td>
                          <td className="px-3 py-2 font-medium text-blue-700">{row.passPercent}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
