//app/principal/dashboard/page.jsx
'use client'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useMemo, useState, useEffect } from 'react'
import ActiveLecturersCard from '@/components/dashboard/ActiveLecturersCard'
import AttendanceSmsHistoryCard from '@/components/attendance/AttendanceSmsHistoryCard'
import AnalyticsDashboard from '@/app/invigilation/components/AnalyticsDashboard'
import {
  FileSpreadsheet,
  GraduationCap,
  LayoutGrid,
  Percent,
  Upload,
  UserRoundCheck,
  Users,
  Download,
  FileText,
} from 'lucide-react'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'
import AttendanceSmsCard from './AttendanceSmsCard'
import PromotionCard from './PromotionCard'
import OverviewStatCard from './OverviewStatCard'
import AttendanceOverviewTable from './AttendanceOverviewTable'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
import AttendanceHealthScoreCard from '@/components/attendance/cards/AttendanceHealthScoreCard'
import GroupDashboard from '@/app/dashboard/page'
import AttendanceTrendCard from '@/components/attendance/cards/AttendanceTrendCard'
import GroupPerformanceCard from '@/components/attendance/cards/GroupPerformanceCard'
import AttendanceInsightsCard from '@/components/attendance/cards/AttendanceInsightsCard'
import AttendanceAlertsCard from '@/components/attendance/cards/AttendanceAlertsCard'
import { generateAttendanceAlerts } from '@/utils/generateAttendanceAlerts'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const fetcher = url => fetch(url).then(res => res.json())

const UNIT_EXAMS = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4']
const PUBLIC_EXAMS = ['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2']
const EXAM_TYPE_ORDER = [...UNIT_EXAMS, ...PUBLIC_EXAMS]

function formatExamLabel(value) {
  return value || 'Unknown Exam'
}

function isUnitExam(examType) {
  return UNIT_EXAMS.includes(examType)
}

function isPublicExam(examType) {
  return PUBLIC_EXAMS.includes(examType)
}

function getAllMarks(report) {
  return [...(report?.generalSubjects || []), ...(report?.vocationalSubjects || [])]
}

function getStudentKey(report) {
  return String(
    report?.studentId?._id || report?.studentId || report?.student?._id || report?._id || ''
  )
}

function isAbsentMark(mark) {
  const value = String(mark || '')
    .trim()
    .toUpperCase()
  return value === 'A' || value === 'AB'
}

function isReportAbsent(report) {
  const subjects = getAllMarks(report)
  return subjects.length > 0 && subjects.every(subject => isAbsentMark(subject?.marks))
}

function isReportPass(report) {
  const subjects = getAllMarks(report)
  if (subjects.length === 0) return false
  if (isReportAbsent(report)) return false

  return subjects.every(subject => {
    const numericMark = typeof subject?.marks === 'number' ? subject.marks : Number(subject?.marks)

    if (!Number.isFinite(numericMark)) return false
    if (isUnitExam(report.examType) && numericMark < 9) return false
    if (isPublicExam(report.examType) && numericMark < 18) return false
    return numericMark >= 0
  })
}

function getSubjectWisePassRows(reports) {
  const subjectMap = new Map()

  reports.forEach(report => {
    getAllMarks(report).forEach(subjectEntry => {
      const subjectName = String(subjectEntry?.subject || '').trim()
      if (!subjectName) return

      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, {
          subject: subjectName,
          appeared: 0,
          pass: 0,
          fail: 0,
          absent: 0,
        })
      }

      const row = subjectMap.get(subjectName)
      const mark = subjectEntry?.marks

      if (isAbsentMark(mark)) {
        row.absent += 1
        return
      }

      row.appeared += 1

      const numericMark = typeof mark === 'number' ? mark : Number(mark)

      let passed = Number.isFinite(numericMark)

      if (passed && isUnitExam(report.examType)) {
        passed = numericMark >= 9
      }

      if (passed && isPublicExam(report.examType)) {
        passed = numericMark >= 18
      }

      if (passed) {
        row.pass += 1
      } else {
        row.fail += 1
      }
    })
  })

  return Array.from(subjectMap.values())
    .map(row => ({
      ...row,
      passPercent: row.appeared > 0 ? `${((row.pass / row.appeared) * 100).toFixed(1)}%` : '0.0%',
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject))
}

