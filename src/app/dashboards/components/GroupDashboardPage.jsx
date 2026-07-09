//src/app/dashboards/components/GroupDashboardPage.jsx
'use client'
import { useState, useEffect } from 'react'
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
  includeExternalLinks = false,
  includeEditAttendance = false,
  statusDescription = 'Use quick actions below to mark attendance and open monthly analytics.',
}) {
  const { data: session } = useSession()
  const user = session?.user
  const [showAttendance, setShowAttendance] = useState(false)
  const [studentTable, setStudentTable] = useState(false)
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false)
  const [monthlyAttendance, setMonthlyAttendance] = useState(false)
  const [showExamResults, setShowExamResults] = useState(false)
  const [editAttendance, setEditAttendance] = useState(false)
  const [feeData, setFeeData] = useState([]);
const [loadingFees, setLoadingFees] = useState(true);
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

    

async function loadFees() {
  try {
    setLoadingFees(true);

    const res = await fetch("/api/fee/admin?limit=10000");
    const result = await res.json();

    if (result.status === "success") {
      setFeeData(result.data || []);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoadingFees(false);
  }
}

const groupSummary = feeData.reduce((acc, item) => {
  const group = item.studentId?.group || "Unknown";

  if (!acc[group]) {
    acc[group] = {
      group,
      students: 0,
      totalFee: 0,
      totalPaid: 0,
      balance: 0,
      pendingStudents: 0,
    };
  }

  acc[group].students += 1;
  acc[group].totalFee += item.totalFee || 0;
  acc[group].totalPaid += item.totalPaid || 0;
  acc[group].balance += item.balance || 0;

  if ((item.balance || 0) > 0) {
    acc[group].pendingStudents += 1;
  }

  return acc;
}, {});

const groupData = Object.values(groupSummary);
const dashboardSummary = groupData.reduce(
  (acc, group) => {
    acc.students += group.students;
    acc.totalFee += group.totalFee;
    acc.totalPaid += group.totalPaid;
    acc.balance += group.balance;
    acc.pendingStudents += group.pendingStudents;

    return acc;
  },
  {
    students: 0,
    totalFee: 0,
    totalPaid: 0,
    balance: 0,
    pendingStudents: 0,
  }
);

dashboardSummary.collectionPercentage =
  dashboardSummary.totalFee > 0
    ? ((dashboardSummary.totalPaid / dashboardSummary.totalFee) * 100).toFixed(2)
    : 0;

useEffect(() => {
  loadFees();
}, []);



  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

  <div className="bg-blue-600 text-white rounded-xl p-4">
    <p className="text-sm">Students</p>
    <h2 className="text-2xl font-bold">{dashboardSummary.students}</h2>
  </div>

  <div className="bg-indigo-600 text-white rounded-xl p-4">
    <p className="text-sm">Total Fee</p>
    <h2 className="text-2xl font-bold">
      ₹{dashboardSummary.totalFee.toLocaleString("en-IN")}
    </h2>
  </div>

  <div className="bg-green-600 text-white rounded-xl p-4">
    <p className="text-sm">Collected</p>
    <h2 className="text-2xl font-bold">
      ₹{dashboardSummary.totalPaid.toLocaleString("en-IN")}
    </h2>
  </div>

  <div className="bg-red-600 text-white rounded-xl p-4">
    <p className="text-sm">Balance</p>
    <h2 className="text-2xl font-bold">
      ₹{dashboardSummary.balance.toLocaleString("en-IN")}
    </h2>
  </div>

  <div className="bg-orange-500 text-white rounded-xl p-4">
    <p className="text-sm">Pending</p>
    <h2 className="text-2xl font-bold">
      {dashboardSummary.pendingStudents}
    </h2>
  </div>

  <div className="bg-emerald-700 text-white rounded-xl p-4">
    <p className="text-sm">Collection %</p>
    <h2 className="text-2xl font-bold">
      {dashboardSummary.collectionPercentage}%
    </h2>
  </div>

</div>



<div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

  <div className="overflow-x-auto">

    <table className="min-w-[2200px] w-full border-collapse">

      <thead className="sticky top-0 z-10 bg-blue-600 text-white whitespace-nowrap">
        <tr>

          <th className="border px-4 py-3 text-center">S.No</th>

          <th className="border px-4 py-3 text-left">Student Name</th>

          <th className="border px-4 py-3 text-center">Admission No</th>

          <th className="border px-4 py-3 text-center">Group</th>

          <th className="border px-4 py-3 text-center">Year</th>

          <th className="border px-4 py-3 text-center">Academic Year</th>

          <th className="border px-4 py-3 text-right">Total Fee</th>

          <th className="border px-4 py-3 text-right">Paid</th>

          <th className="border px-4 py-3 text-right">Balance</th>

          <th className="border px-4 py-3 text-center">Payments</th>

          <th className="border px-4 py-3 text-center">Status</th>

          <th className="border px-4 py-3 text-left">College</th>

          <th className="border px-4 py-3 text-center">Action</th>

        </tr>
      </thead>

      <tbody>

        {feeData
          .filter(item => item.studentId?.group === groupName)
          .map((item, index) => (

            <tr
              key={item._id}
              className="border-b even:bg-slate-50 hover:bg-blue-50 whitespace-nowrap"
            >

              <td className="border px-4 py-3 text-center font-semibold">
                {index + 1}
              </td>

              <td className="border px-4 py-3 font-semibold">
                {item.studentId?.name}
              </td>

              <td className="border px-4 py-3 text-center">
                {item.studentId?.admissionNo}
              </td>

              <td className="border px-4 py-3 text-center">
                {item.studentId?.group}
              </td>

              <td className="border px-4 py-3 text-center">
                {item.studentId?.yearOfStudy}
              </td>

              <td className="border px-4 py-3 text-center">
                {item.academicYear}
              </td>

              <td className="border px-4 py-3 text-right font-semibold">
                ₹{item.totalFee.toLocaleString("en-IN")}
              </td>

              <td className="border px-4 py-3 text-right font-semibold text-green-600">
                ₹{item.totalPaid.toLocaleString("en-IN")}
              </td>

              <td className="border px-4 py-3 text-right font-semibold text-red-600">
                ₹{item.balance.toLocaleString("en-IN")}
              </td>

              <td className="border px-4 py-3 text-center">
                {item.paymentCount}
              </td>

              <td className="border px-4 py-3 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : item.status === "Partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td className="border px-4 py-3">
                {item.studentId?.collegeId?.name}
              </td>

              <td className="border px-4 py-3 text-center">
                <button className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700">
                  View
                </button>
              </td>

            </tr>

        ))}

      </tbody>

    </table>

  </div>

</div>
      
      
      
      
      
      <div className="w-full space-y-4">
<div
  className={`flex flex-col gap-4 rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between`}
>
  {/* Left Section */}
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">
      Lecturer Dashboard
    </p>
    <h1 className="text-lg font-semibold text-slate-900">
      {groupName}
    </h1>
    <p className="text-sm text-slate-600">{collegeName}</p>
  </div>

  {/* Action Buttons */}
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
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

            <div className="mb-2 border-b border-slate-200 pb-2">
              <h2 className="text-2xl font-bold text-slate-900">Operations Hub</h2>
              
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
