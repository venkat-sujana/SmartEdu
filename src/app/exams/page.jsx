// This is a client-side rendered page for displaying exam reports and analytics.
//src/app/exams/page.jsx
'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Users,
  ClipboardCheck,
  ChartColumn,
  CalendarClock,
  Layers3,
  GraduationCap,
  BriefcaseBusiness,
} from 'lucide-react'
import EditExamForm from '../edit-exam-form/page'

const UNIT_EXAMS = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4']

const PUBLIC_EXAMS = ['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2']

const GENERAL_STREAMS = ['MPC', 'BIPC', 'CEC', 'HEC']

const VOCATIONAL_STREAMS = ['M&AT', 'CET', 'MLT']

function isUnitExam(examType) {
  return UNIT_EXAMS.includes(examType)
}

function isPublicExam(examType) {
  return PUBLIC_EXAMS.includes(examType)
}

function normalizeStreamValue(value) {
  const normalized = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')

  if (!normalized) return ''
  if (normalized === 'BIPC') return 'BIPC'
  if (normalized === 'MPC') return 'MPC'
  if (normalized === 'CEC') return 'CEC'
  if (normalized === 'HEC') return 'HEC'
  if (normalized === 'CET') return 'CET'
  if (normalized === 'MLT') return 'MLT'
  if (normalized === 'M&AT' || normalized === 'M@AT' || normalized === 'MANDAT') return 'M&AT'
  return String(value || '').trim()
}

function getStreamCategory(stream) {
  const normalized = normalizeStreamValue(stream)
  if (GENERAL_STREAMS.includes(normalized)) return 'general'
  if (VOCATIONAL_STREAMS.includes(normalized)) return 'vocational'
  return 'other'
}

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

function formatExamLabel(value) {
  return String(value || '')
    .replace('HALFYEARLY', 'Half Yearly')
    .replace('QUARTERLY', 'Quarterly')
    .replace('PRE-PUBLIC-1', 'Pre-Public - 1')
    .replace('PRE-PUBLIC-2', 'Pre-Public - 2')
    .replace('UNIT-', 'Unit - ')
}

function getDetailsFilterBadge(detailsFilter) {
  if (!detailsFilter) return null

  if (detailsFilter.streamCategory === 'general') {
    return {
      label: 'General Stream',
      className: 'bg-blue-100 text-blue-700',
    }
  }

  if (detailsFilter.streamCategory === 'vocational') {
    return {
      label: 'Vocational Stream',
      className: 'bg-emerald-100 text-emerald-700',
    }
  }

  if (detailsFilter.group) {
    return {
      label: detailsFilter.group,
      className: 'bg-violet-100 text-violet-700',
    }
  }

  if (detailsFilter.yearOfStudy) {
    return {
      label: detailsFilter.yearOfStudy,
      className: 'bg-amber-100 text-amber-700',
    }
  }

  if (detailsFilter.examType || detailsFilter.examTypes) {
    return {
      label: detailsFilter.examType ? formatExamLabel(detailsFilter.examType) : 'Multiple Exams',
      className: 'bg-cyan-100 text-cyan-700',
    }
  }

  return null
}

function getSubjectEntries(report) {
  const source = report.generalSubjects?.length ? report.generalSubjects : report.vocationalSubjects

  if (Array.isArray(source)) {
    return source
      .map(subject => [subject?.subject, subject?.marks, subject?.maxMarks])
      .filter(([subject]) => String(subject || '').trim())
  }

  if (source && typeof source === 'object') {
    return Object.entries(source)
  }

  return []
}

function getSubjectMarks(report) {
  return getSubjectEntries(report).map(([, marks]) => marks)
}

function getSubjectTotal(report) {
  return getSubjectMarks(report).reduce((sum, mark) => {
    const numericMark = Number(mark)
    return Number.isFinite(numericMark) ? sum + numericMark : sum
  }, 0)
}

