//src/app/dashboards/components/GroupDashboardPage.jsx
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserPlus } from 'lucide-react'
import ExternalLinks from '@/components/ExternalLinks'
import LecturerInfoCard from '@/components/dashboard/LecturerInfoCard'
import GroupAttendanceCard from '@/components/OverallAttendanceMatrixCard/GroupAttendanceCard'
import DashboardFooter from '@/components/layout/Footer'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
import LecturerLeaveRequests from '@/components/LecturerLeaveRequests/LecturerLeaveRequests'

const UNIT_EXAMS = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4']
const PUBLIC_EXAMS = ['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2']

const fetcher = async url => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

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
  return String(report?.studentId?._id || report?.studentId || report?.student?._id || report?._id || '')
}

function isAbsentMark(mark) {
  const value = String(mark || '').trim().toUpperCase()
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
    const numericMark =
      typeof subject?.marks === 'number' ? subject.marks : Number(subject?.marks)

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

      // Subject-level absence: this subject only is Absent.
      if (isAbsentMark(mark)) {
        row.absent += 1
        return
      }

      row.appeared += 1

      const numericMark =
        typeof mark === 'number' ? mark : Number(mark)

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
      passPercent:
        row.appeared > 0
          ? `${((row.pass / row.appeared) * 100).toFixed(1)}%`
          : '0.0%',
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject))
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
                  <td className="px-2.5 py-1.5 text-right font-semibold text-emerald-700">{row.pass}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-rose-700">{row.fail}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold text-amber-700">{row.absent}</td>
                  <td className="px-2.5 py-1.5 text-right font-black text-cyan-700">{row.passPercent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OverviewCard({ title, value, className = '' }) {
  return (
    <div
      className={`
        ${className}
        min-h-[58px]
        rounded-lg
        px-2.5 py-2
        text-white
        shadow-sm
        ring-1 ring-white/10
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        sm:min-h-16
        sm:px-3 sm:py-2.5
      `}
    >
      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/75 sm:text-[11px]">
        {title}
      </p>

      <p className="mt-0.5 text-lg font-black leading-tight tracking-tight sm:text-xl">
        {value}
      </p>
    </div>
  )
}



function HeaderActionLink({ href, label, theme, variant = 'theme' }) {
  const className =
    variant === 'neutral'
      ? 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
      : `${theme.pill}`

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2.5 py-1.5 text-center text-sm font-semibold shadow-sm transition sm:px-4 ${className}`}
    >
      <UserPlus className="h-4 w-4" />
      {label}
    </Link>
  )
}





export default function GroupDashboardPage({
  groupName,
  routeSegment,
  includeExternalLinks = false,
  includeEditAttendance = true,
 
}) {
  const { data: session } = useSession()
  const user = session?.user
  const theme = getGroupTheme(groupName)
  const collegeName = user?.collegeName || 'College'
  const baseDashboardHref = `/dashboards/${routeSegment}`
  const addStudentHref = `/register?group=${encodeURIComponent(groupName)}&returnUrl=${encodeURIComponent(baseDashboardHref)}`
  const marksPostingHref = `/exams-form?returnUrl=${encodeURIComponent(baseDashboardHref)}`
  
const examDashboardHref =
  `/exams?stream=${encodeURIComponent(groupName)}&returnUrl=${encodeURIComponent(baseDashboardHref)}`

  const { data: collegeDetails } = useSWR(
    user?.collegeId ? `/api/colleges/${user.collegeId}` : null,
    fetcher
  )
  const { data: groupDashboardData } = useSWR(
    user?.collegeId ? `/api/attendance/group-wise-today?collegeId=${user.collegeId}` : null,
    fetcher
  )
  const { data: examData, isLoading: examsLoading } = useSWR(
    user?.collegeId ? `/api/exams?stream=${encodeURIComponent(groupName)}` : null,
    fetcher
  )
  const { data: studentData } = useSWR(
    user?.collegeId ? `/api/students?group=${encodeURIComponent(groupName)}&page=1&limit=1` : null,
    fetcher
  )

  
  const feeSummary = groupDashboardData?.feeSummary?.[groupName] || {}
  const firstYearFee = feeSummary['First Year'] || { total: 0, paid: 0 }
  const secondYearFee = feeSummary['Second Year'] || { total: 0, paid: 0 }
  const enrolledCount = studentData?.totalStudents || 0
  const examReports = Array.isArray(examData?.data) ? examData.data : []
  const firstYearEnrolled = feeSummary['First Year']?.total || 0
  const secondYearEnrolled = feeSummary['Second Year']?.total || 0

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
          // Attended but not passed = Fail.
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

  const firstYearExamSummaryRows = buildExamSummaryRows(
    examReports.filter(report => report.yearOfStudy === 'First Year'),
    firstYearEnrolled
  )
  const secondYearExamSummaryRows = buildExamSummaryRows(
    examReports.filter(report => report.yearOfStudy === 'Second Year'),
    secondYearEnrolled
  )
  const firstYearSubjectWiseRows = getSubjectWisePassRows(
    examReports.filter(report => report.yearOfStudy === 'First Year')
  )
  const secondYearSubjectWiseRows = getSubjectWisePassRows(
    examReports.filter(report => report.yearOfStudy === 'Second Year')
  )

  const overviewCards = [
    {
      title: 'First Year Fee',
      value: `${firstYearFee.paid} / ${firstYearFee.total}`,
      
      className: 'bg-cyan-600',
    },
    {
      title: 'Second Year Fee',
      value: `${secondYearFee.paid} / ${secondYearFee.total}`,
      
      className: 'bg-violet-600',
    },
   
  ]

  const footerAddress = [collegeDetails?.address, collegeDetails?.district].filter(Boolean).join(', ')

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} px-2 py-3 sm:px-3 sm:py-4 md:px-4`}>

      <LecturerInfoCard user={user} groupName={groupName} />
      <div className="mx-auto max-w-6xl space-y-3 sm:space-y-4">
        <div
          className={`flex flex-col gap-4 rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3 shadow-sm sm:p-4 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            
            <h1 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">{groupName}</h1>
            <p className="text-[11px] font-black text-slate-900 tracking-[0.2em] uppercase sm:text-xs">Lecturer Dashboard</p>
            <p className="mt-1 text-sm font-black text-slate-900">{collegeName}</p>
            
          </div>

          
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
  <HeaderActionLink
    href={addStudentHref}
    label="👨‍🎓Add Student"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/attendance`}
    label=" ✏Today's Attendance"
    theme={theme}
  />

  <HeaderActionLink
    href={marksPostingHref}
    label="📝Post Marks"
    theme={theme}
  />

  <HeaderActionLink
    href={examDashboardHref}
    label="📝Exam Dashboard"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/students`}
    label="👨‍🎓Student Records"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/absentees`}
    label=" ✕ Today's Absentees"
    theme={theme}
  />

  <HeaderActionLink
  href={`${baseDashboardHref}/consecutive-absentees`}
  label="✕ Consecutive Absentees"
  theme={theme}