function getSubjectWisePassRowsByExam(reports) {
  const reportsByExam = reports.reduce((groups, report) => {
    const examType = String(report?.examType || '').trim()
    if (!examType) return groups

    if (!groups.has(examType)) groups.set(examType, [])
    groups.get(examType).push(report)
    return groups
  }, new Map())

  return Array.from(reportsByExam.entries())
    .sort(([firstExam], [secondExam]) => {
      const firstIndex = EXAM_TYPE_ORDER.indexOf(firstExam)
      const secondIndex = EXAM_TYPE_ORDER.indexOf(secondExam)
      const firstOrder = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex
      const secondOrder = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex

      return firstOrder - secondOrder || firstExam.localeCompare(secondExam)
    })
    .map(([examType, examReports]) => ({
      examType,
      rows: getSubjectWisePassRows(examReports),
    }))
}

function SubjectWisePassTable({ rows, title }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm sm:p-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black text-slate-900 sm:text-base">{title}</h3>
          <p className="mt-0.5 hidden text-[10px] text-slate-500 sm:block">
            Pass % = Pass ÷ Appeared × 100 • Subject Absent excluded
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
          {rows.length} subjects
        </span>
      </div>

      <div className="space-y-2 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
            No subject-wise data available.
          </div>
        ) : (
          rows.map(row => (
            <div
              key={row.subject}
              className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="truncate text-sm font-bold text-slate-900">{row.subject}</h4>
                <span className="rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-black text-cyan-700">
                  {row.passPercent}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5 text-sm">
                <div className="rounded-lg bg-white px-2.5 py-1.5">
                  <div className="text-xs text-slate-500">Appeared</div>
                  <div className="font-bold text-slate-900">{row.appeared}</div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1.5">
                  <div className="text-xs text-slate-500">Pass</div>
                  <div className="font-bold text-emerald-700">{row.pass}</div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1.5">
                  <div className="text-xs text-slate-500">Fail</div>
                  <div className="font-bold text-rose-700">{row.fail}</div>
                </div>
                <div className="rounded-lg bg-white px-2.5 py-1.5">
                  <div className="text-xs text-slate-500">Absent</div>
                  <div className="font-bold text-amber-700">{row.absent}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-slate-200/70 md:block">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
              <th className="px-2.5 py-2 text-left font-semibold">S.No</th>
              <th className="px-2.5 py-2 text-left font-semibold">Subject</th>
              <th className="px-2.5 py-2 text-right font-semibold">Appeared</th>
              <th className="px-2.5 py-2 text-right font-semibold">Pass</th>
              <th className="px-2.5 py-2 text-right font-semibold">Fail</th>
              <th className="px-2.5 py-2 text-right font-semibold">Absent</th>
              <th className="px-2.5 py-2 text-right font-semibold">Pass %</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                  No subject-wise data available.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.subject}
                  className="border-b border-slate-100/80 text-slate-700 transition hover:bg-cyan-50/40"
                >
                  <td className="px-2.5 py-1.5">{index + 1}</td>
                  <td className="px-2.5 py-1.5 font-semibold text-slate-900">{row.subject}</td>
                  <td className="px-2.5 py-1.5 text-right">{row.appeared}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-emerald-700">
                    {row.pass}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-rose-700">
                    {row.fail}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-amber-700">
                    {row.absent}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-black text-cyan-700">
                    {row.passPercent}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default function PrincipalDashboard() {
  const { data: session } = useSession()
  const principal = session?.user

  const collegeName = principal?.collegeName || 'Your College'

  const [analyticsStats, setAnalyticsStats] = useState({
    totalSessions: 0,
    totalDuties: 0,
    totalLecturers: 0,
    roomsUsed: 0,

    availableCount: 0,
    unavailableCount: 0,
    availabilityPercent: 0,

    maxDuties: 0,
    minDuties: 0,
    loadDifference: 0,
    loadHealth: '',

    examSummary: [],
    topLecturers: [],
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await fetch('/api/invigilation/reports/exam-analytics', {
          cache: 'no-store',
          credentials: 'include',
        })

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setAnalyticsError(
              'Analytics unavailable: you must be signed into the invigilation module.'
            )
            return
          }

          throw new Error(`Failed to load analytics: ${res.status}`)
        }

        const data = await res.json()
        setAnalyticsStats(data)
      } catch (err) {
        console.error(err)
        setAnalyticsError(err.message)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const { data: dashboardOverview, error: dashboardOverviewError } = useSWR(
    '/api/principal/dashboard-overview',
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )

  const { data: absenteesData } = useSWR('/api/attendance/today-absentees', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const { data: consecutiveData } = useSWR(
    principal?.collegeId
      ? `/api/attendance/consecutive-absentees?collegeId=${principal.collegeId}`
      : null,
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
    }
  )

  const atRiskStudents = consecutiveData?.length || 0

  const { data: trendData } = useSWR('/api/attendance/trend?days=7', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  const { data: groupPerformance } = useSWR('/api/attendance/group-performance', fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  })

  // Exam data fetching for all groups in the college
  const { data: examData, isLoading: examsLoading } = useSWR(
    principal?.collegeId ? `/api/exams?collegeId=${principal.collegeId}` : null,
    fetcher
  )

  const validTrendData = trendData?.filter(day => day.hasData) || []

  const allLecturersSubmitted = true

  const consecutiveAbsentees = consecutiveData?.absentees || []

  const summary = dashboardOverview?.summary
  const attendanceOverview = dashboardOverview?.attendanceOverview
  const overviewLoading = !dashboardOverview && !dashboardOverviewError
  const sessionWisePresent = absenteesData?.sessionWisePresent || {}
  const sessionWiseAbsentees = absenteesData?.sessionWiseAbsentees || {}
  const absenteesSummary = absenteesData?.summary

  // Exam performance computations
  const examReports = Array.isArray(examData?.data) ? examData.data : []
  const groups = [...new Set(examReports.map(r => r.stream).filter(Boolean))]

  const buildExamSummaryRows = (reports, enrolled) =>
    Object.values(
      reports.reduce((acc, report) => {
        const key = report.examType || 'Unknown Exam'
        if (!acc[key]) {
          acc[key] = {
            examType: formatExamLabel(key),
            enrolled,
            attended: 0,
            absent: 0,
            present: 0,
            pass: 0,
            fail: 0,
            passPercent: '0.0%',
            studentKeys: new Set(),
            passStudentKeys: new Set(),
            failStudentKeys: new Set(),
          }
        }

        const studentKey = getStudentKey(report)
        if (!studentKey || acc[key].studentKeys.has(studentKey)) {
          return acc
        }

        acc[key].studentKeys.add(studentKey)
        if (isReportAbsent(report)) {
          return acc
        }

        acc[key].attended += 1
        acc[key].present += 1
        if (isReportPass(report)) {
          acc[key].passStudentKeys.add(studentKey)
          acc[key].pass = acc[key].passStudentKeys.size
        } else {
          acc[key].failStudentKeys.add(studentKey)
          acc[key].fail = acc[key].failStudentKeys.size
        }
        return acc
      }, {})
    )
      .map(row => {
        const absent = Math.max(row.enrolled - row.attended, 0)
        const passPercent =
          row.attended > 0 ? `${((row.pass / row.attended) * 100).toFixed(1)}%` : '0.0%'

        return {
          ...row,
          absent,
          passPercent,
        }
      })
      .sort((a, b) => a.examType.localeCompare(b.examType))

  // Group-wise exam summaries
  const groupExamSummaries = groups.map(group => {
    const groupReports = examReports.filter(r => r.stream === group)
    const firstYearReports = groupReports.filter(r => r.yearOfStudy === 'First Year')
    const secondYearReports = groupReports.filter(r => r.yearOfStudy === 'Second Year')
    const firstYearEnrolled =
      firstYearReports.length > 0 ? [...new Set(firstYearReports.map(getStudentKey))].length : 0
    const secondYearEnrolled =
      secondYearReports.length > 0 ? [...new Set(secondYearReports.map(getStudentKey))].length : 0

    return {
      group,
      firstYearExamSummaryRows: buildExamSummaryRows(firstYearReports, firstYearEnrolled),
      secondYearExamSummaryRows: buildExamSummaryRows(secondYearReports, secondYearEnrolled),
      firstYearSubjectWiseByExam: getSubjectWisePassRowsByExam(firstYearReports),
      secondYearSubjectWiseByExam: getSubjectWisePassRowsByExam(secondYearReports),
    }
  })
const [selectedGroup, setSelectedGroup] = useState('')
  // Selected group data for group-wise view
  const selectedGroupData =
    groupExamSummaries.find(g => g.group === selectedGroup) || groupExamSummaries[0] || null

  // College-wide exam summaries (all groups combined)
  const firstYearAllReports = examReports.filter(r => r.yearOfStudy === 'First Year')
  const secondYearAllReports = examReports.filter(r => r.yearOfStudy === 'Second Year')
  const firstYearAllEnrolled =
    firstYearAllReports.length > 0 ? [...new Set(firstYearAllReports.map(getStudentKey))].length : 0
  const secondYearAllEnrolled =
    secondYearAllReports.length > 0
      ? [...new Set(secondYearAllReports.map(getStudentKey))].length
      : 0

  const collegeFirstYearExamSummaryRows = buildExamSummaryRows(
    firstYearAllReports,
    firstYearAllEnrolled
  )
  const collegeSecondYearExamSummaryRows = buildExamSummaryRows(
    secondYearAllReports,
    secondYearAllEnrolled
  )
  const collegeFirstYearSubjectWiseByExam = getSubjectWisePassRowsByExam(firstYearAllReports)
  const collegeSecondYearSubjectWiseByExam = getSubjectWisePassRowsByExam(secondYearAllReports)

  const sessionSummaryCards = ['FN', 'AN'].map(sessionKey => {
    const present = sessionWisePresent[sessionKey]?.length || 0
    const absent = sessionWiseAbsentees[sessionKey]?.length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return {
      session: sessionKey,
      present,
      absent,
      total,
      percent,
    }
  })
  const enrichAttendanceRows = (rows = [], year) =>
    rows.map(row => {
      const fn = stats(row.group, year, 'FN')
      const an = stats(row.group, year, 'AN')

      return {
        ...row,
        fnPresent: fn.present,
        fnAbsent: fn.absent,
        fnPercentage: fn.percent,
        anPresent: an.present,
        anAbsent: an.absent,
        anPercentage: an.percent,
      }
    })

  const todayDateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    []
  )

  function stats(group, year, session) {
    const normalizedGroup = normalizeAttendanceGroup(group)
    const present =
      sessionWisePresent[session]?.filter(
        s => normalizeAttendanceGroup(s.group) === normalizedGroup && s.yearOfStudy === year
      ).length || 0
    const absent =
      sessionWiseAbsentees[session]?.filter(
        s => normalizeAttendanceGroup(s.group) === normalizedGroup && s.yearOfStudy === year
      ).length || 0
    const total = present + absent
    const percent = total > 0 ? Math.round((present / total) * 100) : 0
    return { present, absent, total, percent }
  }

  const summaryCards = [
    {
      title: 'Total Students',
      value: summary?.totalStudents ?? 0,

      icon: GraduationCap,
      accentClassName: 'text-blue-950',
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Total Lecturers',
      value: summary?.totalLecturers ?? 0,

      icon: Users,
      accentClassName: 'text-emerald-950',
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Total Groups',
      value: summary?.totalGroups ?? 0,

      icon: LayoutGrid,
      accentClassName: 'text-violet-950',
      iconClassName: 'bg-violet-100 text-violet-700',
    },
    {
      title: "Today's Attendance %",
      value: `${Number(absenteesSummary?.percentage ?? summary?.attendancePercentage ?? 0)}%`,

      icon: Percent,
      accentClassName: 'text-amber-950',
      iconClassName: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Total Absentees Today',
      value: absenteesSummary?.grandAbsent ?? summary?.totalAbsenteesToday ?? 0,

      icon: UserRoundCheck,
      accentClassName: 'text-rose-950',
      iconClassName: 'bg-rose-100 text-rose-700',
    },
  ]

  const todayPresent = sessionSummaryCards.reduce((sum, session) => sum + session.present, 0)

  const todayAbsent = sessionSummaryCards.reduce((sum, session) => sum + session.absent, 0)

  const todayTotal = todayPresent + todayAbsent

  const todayAttendancePercentage =
    todayTotal > 0 ? Math.round((todayPresent / todayTotal) * 100) : 0

  const previousAttendancePercentage =
    validTrendData.length > 1
      ? validTrendData[validTrendData.length - 2].percentage
      : todayAttendancePercentage

  const bestGroup = groupPerformance?.[0]?.name || ''

  const attendanceAlerts = generateAttendanceAlerts({
    attendancePercentage: todayAttendancePercentage,

    totalAbsent: todayAbsent,

    atRiskStudents,

    allLecturersSubmitted,
  })

  // PDF Export function
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  

  const exportExamPerformancePDF = async () => {
    if (isExportingPDF) return

    setIsExportingPDF(true)

    // Get selected group data
    const selectedGroupData =
      groupExamSummaries.find(g => g.group === selectedGroup) || groupExamSummaries[0]
    const groupNameForFile = selectedGroupData?.group || 'all-groups'

    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()

      // Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(collegeName, pageWidth / 2, 10, { align: 'center' })
      doc.setFontSize(11)
      doc.text(`${groupNameForFile} — Exam Performance Report`, pageWidth / 2, 16, {
        align: 'center',
      })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(
        'Pass % = Pass ÷ Appeared × 100 | Absent students excluded from pass % calculation',
        pageWidth / 2,
        21,
        { align: 'center' }
      )

      let yPos = 28

      const buildSection = (label, byExamData) => {
        if (yPos > 180) {
          doc.addPage()
          yPos = 15
        }

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(label, 14, yPos)
        yPos += 7

        byExamData.forEach(({ examType, rows }) => {
          if (rows.length === 0) return

          if (yPos > 190) {
            doc.addPage()
            yPos = 15
          }

          doc.setFont('helvetica', 'italic')
          doc.setFontSize(8)
          doc.text(formatExamLabel(examType), 14, yPos)
          yPos += 5

          const head = [['S.No', 'Subject', 'Appeared', 'Pass', 'Fail', 'Absent', 'Pass %']]
          const body = rows.map((row, idx) => [
            String(idx + 1),
            row.subject,
            String(row.appeared),
            String(row.pass),
            String(row.fail),
            String(row.absent),
            row.passPercent,
          ])

          autoTable(doc, {
            startY: yPos,
            head,
            body,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1.2, halign: 'center', lineWidth: 0.1 },
            headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 70, halign: 'left' },
              2: { cellWidth: 22 },
              3: { cellWidth: 18 },
              4: { cellWidth: 18 },
              5: { cellWidth: 18 },
              6: { cellWidth: 25 },
            },
          })

          yPos = doc.lastAutoTable?.finalY + 5 || yPos + 20
        })
      }

      if (selectedGroupData) {
        buildSection(
          'First Year — Subject Pass % by Exam',
          selectedGroupData.firstYearSubjectWiseByExam
        )
        buildSection(
          'Second Year — Subject Pass % by Exam',
          selectedGroupData.secondYearSubjectWiseByExam
        )
      }

      const fileName = `${collegeName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${groupNameForFile.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-exam-performance-report.pdf`
      doc.save(fileName)
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/50 to-indigo-100/30 px-4 py-6 transition-all duration-500 sm:px-6 sm:py-10 lg:px-8 xl:px-12">
      <main className="max-w-8xl mx-auto w-full space-y-6">
    