function getSubjectMaxTotal(report) {
  const entries = getSubjectEntries(report)
  if (!entries.length) return 0

  if (isUnitExam(report.examType)) {
    return entries.length * 25
  }

  if (isPublicExam(report.examType)) {
    return entries.length * 50
  }

  return entries.reduce((sum, [, , maxMarks]) => {
    const numericMax = Number(maxMarks)
    return sum + (Number.isFinite(numericMax) && numericMax > 0 ? numericMax : 100)
  }, 0)
}

function getReportPercentage(report) {
  const maxTotal = getSubjectMaxTotal(report)
  if (!maxTotal) return 0
  return (getSubjectTotal(report) / maxTotal) * 100
}

function getAverageReportPercentage(rows) {
  if (!rows.length) return 0
  const total = rows.reduce((sum, row) => sum + getReportPercentage(row), 0)
  return total / rows.length
}

function getStudentName(report) {
  return report?.student?.name || report?.studentId?.name || 'Unknown'
}

function getStudentGroup(report) {
  return report?.student?.group || report?.studentId?.group || report?.stream || '-'
}

function isAbsentMark(mark) {
  const value = String(mark || '').toUpperCase()
  return value === 'A' || value === 'AB'
}

function isReportPass(report) {
  const marks = getSubjectMarks(report)

  if (marks.length === 0) return false
  if (marks.some(isAbsentMark)) return false

  for (const mark of marks) {
    const numericMark = Number(mark)
    if (Number.isNaN(numericMark)) continue

    if (numericMark === 0) return false

    if (isUnitExam(report.examType) && numericMark < 9) return false
    if (isPublicExam(report.examType) && numericMark < 18) return false
  }

  return true
}




