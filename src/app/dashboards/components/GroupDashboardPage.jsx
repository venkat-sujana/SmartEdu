//src/app/dashboards/components/GroupDashboardPage.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserPlus } from 'lucide-react'
import TodayAbsenteesTable from '@/components/attendance/TodayAbsenteesTable'
import AttendanceForm from '@/components/attendance/AttendanceForm'
import IndividualReport from '@/components/attendance/IndividualReport'
import DashboardTogglePanel from '@/components/dashboard/DashboardTogglePanel'
import ExternalLinks from '@/components/ExternalLinks'
import DashboardFooter from '@/components/layout/Footer'
import GroupAttendanceSummary from '@/components/attendance/GroupAttendanceSummary'
import GroupShortageSummary from '@/components/attendance/GroupShortageSummary'
import LecturerInfoCard from '@/components/dashboard/LecturerInfoCard'
import GroupAttendanceCard from '@/components/OverallAttendanceMatrixCard/GroupAttendanceCard'
import GroupExamDashboardPanel from '@/components/exams/GroupExamDashboardPanel'
import GroupStudentTable from '@/components/tables/GroupStudentTable'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
// import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'

const fetcher = async url => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

export default function GroupDashboardPage({
  groupName,
  routeSegment,
  returnUrl,
  deskLabel,
  includeExternalLinks = false,
  includeEditAttendance = false,
  statusDescription = 'Use quick actions below to mark attendance and open monthly analytics.',
  overviewDescription,
}) {
  const { data: session } = useSession()
  const user = session?.user
  const [showAttendance, setShowAttendance] = useState(false)
  const [studentTable, setStudentTable] = useState(false)
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false)
  const [monthlyAttendance, setMonthlyAttendance] = useState(false)
  const [showExamResults, setShowExamResults] = useState(false)
  const [editAttendance, setEditAttendance] = useState(false)

  const collegeName = user?.collegeName || 'College'
  const { data: collegeDetails } = useSWR(
    user?.collegeId ? `/api/colleges/${user.collegeId}` : null,
    fetcher
  )
  const footerAddress = [collegeDetails?.address, collegeDetails?.district]
    .filter(Boolean)
    .join(', ')
  const footerPhone = collegeDetails?.phone || ''
  const footerEmail = collegeDetails?.email || ''
  const years = ['First Year', 'Second Year']
  const theme = getGroupTheme(groupName)

  const { data: consecutiveData } = useSWR(
    user?.collegeId ? `/api/attendance/consecutive-absentees?collegeId=${user.collegeId}` : null,
    fetcher
  )

  const consecutiveAbsentees = (consecutiveData?.absentees || []).filter(
    student => student.group === groupName
  )

  const dashboardReturnUrl = returnUrl || `/dashboards/${routeSegment}`

  const addStudentHref = `/register?group=${encodeURIComponent(groupName)}&returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
  const marksPostingHref = `/exams-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
  const examDashboardHref = `/exams?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`

  const editProps = includeEditAttendance
    ? {
        editAttendance,
        onToggleEditAttendance: () => setEditAttendance(v => !v),
        editAttendanceContent: <IndividualReport groupName={groupName} showTitle={false} />,
      }
    : {}

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
      <div className="w-full space-y-4">
        <div
          className={`flex items-center justify-between rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} px-4 py-3 shadow-sm`}
        >
          <div>
            <p className="text-xs tracking-wide text-slate-500 uppercase">Lecturer Dashboard</p>
            <h1 className="text-lg font-semibold text-slate-900">{groupName} Group</h1>
            <p className="text-sm text-slate-600">{collegeName}</p>
          </div>

          <Link
            href={addStudentHref}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </Link>
        </div>

        <section className="space-y-4">
          <LecturerInfoCard user={user} groupName={groupName} />

          {/* <ConsecutiveAbsenteesCard
            data={consecutiveAbsentees}
            title={`${groupName} Consecutive Absentees`}
            loading={!consecutiveData}
            showViewAll={false}
          /> */}

          <GroupAttendanceCard groupName={groupName} />

          <div
            className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm md:p-6`}
          >
            {includeExternalLinks && (
              <div
                className={`mb-4 rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3`}
              >
                <ExternalLinks />
              </div>
            )}

            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">Operations Hub</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={addStudentHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Link>
                <Link
                  href={marksPostingHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Post Marks
                </Link>
                <Link
                  href={examDashboardHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Exam Dashboard
                </Link>
              </div>
            </div>

            <DashboardTogglePanel
              showAttendance={showAttendance}
              studentTable={studentTable}
              showTodayAbsentees={showTodayAbsentees}
              monthlyAttendance={monthlyAttendance}
              onToggleAttendance={() => setShowAttendance(v => !v)}
              onToggleStudentTable={() => setStudentTable(v => !v)}
              onToggleTodayAbsentees={() => setShowTodayAbsentees(v => !v)}
              onToggleMonthlyAttendance={() => setMonthlyAttendance(v => !v)}
              onToggleExamResults={() => setShowExamResults(v => !v)}
              attendanceContent={
                <AttendanceForm defaultGroup={groupName} returnUrl={dashboardReturnUrl} />
              }
              studentTableContent={<GroupStudentTable groupName={groupName} />}
              todayAbsenteesContent={<TodayAbsenteesTable groupFilter={groupName} header={false} />}
              showExamResults={showExamResults}
              examResultsContent={<GroupExamDashboardPanel groupName={groupName} />}
              groupMonthlyAttendanceContent={
                <div className="space-y-4 py-2">
                  {years.map(year => (
                    <GroupAttendanceSummary key={year} group={groupName} yearOfStudy={year} />
                  ))}
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {years.map(year => (
                      <GroupShortageSummary
                        key={year}
                        group={groupName}
                        year={year}
                        collegeId={session?.user?.collegeId}
                        collegeName={session?.user?.collegeName}
                      />
                    ))}
                  </div>
                </div>
              }
              {...editProps}
            />
          </div>
        </section>

        <section
          className={`rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} shadow-sm`}
        >
          <DashboardFooter
            collegeName={collegeDetails?.name || collegeName}
            address={footerAddress || 'Address not available'}
            phone={footerPhone || 'Phone not available'}
            email={footerEmail || 'Email not available'}
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