<section className="rounded-2xl border border-blue-100/70 bg-white/90 px-3 py-3 shadow-md backdrop-blur-xl sm:px-4 sm:py-3">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="inline-flex rounded-full bg-blue-100/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:text-xs">
        Principal Dashboard
      </p>

      <h1 className="mt-1 truncate bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl lg:text-3xl">
        {collegeName}
      </h1>

      <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
        {todayDateLabel}
      </p>
    </div>
  </div>
</section>



<section className="grid grid-cols-1 gap-1.5 lg:grid-cols-[minmax(0,1fr)_260px]">

  {/* Principal Profile Card */}
  <Card className="group rounded-lg border border-blue-200/60 bg-linear-to-r from-blue-50/80 to-emerald-50/80 p-1 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <div className="flex items-center gap-2">

      {principal?.photo ? (
        <Image
          src={principal.photo}
          alt="Principal"
          width={48}
          height={48}
          className="h-10 w-10 shrink-0 rounded-full border border-white object-cover shadow-sm sm:h-12 sm:w-12"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-linear-to-br from-slate-100 via-slate-200 to-slate-300 text-[9px] font-bold text-slate-600 sm:h-12 sm:w-12">
          No Photo
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold leading-tight text-slate-900 sm:text-sm">
          {principal?.name || "Principal"}
        </p>

        <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-600 sm:text-xs">
          {principal?.email || "No email available"}
        </p>

        <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500">
          {collegeName}
        </p>
      </div>
    </div>
  </Card>

  {/* Total Enrollment Card */}
  <Card className="group rounded-lg border border-indigo-200/60 bg-linear-to-br from-indigo-50 via-white/90 to-purple-50 p-0 shadow-sm transition-shadow duration-200 hover:shadow-md">
    <CardContent className="flex h-full items-center justify-between gap-1.5 p-1">

      <div className="min-w-0 flex-1">
        <p className="inline-flex rounded-full bg-indigo-100/70 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-tight tracking-wide text-indigo-600">
          Total Enrollment
        </p>

        <p className="mt-1 text-2xl font-black leading-none text-indigo-900 sm:text-3xl">
          {overviewLoading ? "..." : (summary?.totalStudents ?? 0)}
        </p>

        <p className="mt-1 truncate text-[10px] leading-tight text-slate-500">
          {overviewLoading
            ? "Loading attendance..."
            : `${summary?.totalPresentToday ?? 0} present today`}
        </p>
      </div>

      <div className="shrink-0 rounded-lg bg-linear-to-br from-indigo-400 to-purple-500 p-1.5 text-white">
        <GraduationCap className="h-4 w-4" />
      </div>

    </CardContent>
  </Card>

</section>

        {/* <GroupPerformanceCard groups={groupPerformance || []} /> */}

        {/* <section>
          <div className="grid grid-cols-1 gap-4 py-4 lg:grid-cols-2">
            <AttendanceHealthScoreCard
              attendancePercentage={todayAttendancePercentage}
              totalStudents={todayTotal}
              presentStudents={todayPresent}
              absentStudents={todayAbsent}
            />

            <AttendanceTrendCard title="College Attendance Trend" trendData={trendData || []} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AttendanceInsightsCard
              attendancePercentage={todayAttendancePercentage}
              previousAttendancePercentage={previousAttendancePercentage}
              totalAbsent={todayAbsent}
              totalPresent={todayPresent}
              bestGroup={bestGroup}
            />
            <AttendanceAlertsCard alerts={attendanceAlerts} />
          </div>
        </section> */}

        <section className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {summaryCards.map(card => (
              <OverviewStatCard key={card.title} {...card} loading={overviewLoading} />
            ))}
          </div>
        </section>


<section className="space-y-3">

  {/* Session Summary Cards */}
  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
    {sessionSummaryCards.map(card => (
      <div
        key={card.session}
        className="rounded-xl border border-white/60 bg-white/90 p-2 shadow-md backdrop-blur-sm"
      >
        {/* Session Header */}
        <div className="flex items-center justify-between">
          <p className="inline-flex rounded-full bg-indigo-100/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600 sm:text-xs">
            {card.session} Session
          </p>
        </div>

        {/* Present / Absent / Total */}
        <div className="mt-2 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-emerald-700 sm:text-xs">
              Present
            </p>
            <p className="mt-1 text-lg font-bold leading-tight text-emerald-900">
              {card.present}
            </p>
          </div>

          <div className="rounded-lg bg-rose-50 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-rose-700 sm:text-xs">
              Absent
            </p>
            <p className="mt-1 text-lg font-bold leading-tight text-rose-900">
              {card.absent}
            </p>
          </div>

          <div className="rounded-lg bg-slate-100 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-slate-700 sm:text-xs">
              Total
            </p>
            <p className="mt-1 text-lg font-bold leading-tight text-slate-900">
              {card.total}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Year-wise Attendance Tables */}
  <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
    <AttendanceOverviewTable
      title="First Year Attendance"
      rows={enrichAttendanceRows(
        attendanceOverview?.firstYear || [],
        "First Year"
      )}
      loading={overviewLoading}
    />

    <AttendanceOverviewTable
      title="Second Year Attendance"
      rows={enrichAttendanceRows(
        attendanceOverview?.secondYear || [],
        "Second Year"
      )}
      loading={overviewLoading}
    />
  </div>

</section>


        {/* Exam Performance Section — Group-wise */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Exam Performance Overview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Group-wise exam performance and subject-wise analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {groups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              <button
                onClick={exportExamPerformancePDF}
                disabled={isExportingPDF}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isExportingPDF ? 'Generating...' : 'Export PDF Report'}
              </button>
            </div>
          </div>

          {selectedGroupData ? (
            <>
              {/* Selected Group Exam Summary Tables */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedGroupData.group} — First Year Exam Summary
                    </h3>
                    <span className="text-xs text-slate-500">
                      {selectedGroupData.firstYearExamSummaryRows.length} exams
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50/80 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Exam</th>
                          <th className="px-3 py-2 text-center font-semibold">Enrolled</th>
                          <th className="px-3 py-2 text-center font-semibold">Attended</th>
                          <th className="px-3 py-2 text-center font-semibold">Pass</th>
                          <th className="px-3 py-2 text-center font-semibold">Fail</th>
                          <th className="px-3 py-2 text-center font-semibold">Absent</th>
                          <th className="px-3 py-2 text-center font-semibold">Pass %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupData.firstYearExamSummaryRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-3 py-6 text-center text-sm text-slate-500"
                            >
                              No exam data available
                            </td>
                          </tr>
                        ) : (
                          selectedGroupData.firstYearExamSummaryRows.map(row => (
                            <tr
                              key={row.examType}
                              className="border-t border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-3 py-2 font-semibold text-slate-800">
                                {row.examType}
                              </td>
                              <td className="px-3 py-2 text-center">{row.enrolled}</td>
                              <td className="px-3 py-2 text-center">{row.attended}</td>
                              <td className="px-3 py-2 text-center font-semibold text-emerald-700">
                                {row.pass}
                              </td>
                              <td className="px-3 py-2 text-center font-semibold text-rose-700">
                                {row.fail}
                              </td>
                              <td className="px-3 py-2 text-center font-semibold text-amber-700">
                                {row.absent}
                              </td>
                              <td className="px-3 py-2 text-center font-black text-cyan-700">
                                {row.passPercent}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <h3 className="text-lg font-black text-slate-900">
                      {selectedGroupData.group} — Second Year Exam Summary
                    </h3>
                    <span className="text-xs text-slate-500">
                      {selectedGroupData.secondYearExamSummaryRows.length} exams
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50/80 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold">Exam</th>
                          <th className="px-3 py-2 text-center font-semibold">Enrolled</th>
                          <th className="px-3 py-2 text-center font-semibold">Attended</th>
                          <th className="px-3 py-2 text-center font-semibold">Pass</th>
                          <th className="px-3 py-2 text-center font-semibold">Fail</th>
                          <th className="px-3 py-2 text-center font-semibold">Absent</th>
                          <th className="px-3 py-2 text-center font-semibold">Pass %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroupData.secondYearExamSummaryRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-3 py-6 text-center text-sm text-slate-500"
                            >
                              No exam data available
                            </td>
                          </tr>
                        ) : (
                          selectedGroupData.secondYearExamSummaryRows.map(row => (
                            <tr
                              key={row.examType}
                              className="border-t border-slate-100 hover:bg-slate-50"
                            >
                              <td className="px-3 py-2 font-semibold text-slate-800">
                                {row.examType}
                              </td>
                              <td className="px-3 py-2 text-center">{row.enrolled}</td>
                              <td className="px-3 py-2 text-center">{row.attended}</td>
                              <td className="px-3 py-2 text-center font-semibold text-emerald-700">
                                {row.pass}
                              </td>
                              <td className="px-3 py-2 text-center font-semibold text-rose-700">
                                {row.fail}
                              </td>
                              <td className="px-3 py-2 text-center font-semibold text-amber-700">
                                {row.absent}
                              </td>
                              <td className="px-3 py-2 text-center font-black text-cyan-700">
                                {row.passPercent}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Selected Group Subject-wise Pass % by Exam */}
              <div className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900">Subject-wise Pass % by Exam</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedGroupData.group} — Detailed subject performance breakdown for each exam
                    type
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-base font-bold text-slate-900">First Year</h4>
                    {selectedGroupData.firstYearSubjectWiseByExam.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        No subject-wise exam data available for First Year.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {selectedGroupData.firstYearSubjectWiseByExam.map(({ examType, rows }) => (
                          <SubjectWisePassTable
                            key={examType}
                            rows={rows}
                            title={`${formatExamLabel(examType)} — Subject Pass %`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="mb-3 text-base font-bold text-slate-900">Second Year</h4>
                    {selectedGroupData.secondYearSubjectWiseByExam.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        No subject-wise exam data available for Second Year.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {selectedGroupData.secondYearSubjectWiseByExam.map(({ examType, rows }) => (
                          <SubjectWisePassTable
                            key={examType}
                            rows={rows}
                            title={`${formatExamLabel(examType)} — Subject Pass %`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
              No exam data available for any group.
            </div>
          )}
        </section>

        {/* <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <GroupDashboard />
        </section> */}

        {/* <section className="space-y-6 p-2">
          <ConsecutiveAbsenteesCard
            data={consecutiveAbsentees}
            title="Students At Risk"
            loading={!consecutiveData}
            showViewAll={true}
          />
        </section> */}

        <ActiveLecturersCard title="Currently Active Lecturers" />

        {/* <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl transition-all duration-500">
          <AnalyticsDashboard
            stats={analyticsStats}
            loading={analyticsLoading}
            error={analyticsError}
          />
        </section> */}

        {/* <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="group hover:shadow-3xl rounded-3xl border-emerald-200/50 bg-linear-to-br from-emerald-50/90 via-white to-teal-50 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-1">
            <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-start gap-5">
                <div className="rounded-3xl bg-linear-to-br from-emerald-400 to-teal-500 p-4 text-white shadow-xl transition-all duration-300 hover:animate-bounce">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <p className="inline-block rounded-full bg-emerald-100/50 px-3 py-1 text-sm font-bold tracking-wider text-emerald-700 uppercase">
                    Student Onboarding
                  </p>
                  <h2 className="mt-2 bg-linear-to-r from-slate-900 to-emerald-900 bg-clip-text text-2xl font-black text-transparent lg:text-3xl">
                    Bulk Student Upload
                  </h2>
                  <p className="mt-3 max-w-lg text-base font-medium text-slate-600">
                    Seamlessly import entire batches via Excel. Instant enrollment for new academic
                    year.
                  </p>
                </div>
              </div>

              <Link
                href="/students/bulk-upload"
                className="group/btn inline-flex items-center justify-center gap-3 rounded-3xl bg-linear-to-r from-emerald-500 via-emerald-600 to-teal-600 px-8 py-4 text-lg font-bold text-white shadow-xl ring-2 ring-emerald-200/50 transition-all duration-300 hover:scale-105 hover:rotate-1 hover:from-emerald-600 hover:to-teal-700 hover:shadow-2xl"
              >
                <Upload className="h-4 w-5 transition-transform duration-500 group-hover:rotate-180" />
                Open Bulk Upload
              </Link>
            </CardContent>
          </Card>
        </section> */}

        {/* <AttendanceSmsCard /> */}
        {/* <AttendanceSmsHistoryCard endpoint="/api/attendance/shortage-summary/sms-logs?limit=8" /> */}
        {/* <PromotionCard /> */}

        <footer className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">
            <div>
              <h3 className="bg-linear-to-r from-blue-700 to-indigo-700 bg-clip-text text-lg font-bold text-transparent">
                OSRA
              </h3>

              <p className="text-sm text-slate-500">
                Online Student Record & Attendance Management System
              </p>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm font-medium text-slate-700">Principal Dashboard</p>

              <p className="text-xs text-slate-500">
                © {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