function SidebarSection({ title, items, collapsed, activeKey, onSelect, icon: Icon }) {
  if (!items.length) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/8 p-2 backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-cyan-100/75">
        <Icon className="h-3.5 w-3.5" />
        <span className={collapsed ? 'hidden' : 'inline'}>{title}</span>
      </div>

      <div className="space-y-1">
        {items.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item)}
            className={[
              'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition',
              activeKey === item.key
                ? 'bg-cyan-400/20 text-white shadow-sm ring-1 ring-cyan-200/20'
                : 'text-slate-100 hover:bg-white/10 hover:text-white',
            ].join(' ')}
          >
            <span className={collapsed ? 'hidden' : 'inline'}>{item.label}</span>
            <span
              className={[
                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                activeKey === item.key ? 'bg-white/20 text-white' : 'bg-white/12 text-cyan-100/80',
                collapsed ? 'hidden' : 'inline-flex',
              ].join(' ')}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
  activeKey,
  onSelectFilter,
  generalSections,
  vocationalSections,
}) {
  const streamBlocks = [
    {
      title: 'General Stream',
      icon: GraduationCap,
      sections: generalSections,
      key: 'general-stream',
      filter: {
        streamCategory: 'general',
        title: 'General Stream',
      },
    },
    {
      title: 'Vocational Stream',
      icon: BriefcaseBusiness,
      sections: vocationalSections,
      key: 'vocational-stream',
      filter: {
        streamCategory: 'vocational',
        title: 'Vocational Stream',
      },
    },
  ]

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
          'fixed top-0 left-0 z-40 h-screen border-r border-white/60 bg-linear-to-b from-slate-950 via-sky-950 to-cyan-900 text-white transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className={collapsed ? 'hidden' : 'block'}>
            <p className="text-xs font-medium tracking-wide text-cyan-200/80 uppercase">Academic</p>
            <h1 className="text-base font-semibold text-white">Exam Module</h1>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="rounded-lg p-2 text-cyan-100 transition hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-3 overflow-y-auto px-3 py-3">
          <button
            type="button"
            onClick={() =>
              onSelectFilter({
                key: 'dashboard',
                title: 'Complete Exam Dashboard',
              })
            }
            className={[
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
              activeKey === 'dashboard'
                ? 'bg-white/18 text-white shadow-sm ring-1 ring-white/15'
                : 'bg-white/8 text-slate-100 hover:bg-white/12 hover:text-white',
            ].join(' ')}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span className={collapsed ? 'hidden' : 'inline'}>Dashboard</span>
          </button>

          {streamBlocks.map(block => {
            const BlockIcon = block.icon
            return (
              <div key={block.title} className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    onSelectFilter({
                      key: block.key,
                      filter: block.filter,
                    })
                  }
                  className={[
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide transition',
                    activeKey === block.key
                      ? 'bg-white/15 text-cyan-100'
                      : 'text-cyan-100/75 hover:bg-white/10 hover:text-white',
                  ].join(' ')}
                >
                  <BlockIcon className="h-3.5 w-3.5" />
                  <span className={collapsed ? 'hidden' : 'inline'}>{block.title}</span>
                </button>

                {block.sections.map(section => (
                  <SidebarSection
                    key={section.title}
                    title={section.title}
                    items={section.items}
                    collapsed={collapsed}
                    activeKey={activeKey}
                    onSelect={onSelectFilter}
                    icon={section.icon}
                  />
                ))}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}






function SummaryCard({
  title,
  value,
  hint,
  icon: Icon,
  iconClassName = 'text-blue-700',
  iconWrapClassName = 'bg-blue-100',
  titleClassName = 'text-slate-600',
  borderClassName = 'border-white/60 hover:border-blue-200',
  gradientClassName = 'from-white via-sky-50 to-blue-100/70',
}) {
  return (
    <article
      className={[
        'rounded-lg border bg-linear-to-br px-4 py-3 shadow-sm transition hover:-translate-y-0.5',
        borderClassName,
        gradientClassName,
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className={['text-sm font-medium', titleClassName].join(' ')}>{title}</p>
        <span className={['inline-flex rounded-full p-2 shadow-sm', iconWrapClassName].join(' ')}>
          <Icon className={['h-4 w-4', iconClassName].join(' ')} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </article>
  )
}

function StreamSummaryPanel({ title, accentClass, cards, onViewDetails }) {
  return (
    <section className="rounded-xl border border-white/60 bg-linear-to-br from-white via-slate-50 to-sky-100/70 px-4 py-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">Stream-specific exam performance snapshot</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={['rounded-full px-2.5 py-1 text-[11px] font-semibold', accentClass].join(' ')}>
            Summary
          </span>
          <button
            type="button"
            onClick={onViewDetails}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(card => (
          <SummaryCard key={`${title}-${card.title}`} {...card} />
        ))}
      </div>
    </section>
  )
}

function UnitCard({ item, onViewDetails }) {
  return (
    <article className="rounded-lg border border-blue-100 bg-linear-to-br from-white via-sky-50 to-blue-100/80 px-4 py-3 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/30">
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
        onClick={() => onViewDetails({ examType: item.examType, title: item.unit })}
        className="mt-3 rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-700"
      >
        View Details
      </button>
    </article>
  )
}

function PublicExamCard({ item, onViewDetails }) {
  const badgeClass =
    item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'

  return (
    <article className="rounded-lg border border-violet-100 bg-linear-to-br from-white via-violet-50 to-cyan-100/80 px-4 py-3 shadow-sm transition hover:border-violet-300">
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
      <button
        type="button"
        onClick={() => onViewDetails({ examType: item.examType, title: item.name })}
        className="mt-3 rounded-lg bg-linear-to-r from-violet-600 to-cyan-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:from-violet-700 hover:to-cyan-700"
      >
        View Details
      </button>
    </article>
  )
}

export default function ExamReportPage() {
  const searchParams = useSearchParams()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [academicYear, setAcademicYear] = useState('all')
  const [detailsFilter, setDetailsFilter] = useState(null)
  const [activeSidebarKey, setActiveSidebarKey] = useState('dashboard')
  const detailsSectionRef = useRef(null)
  const dashboardReturnUrl = searchParams.get('returnUrl')

  const loadReports = useCallback(async () => {
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
  }, [])

// 3. useEffect లో call మాత్రమే
  useEffect(() => {
    loadReports()
  }, [loadReports])

  useEffect(() => {
    if (!detailsFilter || !detailsSectionRef.current) return

    detailsSectionRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }, [detailsFilter])


  const handleDelete = async examId => {
    if (!confirm('ఈ exam record delete చేయాలా?')) return

    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
      })
      const result = await res.json()

      if (!res.ok || result.success === false) {
        alert(result.message || 'Delete failed')
        return
      }

      alert('✅ Deleted successfully!')
      loadReports()
    } catch (error) {
      alert('❌ Delete error: ' + error.message)
    }
  }

  const [editExamData, setEditExamData] = useState(null)

  const academicYearOptions = useMemo(() => {
    const options = Array.from(new Set(reports.map(r => r.academicYear).filter(Boolean))).sort(
      (a, b) => b.localeCompare(a)
    )
    return ['all', ...options]
  }, [reports])

  const filteredReports = useMemo(() => {
    if (academicYear === 'all') return reports
    return reports.filter(report => report.academicYear === academicYear)
  }, [reports, academicYear])

  const handleSidebarFilterSelect = useCallback(item => {
    setActiveSidebarKey(item.key || 'dashboard')
    setIsMobileSidebarOpen(false)
    setDetailsFilter(item.filter || null)
  }, [])

  const detailRows = useMemo(() => {
    if (!detailsFilter) return []

    return filteredReports
      .filter(report => {
        const streamCategory = getStreamCategory(
          report.stream || report.student?.group || report.studentId?.group
        )
        const normalizedGroup = normalizeStreamValue(
          report.stream || report.student?.group || report.studentId?.group
        )
        const sameType = detailsFilter.examTypes
          ? detailsFilter.examTypes.includes(report.examType)
          : !detailsFilter.examType || report.examType === detailsFilter.examType
        const sameDate = !detailsFilter.date || formatDate(report.examDate) === detailsFilter.date
        const sameGroup = !detailsFilter.group || normalizedGroup === detailsFilter.group
        const sameYear = !detailsFilter.yearOfStudy || report.yearOfStudy === detailsFilter.yearOfStudy
        const sameStreamCategory =
          !detailsFilter.streamCategory || streamCategory === detailsFilter.streamCategory

        return sameType && sameDate && sameGroup && sameYear && sameStreamCategory
      })
      .sort((a, b) => getStudentName(a).localeCompare(getStudentName(b)))
  }, [detailsFilter, filteredReports])

  const detailsFilterBadge = useMemo(() => getDetailsFilterBadge(detailsFilter), [detailsFilter])

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
        iconClassName: 'text-blue-700',
        iconWrapClassName: 'bg-blue-100',
        titleClassName: 'text-blue-700',
        borderClassName: 'border-blue-100 hover:border-blue-300',
        gradientClassName: 'from-white via-sky-50 to-blue-100/80',
      },
      {
        title: 'Upcoming Exams',
        value: summaryStats.upcomingExams,
        hint: 'Based on exam dates',
        icon: CalendarClock,
        iconClassName: 'text-cyan-700',
        iconWrapClassName: 'bg-cyan-100',
        titleClassName: 'text-cyan-700',
        borderClassName: 'border-cyan-100 hover:border-cyan-300',
        gradientClassName: 'from-white via-cyan-50 to-sky-100/80',
      },
      {
        title: 'Completed Exams',
        value: summaryStats.completedExams,
        hint: 'Published schedule entries',
        icon: ClipboardCheck,
        iconClassName: 'text-emerald-700',
        iconWrapClassName: 'bg-emerald-100',
        titleClassName: 'text-emerald-700',
        borderClassName: 'border-emerald-100 hover:border-emerald-300',
        gradientClassName: 'from-white via-emerald-50 to-teal-100/80',
      },
      {
        title: 'Average Pass Percentage',
        value: summaryStats.averagePassPercentage,
        hint: 'Across filtered records',
        icon: Users,
        iconClassName: 'text-violet-700',
        iconWrapClassName: 'bg-violet-100',
        titleClassName: 'text-violet-700',
        borderClassName: 'border-violet-100 hover:border-violet-300',
        gradientClassName: 'from-white via-violet-50 to-fuchsia-100/70',
      },
    ],
    [summaryStats]
  )

  const streamSummarySections = useMemo(() => {
    const buildStreamSummary = streamCategory => {
      const streamRows = filteredReports.filter(report => {
        const category = getStreamCategory(report.stream || report.student?.group || report.studentId?.group)
        return category === streamCategory
      })

      const isGeneral = streamCategory === 'general'
      const theme = isGeneral
        ? {
            titleClassName: 'text-blue-700',
            borderClassName: 'border-blue-100 hover:border-blue-300',
            gradientClassName: 'from-white via-sky-50 to-blue-100/80',
            iconClassName: 'text-blue-700',
            iconWrapClassName: 'bg-blue-100',
          }
        : {
            titleClassName: 'text-emerald-700',
            borderClassName: 'border-emerald-100 hover:border-emerald-300',
            gradientClassName: 'from-white via-emerald-50 to-teal-100/80',
            iconClassName: 'text-emerald-700',
            iconWrapClassName: 'bg-emerald-100',
          }

      const uniqueExamEvents = new Set(
        streamRows.map(report => `${report.examType}_${formatDate(report.examDate)}_${report.yearOfStudy || ''}`)
      )
      const passCount = streamRows.filter(isReportPass).length
      const avgPass = streamRows.length > 0 ? ((passCount / streamRows.length) * 100).toFixed(1) : '0.0'

      return [
        {
          title: 'Total Records',
          value: streamRows.length,
          hint: 'Student exam entries in this stream',
          icon: Users,
          ...theme,
        },
        {
          title: 'Exam Events',
          value: uniqueExamEvents.size,
          hint: 'Unique exam/date/year combinations',
          icon: ChartColumn,
          ...theme,
        },
        {
          title: 'Average Pass %',
          value: `${avgPass}%`,
          hint: 'Pass percentage inside this stream',
          icon: ClipboardCheck,
          ...theme,
        },
        {
          title: 'Average Marks %',
          value: `${getAverageReportPercentage(streamRows).toFixed(1)}%`,
          hint: 'Overall marks average for this stream',
          icon: CalendarClock,
          ...theme,
        },
      ]
    }

    return {
      general: buildStreamSummary('general'),
      vocational: buildStreamSummary('vocational'),
    }
  }, [filteredReports])

  const unitPerformance = useMemo(() => {
    return UNIT_EXAMS.map(unit => {
      const unitReports = filteredReports.filter(r => r.examType === unit)
      const totalStudents = unitReports.length
      const passStudents = unitReports.filter(isReportPass).length
      const highestMarks = unitReports.reduce((max, row) => Math.max(max, getSubjectTotal(row)), 0)
      const maxMarksLabel = unitReports.length > 0 ? `${highestMarks}` : '-'
      const passPercent =
        totalStudents > 0 ? `${((passStudents / totalStudents) * 100).toFixed(1)}%` : '0.0%'

      return {
        examType: unit,
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
          examType: type,
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

      const averageMarksPercentage = `${getAverageReportPercentage(rows).toFixed(1)}%`

      return {
        examType: type,
        name: type
          .replace('HALFYEARLY', 'Half Yearly')
          .replace('QUARTERLY', 'Quarterly')
          .replace('PRE-PUBLIC-1', 'Pre-Public - 1')
          .replace('PRE-PUBLIC-2', 'Pre-Public - 2'),
        examDate: formatDate(latestDate),
        average: averageMarksPercentage,
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
        examType: row.examName,
        examName: row.examName
          .replace('HALFYEARLY', 'Half Yearly')
          .replace('QUARTERLY', 'Quarterly')
          .replace('PRE-PUBLIC-1', 'Pre-Public - 1')
          .replace('PRE-PUBLIC-2', 'Pre-Public - 2')
          .replace('UNIT-', 'Unit - '),
        date: row.date,
        totalStudents: row.totalStudents,
        passPercent:
          row.totalStudents > 0
            ? `${((row.passCount / row.totalStudents) * 100).toFixed(1)}%`
            : '0.0%',
        sortDate: row.lastCreatedAt,
      }))
      .sort((a, b) => b.sortDate - a.sortDate)
      .slice(0, 12)
  }, [filteredReports])

  const streamSidebarSections = useMemo(() => {
    const buildItems = streamCategory => {
      const streamReports = filteredReports.filter(report => {
        const category = getStreamCategory(report.stream || report.student?.group || report.studentId?.group)
        return category === streamCategory
      })

      const yearOrder = { 'First Year': 1, 'Second Year': 2 }

      const yearWiseItems = Object.values(
        streamReports.reduce((acc, report) => {
          const key = report.yearOfStudy || 'Unknown Year'
          if (!acc[key]) {
            acc[key] = {
              key: `${streamCategory}-year-${key}`,
              label: key,
              count: 0,
              filter: {
                streamCategory,
                yearOfStudy: key,
                title: `${streamCategory === 'general' ? 'General' : 'Vocational'} Stream - ${key}`,
              },
            }
          }
          acc[key].count += 1
          return acc
        }, {})
      ).sort((a, b) => (yearOrder[a.label] || 99) - (yearOrder[b.label] || 99))

      const groupWiseItems = Object.values(
        streamReports.reduce((acc, report) => {
          const key = normalizeStreamValue(report.stream || report.student?.group || report.studentId?.group)
          if (!key) return acc
          if (!acc[key]) {
            acc[key] = {
              key: `${streamCategory}-group-${key}`,
              label: key,
              count: 0,
              filter: {
                streamCategory,
                group: key,
                title: `${key} - ${streamCategory === 'general' ? 'General' : 'Vocational'} Stream`,
              },
            }
          }
          acc[key].count += 1
          return acc
        }, {})
      ).sort((a, b) => a.label.localeCompare(b.label))

      const examWiseItems = Object.values(
        streamReports.reduce((acc, report) => {
          const key = report.examType || 'UNKNOWN'
          if (!acc[key]) {
            acc[key] = {
              key: `${streamCategory}-exam-${key}`,
              label: formatExamLabel(key),
              count: 0,
              filter: {
                streamCategory,
                examType: key,
                title: `${streamCategory === 'general' ? 'General' : 'Vocational'} Stream - ${formatExamLabel(key)}`,
              },
            }
          }
          acc[key].count += 1
          return acc
        }, {})
      ).sort((a, b) => a.label.localeCompare(b.label))

      return [
        { title: 'Year Wise', icon: CalendarClock, items: yearWiseItems },
        { title: 'Group Wise', icon: Layers3, items: groupWiseItems },
        { title: 'Exam Wise', icon: FileText, items: examWiseItems },
      ]
    }

    return {
      general: buildItems('general'),
      vocational: buildItems('vocational'),
    }
  }, [filteredReports])

  const contentPadding = isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-sky-100 via-slate-100 to-cyan-100">
      <Sidebar
        collapsed={isSidebarCollapsed}
        mobileOpen={isMobileSidebarOpen}
        onToggleCollapsed={() => setIsSidebarCollapsed(prev => !prev)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeKey={activeSidebarKey}
        onSelectFilter={handleSidebarFilterSelect}
        generalSections={streamSidebarSections.general}
        vocationalSections={streamSidebarSections.vocational}
      />

      <div
        className={[contentPadding, 'flex h-full flex-col transition-all duration-300'].join(' ')}
      >
        <header className="sticky top-0 z-20 border-b border-white/60 bg-linear-to-r from-white via-sky-50 to-cyan-50 px-4 py-3 shadow-sm backdrop-blur">
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
              <label className="mb-1 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={e => {
                  setAcademicYear(e.target.value)
                  setDetailsFilter(null)
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition outline-none focus:border-blue-500"
              >
                {academicYearOptions.map(year => (
                  <option key={year} value={year}>
                    {year === 'all' ? 'All Academic Years' : formatAcademicYearLabel(year)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {dashboardReturnUrl ? (
                <Link
                  href={dashboardReturnUrl}
                  className="mr-2 inline-flex rounded-lg border border-blue-300 bg-linear-to-r from-white to-blue-50 px-3 py-2 text-sm font-medium text-blue-700 shadow-sm transition hover:from-blue-50 hover:to-blue-100"
                >
                  <span className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </span>
                </Link>
              ) : null}
              <Link
                href={
                  dashboardReturnUrl
                    ? `/exams-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
                    : '/exams-form'
                }
                className="mr-2 inline-flex rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-700 hover:to-cyan-700"
              >
                Marks Post Here
              </Link>
              <Link
                href={
                  dashboardReturnUrl
                    ? `/register?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
                    : '/register'
                }
                className="mr-2 inline-flex rounded-lg border border-emerald-300 bg-linear-to-r from-white to-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 shadow-sm transition hover:from-emerald-50 hover:to-emerald-100"
              >
                Add Student
              </Link>
              <Link
                href={
                  dashboardReturnUrl
                    ? `/attendance-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
                    : '/attendance-form'
                }
                className="mr-2 inline-flex rounded-lg border border-indigo-300 bg-linear-to-r from-white to-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:from-indigo-50 hover:to-indigo-100"
              >
                Mark Attendance
              </Link>
            </div>

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setIsProfileOpen(prev => !prev)}
                className="flex items-center gap-2 rounded-lg border border-white/70 bg-linear-to-r from-white to-sky-50 px-3 py-2 text-sm text-slate-700 shadow-sm"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                  AD
                </span>
                <span className="hidden sm:inline">Academic Admin</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border border-white/70 bg-linear-to-br from-white to-sky-50 p-2 shadow-sm">
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

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <StreamSummaryPanel
                title="General Stream Summary"
                accentClass="bg-blue-100 text-blue-700"
                cards={streamSummarySections.general}
                onViewDetails={() =>
                  handleSidebarFilterSelect({
                    key: 'general-stream',
                    filter: {
                      streamCategory: 'general',
                      title: 'General Stream',
                    },
                  })
                }
              />
              <StreamSummaryPanel
                title="Vocational Stream Summary"
                accentClass="bg-emerald-100 text-emerald-700"
                cards={streamSummarySections.vocational}
                onViewDetails={() =>
                  handleSidebarFilterSelect({
                    key: 'vocational-stream',
                    filter: {
                      streamCategory: 'vocational',
                      title: 'Vocational Stream',
                    },
                  })
                }
              />
            </section>

            <section className="rounded-xl border border-blue-100/70 bg-linear-to-br from-white/70 via-sky-50/80 to-blue-100/50 px-3 py-3 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-blue-900">Unit-Wise Performance</h2>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSidebarKey('dashboard')
                    setDetailsFilter({ examTypes: UNIT_EXAMS, title: 'All Unit Exams' })
                  }}
                  className="rounded-lg border border-blue-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                >
                  View All Units
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {unitPerformance.map(item => (
                  <UnitCard key={item.unit} item={item} onViewDetails={setDetailsFilter} />
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-violet-100/70 bg-linear-to-br from-white/70 via-violet-50/80 to-cyan-100/50 px-3 py-3 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-violet-900">Public Exams</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {publicExamCards.map(item => (
                  <PublicExamCard key={item.name} item={item} onViewDetails={setDetailsFilter} />
                ))}
              </div>
            </section>

            {detailsFilter ? (
              <section
                ref={detailsSectionRef}
                className="rounded-lg border border-blue-200/70 bg-linear-to-br from-white via-blue-50 to-cyan-50 px-4 py-3 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {detailsFilter.title || 'Exam Details'}
                      </h2>
                      {detailsFilterBadge ? (
                        <span
                          className={[
                            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                            detailsFilterBadge.className,
                          ].join(' ')}
                        >
                          {detailsFilterBadge.label}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">
                      {detailRows.length} student records
                      {academicYear !== 'all' ? ` - ${formatAcademicYearLabel(academicYear)}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsFilter(null)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                        <th className="px-3 py-2 text-left font-medium">S.No</th>
                        <th className="px-3 py-2 text-left font-medium">Student</th>
                        <th className="px-3 py-2 text-left font-medium">Group</th>
                        <th className="px-3 py-2 text-left font-medium">Year</th>
                        <th className="px-3 py-2 text-left font-medium">Exam</th>
                        <th className="px-3 py-2 text-left font-medium">Date</th>
                        <th className="px-3 py-2 text-left font-medium">Subjects</th>
                        <th className="px-3 py-2 text-left font-medium">Total</th>
                        <th className="px-3 py-2 text-left font-medium">%</th>
                        <th className="px-3 py-2 text-left font-medium">Result</th>
                        <th className="px-3 py-2 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailRows.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-3 py-6 text-center text-sm text-slate-500">
                            No student records found for this selection.
                          </td>
                        </tr>
                      ) : (
                        detailRows.map((row, index) => {
                          const passed = isReportPass(row)
                          return (
                            <tr
                              key={row._id || `${row.studentId}_${row.examType}_${index}`}
                              className="border-b border-slate-100 text-slate-700 transition hover:bg-blue-50/40"
                            >
                              <td className="px-3 py-2">{index + 1}</td>
                              <td className="px-3 py-2 font-medium text-slate-900">
                                {getStudentName(row)}
                              </td>
                              <td className="px-3 py-2">{getStudentGroup(row)}</td>
                              <td className="px-3 py-2">{row.yearOfStudy || '-'}</td>
                              <td className="px-3 py-2">{formatExamLabel(row.examType)}</td>
                              <td className="px-3 py-2">{formatDate(row.examDate)}</td>
                              <td className="max-w-[320px] px-3 py-2 text-xs">
                                {getSubjectEntries(row)
                                  .map(([subject, marks]) => `${subject}: ${marks}`)
                                  .join(', ') || '-'}
                              </td>
                              <td className="px-3 py-2">{getSubjectTotal(row)}</td>
                              <td className="px-3 py-2 font-medium text-blue-700">
                                {getReportPercentage(row).toFixed(1)}%
                              </td>
                              <td className="px-3 py-2">
                                <span
                                  className={[
                                    'rounded-full px-2 py-1 text-xs font-semibold',
                                    passed
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-rose-100 text-rose-700',
                                  ].join(' ')}
                                >
                                  {passed ? 'Pass' : 'Fail'}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => setEditExamData(row)}
                                  className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-blue-700"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(row._id)}
                                  className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}

            <section className="rounded-lg border border-white/70 bg-linear-to-br from-white via-slate-50 to-indigo-100/60 px-4 py-3 shadow-sm">
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
                                onClick={() =>
                                  {
                                    setActiveSidebarKey('dashboard')
                                    setDetailsFilter({
                                      examType: row.examType,
                                      date: row.date,
                                      title: `${row.examName} - ${row.date}`,
                                    })
                                  }
                                }
                                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                              >
                                View
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
          {editExamData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
              <div className="max-h-screen w-full max-w-xl overflow-y-auto rounded-xl">
                <EditExamForm
                  examData={editExamData}
                  onClose={() => setEditExamData(null)}
                  onUpdated={() => {
                    setEditExamData(null)
                    loadReports()
                    setLoading(true)
                    fetch('/api/exams', { cache: 'no-store' })
                      .then(r => r.json())
                      .then(data => {
                        if (data?.success) setReports(data.data || [])
                      })
                      .finally(() => setLoading(false))
                  }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