/>

  <HeaderActionLink
    href={`${baseDashboardHref}/monthly`}
    label="📅Monthly Attendance"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/edit`}
    label="📝Update Attendance"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/fees`}
    label="💰Fee Dashboard"
    theme={theme}
  />

  <HeaderActionLink
    href={`${baseDashboardHref}/attendance-below-75`}
    label="📝Below 75% Attendance"
    theme={theme}
  />

  <HeaderActionLink
  href="/late-entry"
  label="⏰ Late Entry"
  theme={theme}
  />

 <HeaderActionLink
  href="/late-entry-register"
  label="📋 Late Entry Register"
  theme={theme}
 />

 <HeaderActionLink
  href="/attendance-records/attendance-calendar"
  label="📋 Calender View"
  theme={theme}
 />

 <HeaderActionLink
  href="/invigilation/login"
  label="📋 Invigilation Login"
  theme={theme}
 />




</div>
        </div>


{/* ── Student Leave Requests ── */}
<section>
  <LecturerLeaveRequests />
</section>
        
        <section className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-sm sm:p-4">
              <div className="mb-3 border-b border-slate-200/80 pb-2.5">
                <h2 className="text-lg font-black text-slate-900 sm:text-xl">Fee Overview</h2>
                
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {overviewCards.map(card => (
                  <OverviewCard key={card.title} {...card} />
                ))}
              </div>
            </section>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[250px_minmax(0,1fr)]">
          <div className="space-y-4">


            
            
            
            <div className="xl:hidden">
              <GroupAttendanceCard groupName={groupName} />
            </div>
            {includeExternalLinks ? (
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <ExternalLinks />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="hidden xl:block">
              <GroupAttendanceCard groupName={groupName} />
            </div>

            

          

{/* Compact Exam Performance */}
<section className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-sm sm:p-4">

  <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2.5">
    <div>
      <h2 className="text-base font-black text-slate-900 sm:text-lg">
        Exam Performance
      </h2>
      <p className="mt-0.5 text-[11px] text-slate-500">
        Exam-wise and subject-wise performance snapshot
      </p>
    </div>

    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
      {examsLoading
        ? 'Loading...'
        : `${firstYearExamSummaryRows.length + secondYearExamSummaryRows.length} Exams`}
    </span>
  </div>

  {/* Exam Summary */}
  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

    {/* First Year */}
    <div className="overflow-hidden rounded-xl border border-slate-200">

      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <h3 className="text-sm font-black text-slate-900">
          First Year
        </h3>

        <span className="text-[10px] text-slate-500">
          {firstYearExamSummaryRows.length} exams
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-2 py-1.5 text-left">Exam</th>
              <th className="px-2 py-1.5 text-center">Attend</th>
              <th className="px-2 py-1.5 text-center">Pass</th>
              <th className="px-2 py-1.5 text-center">Fail</th>
              <th className="px-2 py-1.5 text-center">Pass %</th>
            </tr>
          </thead>

          <tbody>
            {firstYearExamSummaryRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  No exam data
                </td>
              </tr>
            ) : (
              firstYearExamSummaryRows.map(row => (
                <tr
                  key={row.examType}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-2 py-1.5 font-semibold text-slate-800">
                    {row.examType}
                  </td>

                  <td className="px-2 py-1.5 text-center">
                    {row.attended}
                  </td>

                  <td className="px-2 py-1.5 text-center font-semibold text-emerald-700">
                    {row.pass}
                  </td>

                  <td className="px-2 py-1.5 text-center font-semibold text-rose-700">
                    {row.fail}
                  </td>

                  <td className="px-2 py-1.5 text-center font-black text-cyan-700">
                    {row.passPercent}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Second Year */}
    <div className="overflow-hidden rounded-xl border border-slate-200">

      <div className="flex items-center justify-between bg-slate-50 px-3 py-2">
        <h3 className="text-sm font-black text-slate-900">
          Second Year
        </h3>

        <span className="text-[10px] text-slate-500">
          {secondYearExamSummaryRows.length} exams
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="px-2 py-1.5 text-left">Exam</th>
              <th className="px-2 py-1.5 text-center">Attend</th>
              <th className="px-2 py-1.5 text-center">Pass</th>
              <th className="px-2 py-1.5 text-center">Fail</th>
              <th className="px-2 py-1.5 text-center">Pass %</th>
            </tr>
          </thead>

          <tbody>
            {secondYearExamSummaryRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-xs text-slate-500"
                >
                  No exam data
                </td>
              </tr>
            ) : (
              secondYearExamSummaryRows.map(row => (
                <tr
                  key={row.examType}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-2 py-1.5 font-semibold text-slate-800">
                    {row.examType}
                  </td>

                  <td className="px-2 py-1.5 text-center">
                    {row.attended}
                  </td>

                  <td className="px-2 py-1.5 text-center font-semibold text-emerald-700">
                    {row.pass}
                  </td>

                  <td className="px-2 py-1.5 text-center font-semibold text-rose-700">
                    {row.fail}
                  </td>

                  <td className="px-2 py-1.5 text-center font-black text-cyan-700">
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

  {/* Subject-wise Pass % */}
  <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">

    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">
          First Year — Subject Pass %
        </h3>

        <span className="text-[10px] text-slate-500">
          {firstYearSubjectWiseRows.length} subjects
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-2 py-1.5 text-left">Subject</th>
              <th className="px-2 py-1.5 text-center">Appeared</th>
              <th className="px-2 py-1.5 text-center">Pass</th>
              <th className="px-2 py-1.5 text-center">Pass %</th>
            </tr>
          </thead>

          <tbody>
            {firstYearSubjectWiseRows.map(row => (
              <tr
                key={row.subject}
                className="border-t border-slate-100"
              >
                <td className="max-w-40 truncate px-2 py-1.5 font-semibold text-slate-800">
                  {row.subject}
                </td>

                <td className="px-2 py-1.5 text-center">
                  {row.appeared}
                </td>

                <td className="px-2 py-1.5 text-center font-semibold text-emerald-700">
                  {row.pass}
                </td>

                <td className="px-2 py-1.5 text-center font-black text-cyan-700">
                  {row.passPercent}
                </td>
              </tr>
            ))}

            {firstYearSubjectWiseRows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-4 text-center text-xs text-slate-500"
                >
                  No subject data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">
          Second Year — Subject Pass %
        </h3>

        <span className="text-[10px] text-slate-500">
          {secondYearSubjectWiseRows.length} subjects
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-[11px]">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-2 py-1.5 text-left">Subject</th>
              <th className="px-2 py-1.5 text-center">Appeared</th>
              <th className="px-2 py-1.5 text-center">Pass</th>
              <th className="px-2 py-1.5 text-center">Pass %</th>
            </tr>
          </thead>

          <tbody>
            {secondYearSubjectWiseRows.map(row => (
              <tr
                key={row.subject}
                className="border-t border-slate-100"
              >
                <td className="max-w-40 truncate px-2 py-1.5 font-semibold text-slate-800">
                  {row.subject}
                </td>

                <td className="px-2 py-1.5 text-center">
                  {row.appeared}
                </td>

                <td className="px-2 py-1.5 text-center font-semibold text-emerald-700">
                  {row.pass}
                </td>

                <td className="px-2 py-1.5 text-center font-black text-cyan-700">
                  {row.passPercent}
                </td>
              </tr>
            ))}

            {secondYearSubjectWiseRows.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-2 py-4 text-center text-xs text-slate-500"
                >
                  No subject data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

  </div>

</section>

          </div>
        </div>

        <section
          className={`rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} shadow-sm`}
        >
          <DashboardFooter
            collegeName={collegeDetails?.name || collegeName}
            address={footerAddress || 'Address not available'}
            phone={collegeDetails?.phone || 'Phone not available'}
            email={collegeDetails?.email || 'Email not available'}
            groupName={groupName}
            facebookUrl="https://facebook.com/yourcollege"
            instagramUrl="https://instagram.com/yourcollege"
            twitterUrl="https://x.com/yourcollege"
            youtubeUrl="https://youtube.com/@yourcollege"
          />
        </section>
      </div>
    </div>
  )
}