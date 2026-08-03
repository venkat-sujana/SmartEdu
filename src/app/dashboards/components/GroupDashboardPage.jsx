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
import GroupDashboardSidebar from './GroupDashboardSidebar'

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
  return subjects.length > 0 && subjects.some(subject => isAbsentMark(subject?.marks))
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

function OverviewCard({ title, value, note, className }) {
  return (
    <div className={`rounded-3xl p-4 text-white shadow-sm sm:p-5 ${className}`}>
      <p className="text-xs text-white/80 sm:text-sm">{title}</p>
      <p className="mt-2 text-xl font-black sm:text-2xl">{value}</p>
      {note ? <p className="mt-2 text-xs text-white/75">{note}</p> : null}
    </div>
  )
}

function QuickLinkCard({ href, title, description }) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5"
    >
      <p className="text-base font-bold text-slate-900 sm:text-lg">{title}</p>
      {description ? <p className="mt-2 text-sm text-slate-600">{description}</p> : null}
    </Link>
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm font-semibold shadow-sm transition sm:px-4 ${className}`}
    >
      <UserPlus className="h-4 w-4" />
      {label}
    </Link>
  )
}

function CompactExamTable({ rows, loading }) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {!loading && rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No exam summary available.
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.examType}
              className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    S.No {index + 1}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-slate-900">{row.examType}</h3>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Pass %
                  </div>
                  <div className="text-sm font-bold text-cyan-700">{row.passPercent}</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-2xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Enrolled</div>
                  <div className="font-bold text-slate-900">{row.enrolled}</div>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Attended</div>
                  <div className="font-bold text-slate-900">{row.attended}</div>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Absent</div>
                  <div className="font-bold text-rose-700">{row.absent}</div>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2">
                  <div className="text-xs text-slate-500">Present</div>
                  <div className="font-bold text-emerald-700">{row.present}</div>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 col-span-2">
                  <div className="text-xs text-slate-500">Pass</div>
                  <div className="font-bold text-slate-900">{row.pass}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <th className="px-3 py-2 text-left font-medium">S.No</th>
              <th className="px-3 py-2 text-left font-medium">Exam Type</th>
              <th className="px-3 py-2 text-left font-medium">Enrolled</th>
              <th className="px-3 py-2 text-left font-medium">Attended</th>
              <th className="px-3 py-2 text-left font-medium">Absent</th>
              <th className="px-3 py-2 text-left font-medium">Present</th>
              <th className="px-3 py-2 text-left font-medium">Pass</th>
              <th className="px-3 py-2 text-left font-medium">Pass %</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                  No exam summary available.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.examType}
                  className="border-b border-slate-100 text-slate-700 transition hover:bg-blue-50/40"
                >
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 font-medium">{row.examType}</td>
                  <td className="px-3 py-2">{row.enrolled}</td>
                  <td className="px-3 py-2">{row.attended}</td>
                  <td className="px-3 py-2 text-rose-700">{row.absent}</td>
                  <td className="px-3 py-2 text-emerald-700">{row.present}</td>
                  <td className="px-3 py-2">{row.pass}</td>
                  <td className="px-3 py-2 font-medium text-blue-700">{row.passPercent}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

function YearlyExamSummarySection({ title, rows, loading }) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-slate-900 sm:text-lg">{title}</h3>
        <span className="text-xs text-slate-500">
          {loading ? 'Loading...' : `${rows.length} exams`}
        </span>
      </div>
      <CompactExamTable rows={rows} loading={loading} />
    </div>
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
  const examDashboardHref = `/exams?returnUrl=${encodeURIComponent(baseDashboardHref)}`

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
            passPercent: '0.0%',
            studentKeys: new Set(),
            passStudentKeys: new Set(),
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
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-3 sm:p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div
          className={`flex flex-col gap-4 rounded-3xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{groupName}</h1>
            <p className="text-[11px] font-black text-slate-900 tracking-[0.2em] uppercase sm:text-xs">Lecturer Dashboard</p>
            <p className="mt-1 text-sm font-black text-slate-900">{collegeName}</p>
            
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <HeaderActionLink href={addStudentHref} label="Add Student" theme={theme} />
            <HeaderActionLink
              href={`${baseDashboardHref}/attendance`}
              label="Take Attendance"
              theme={theme}
            />
            <HeaderActionLink href={marksPostingHref} label="Post Marks" theme={theme} />
            <HeaderActionLink href={examDashboardHref} label="Exam Dashboard" theme={theme} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <GroupDashboardSidebar
              groupName={groupName}
              routeSegment={routeSegment}
              includeEditAttendance={includeEditAttendance}
              activeSection="overview"
            />
            <LecturerInfoCard user={user} groupName={groupName} />
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

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Fee Overview</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {overviewCards.map(card => (
                  <OverviewCard key={card.title} {...card} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
              <div className="mb-4 border-b border-slate-200 pb-3">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Quick Links</h2>
                
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <QuickLinkCard
                  href={`${baseDashboardHref}/attendance`}
                  title="Attendance"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/students`}
                  title="Students"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/absentees`}
                  title="Absentees"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/absentees`}
                  title="Consecutive Absentees"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/monthly`}
                  title="Monthly Reports"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/monthly`}
                  title="<75% Attendance"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/exams`}
                  title="Exam Dashboard"
                  
                />
                <QuickLinkCard
                  href={`${baseDashboardHref}/fees`}
                  title="Fee Dashboard"
                  
                />
                {includeEditAttendance ? (
                  <QuickLinkCard
                    href={`${baseDashboardHref}/edit`}
                    title="Edit Attendance"
                    
                  />
                ) : null}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Exam Summary</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Compact exam-wise performance snapshot by year
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {examsLoading
                    ? 'Loading...'
                    : `${firstYearExamSummaryRows.length + secondYearExamSummaryRows.length} exams`}
                </span>
              </div>

              <div className="space-y-4">
                <YearlyExamSummarySection
                  title="First Year"
                  rows={firstYearExamSummaryRows}
                  loading={examsLoading}
                />
                <YearlyExamSummarySection
                  title="Second Year"
                  rows={secondYearExamSummaryRows}
                  loading={examsLoading}
                />
              </div>
            </section>

          </div>
        </div>

        <section
          className={`rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} shadow-sm`}
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
