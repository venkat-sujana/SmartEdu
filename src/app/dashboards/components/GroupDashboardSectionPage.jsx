'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { UserPlus } from 'lucide-react'
import AttendanceForm from '@/components/attendance/AttendanceForm'
import GroupAttendanceSummary from '@/components/attendance/GroupAttendanceSummary'
import GroupShortageSummary from '@/components/attendance/GroupShortageSummary'
import IndividualReport from '@/components/attendance/IndividualReport'
import TodayAbsenteesTable from '@/components/attendance/TodayAbsenteesTable'
import ExternalLinks from '@/components/ExternalLinks'
import LecturerInfoCard from '@/components/dashboard/LecturerInfoCard'
import { getGroupTheme } from '@/components/dashboard/groupTheme'
import GroupExamDashboardPanel from '@/components/exams/GroupExamDashboardPanel'
import GroupAttendanceCard from '@/components/OverallAttendanceMatrixCard/GroupAttendanceCard'
import GroupStudentTable from '@/components/tables/GroupStudentTable'
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
import DashboardFooter from '@/components/layout/Footer'
import GroupDashboardSidebar from './GroupDashboardSidebar'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const YEARS = ['First Year', 'Second Year']

const fetcher = async url => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

function getCurrentAcademicYear() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const month = now.getMonth() + 1
  const startYear = month >= 6 ? currentYear : currentYear - 1
  return `${startYear}-${startYear + 1}`
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm sm:p-5 md:p-6">
      <div className="mb-4 border-b border-slate-200 pb-3">
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function FeeSummaryCard({ title, value, className }) {
  return (
    <div className={`rounded-2xl p-4 text-white shadow-sm sm:p-5 ${className}`}>
      <p className="text-xs text-white/80 sm:text-sm">{title}</p>
      <p className="mt-2 break-words text-xl font-black sm:text-2xl">{value}</p>
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
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm font-semibold shadow-sm transition sm:px-4 ${className}`}
    >
      <UserPlus className="h-4 w-4" />
      {label}
    </Link>
  )
}

export default function GroupDashboardSectionPage({
  groupName,
  routeSegment,
  includeExternalLinks = false,
  includeEditAttendance = true,
  section,
}) {
  const { data: session } = useSession()
  const user = session?.user
  const [pendingOnly, setPendingOnly] = useState(false)
  const [paidOnly, setPaidOnly] = useState(false)
  const [selectedFeeYear, setSelectedFeeYear] = useState('All Years')
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    note: '',
  })
  const theme = getGroupTheme(groupName)
  const dashboardReturnUrl = `/dashboards/${routeSegment}`
  const addStudentHref = `/register?group=${encodeURIComponent(groupName)}&returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
  const marksPostingHref = `/exams-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`
  const examDashboardHref = `/exams?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`

  const { data: collegeDetails } = useSWR(
    user?.collegeId ? `/api/colleges/${user.collegeId}` : null,
    fetcher
  )
  const { data: groupDashboardData } = useSWR(
    user?.collegeId ? `/api/attendance/group-wise-today?collegeId=${user.collegeId}` : null,
    fetcher
  )
  const { data: consecutiveData } = useSWR(
    user?.collegeId ? `/api/attendance/consecutive-absentees?collegeId=${user.collegeId}` : null,
    fetcher
  )
  const { data: feeRows = [] } = useSWR(
    user?.collegeId ? `/api/fee/lecturer?collegeId=${user.collegeId}&group=${encodeURIComponent(groupName)}` : null,
    fetcher
  )
  const feeRegister = feeRows

  const footerAddress = [collegeDetails?.address, collegeDetails?.district].filter(Boolean).join(', ')
  const collegeName = user?.collegeName || 'College'
  const consecutiveAbsentees = (consecutiveData?.absentees || []).filter(
    student => student.group === groupName
  )

  const feeData = Array.isArray(feeRows?.data) ? feeRows.data : []
  const filteredFeeData = useMemo(
    () =>
      feeData.filter(item => {
        if (selectedFeeYear !== 'All Years' && item.yearOfStudy !== selectedFeeYear) {
          return false
        }

        if (pendingOnly) {
          return item.status === 'Pending'
        }

        if (paidOnly) {
          return item.status === 'Paid'
        }

        return true
      }),
    [feeData, paidOnly, pendingOnly, selectedFeeYear]
  )

  const feeSummary = useMemo(
    () =>
      filteredFeeData.reduce(
        (acc, item) => {
          acc.students += 1
          acc.totalFee += item.totalFee || 0
          acc.totalPaid += item.totalPaid || 0
          acc.balance += item.balance || 0
          return acc
        },
        { students: 0, totalFee: 0, totalPaid: 0, balance: 0 }
      ),
    [filteredFeeData]
  )

  const firstYearFee = groupDashboardData?.feeSummary?.[groupName]?.['First Year'] || {
    total: 0,
    paid: 0,
  }
  const secondYearFee = groupDashboardData?.feeSummary?.[groupName]?.['Second Year'] || {
    total: 0,
    paid: 0,
  }

  const openPaymentModal = item => {
    setSelectedStudent(item)
    setPaymentForm({
      amount: '',
      note: '',
    })
    setShowFeeModal(true)
  }

  async function handleSavePayment() {
    if (!selectedStudent) return

    const enteredAmount = Number(paymentForm.amount)

    if (!enteredAmount || enteredAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const isExistingFeeRecord = Boolean(selectedStudent.feeId)
      const endpoint = isExistingFeeRecord
        ? `/api/fee/admin/${selectedStudent.feeId}`
        : '/api/fee/admin'
      const method = isExistingFeeRecord ? 'PUT' : 'POST'
      const payload = isExistingFeeRecord
        ? {
            amount: enteredAmount,
            note: paymentForm.note,
          }
        : {
            studentId:
              selectedStudent.studentId?._id ||
              selectedStudent.studentId ||
              selectedStudent._id,
            collegeId:
              selectedStudent.collegeId?._id ||
              selectedStudent.collegeId ||
              user?.collegeId,
            academicYear: selectedStudent.academicYear || getCurrentAcademicYear(),
            totalFee: Number(selectedStudent.totalFee) || enteredAmount,
            amount: enteredAmount,
            note: paymentForm.note,
          }

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        alert(result.error || 'Payment failed')
        return
      }

      alert('Payment saved successfully')
      setShowFeeModal(false)
      setSelectedStudent(null)
      setPaymentForm({
        amount: '',
        note: '',
      })
      if (feeRegister?.mutate) {
        feeRegister.mutate()
      }
    } catch (error) {
      console.error(error)
      alert('Server Error')
    }
  }

  const exportFeePdf = () => {
    const doc = new jsPDF({
      orientation: typeof window !== 'undefined' && window.innerWidth < 768 ? 'portrait' : 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    doc.setFontSize(18)
    doc.text(collegeName || 'College', 14, 15)
    doc.setFontSize(14)
    doc.text(`${groupName} Fee Report`, 14, 24)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 31)

    const rows =
      filteredFeeData.length > 0
        ? filteredFeeData.map((item, index) => [
            String(index + 1),
            String(item.name || '-'),
            String(item.admissionNo || '-'),
            String(item.yearOfStudy || '-'),
            String(item.academicYear || '-'),
            `Rs.${Number(item.totalFee || 0).toLocaleString('en-IN')}`,
            `Rs.${Number(item.totalPaid || 0).toLocaleString('en-IN')}`,
            `Rs.${Number(item.balance || 0).toLocaleString('en-IN')}`,
            String(item.status || '-'),
          ])
        : [['-', 'No records found', '-', '-', '-', '-', '-', '-', '-']]

    autoTable(doc, {
      startY: 38,
      head: [[
        'S.No',
        'Student Name',
        'Admission No',
        'Year',
        'Academic Year',
        'Total Fee',
        'Paid',
        'Balance',
        'Status',
      ]],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [37, 99, 235],
      },
    })

    const finalY = doc.lastAutoTable.finalY + 10
    const filterLabel = [
      selectedFeeYear !== 'All Years' ? selectedFeeYear : 'All Years',
      pendingOnly ? 'Pending Only' : paidOnly ? 'Paid Only' : 'All Statuses',
    ].join(' | ')

    doc.text(`Filters: ${filterLabel}`, 14, finalY)
    doc.text(`Students: ${feeSummary.students}`, 14, finalY + 8)
    doc.text(`Total Fee: Rs.${feeSummary.totalFee.toLocaleString('en-IN')}`, 70, finalY + 8)
    doc.text(`Collected: Rs.${feeSummary.totalPaid.toLocaleString('en-IN')}`, 145, finalY + 8)
    doc.text(`Balance: Rs.${feeSummary.balance.toLocaleString('en-IN')}`, 225, finalY + 8)

    doc.save(`${groupName}-Fee-Report.pdf`)
  }

  function renderSection() {
    if (section === 'attendance') {
      return (
        <SectionCard
          title="Attendance"
          description="Take attendance in a dedicated full-page workspace."
        >
          <AttendanceForm defaultGroup={groupName} returnUrl={dashboardReturnUrl} />
        </SectionCard>
      )
    }

    if (section === 'students') {
      return (
        <SectionCard title="Students" description="Browse the complete student table.">
          <GroupStudentTable groupName={groupName} />
        </SectionCard>
      )
    }

    if (section === 'absentees') {
      return (
        <div className="space-y-4">
          <SectionCard
            title="Today's Absentees"
            description="Today absentee records are easier to scan in a dedicated page."
          >
            <TodayAbsenteesTable groupFilter={groupName} header={false} />
          </SectionCard>

          <ConsecutiveAbsenteesCard
            data={consecutiveAbsentees}
            title={`${groupName} Consecutive Absentees`}
            loading={!consecutiveData}
            showViewAll={false}
          />
        </div>
      )
    }

    if (section === 'monthly') {
      return (
        <SectionCard
          title="Monthly Analytics"
          description="Monthly attendance reports and shortage summaries."
        >
          <div className="space-y-6">
            {YEARS.map(year => (
              <GroupAttendanceSummary key={year} group={groupName} yearOfStudy={year} />
            ))}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {YEARS.map(year => (
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
        </SectionCard>
      )
    }

    if (section === 'exams') {
      return (
        <SectionCard title="Exam Dashboard" description="Exam records and performance overview.">
          <GroupExamDashboardPanel groupName={groupName} />
        </SectionCard>
      )
    }

    if (section === 'edit' && includeEditAttendance) {
      return (
        <SectionCard
          title="Edit Attendance"
          description="Update or correct attendance entries from a focused screen."
        >
          <IndividualReport groupName={groupName} showTitle={false} />
        </SectionCard>
      )
    }

    if (section === 'fees') {
      return (
        <SectionCard title="Fee Dashboard" description="Group fee summary in a cleaner layout.">
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-slate-400 uppercase">
                  Fee Controls
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Filter student records and export the current view to PDF.
                </p>
              </div>

              <button
                onClick={exportFeePdf}
                className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Export PDF
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={pendingOnly}
                  onChange={e => {
                    const checked = e.target.checked
                    setPendingOnly(checked)
                    if (checked) {
                      setPaidOnly(false)
                    }
                  }}
                  className="h-4 w-4"
                />
                Pending Only
              </label>

              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={paidOnly}
                  onChange={e => {
                    const checked = e.target.checked
                    setPaidOnly(checked)
                    if (checked) {
                      setPendingOnly(false)
                    }
                  }}
                  className="h-4 w-4"
                />
                Paid Only
              </label>

              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Year Filter
                </p>
                <select
                  value={selectedFeeYear}
                  onChange={e => setSelectedFeeYear(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
                >
                  <option value="All Years">All Years</option>
                  <option value="First Year">First Year</option>
                  <option value="Second Year">Second Year</option>
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Active Filter
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {pendingOnly ? 'Pending Only' : paidOnly ? 'Paid Only' : 'All Statuses'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <FeeSummaryCard
              title="Students"
              value={feeSummary.students}
              className="bg-blue-600"
            />
            <FeeSummaryCard
              title="Total Fee"
              value={`Rs.${feeSummary.totalFee.toLocaleString('en-IN')}`}
              className="bg-indigo-600"
            />
            <FeeSummaryCard
              title="Collected"
              value={`Rs.${feeSummary.totalPaid.toLocaleString('en-IN')}`}
              className="bg-emerald-600"
            />
            <FeeSummaryCard
              title="Balance"
              value={`Rs.${feeSummary.balance.toLocaleString('en-IN')}`}
              className="bg-rose-600"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                First Year Fee
              </p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {firstYearFee.paid} / {firstYearFee.total}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Second Year Fee
              </p>
              <p className="mt-2 text-xl font-black text-slate-900">
                {secondYearFee.paid} / {secondYearFee.total}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {filteredFeeData.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-semibold text-slate-600">No fee records found</p>
              </div>
            ) : (
              filteredFeeData.map(item => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        {item.admissionNo}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.yearOfStudy} | {item.academicYear}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === 'Paid'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Partial'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                        Total Fee
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        Rs.{Number(item.totalFee || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-emerald-600 uppercase">
                        Paid
                      </p>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        Rs.{Number(item.totalPaid || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-rose-600 uppercase">
                        Balance
                      </p>
                      <p className="mt-1 text-sm font-bold text-rose-700">
                        Rs.{Number(item.balance || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
                        Payments
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-700">
                        {item.paymentCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                        Academic Year
                      </p>
                      <p className="truncate text-sm font-medium text-slate-700">
                        {item.academicYear}
                      </p>
                    </div>

                    {item.status === 'Pending' ? (
                      <button
                        onClick={() => openPaymentModal(item)}
                        className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:w-auto"
                      >
                        Collect Fee
                      </button>
                    ) : (
                      <span className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {showFeeModal && selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
                <h2 className="mb-5 text-xl font-bold text-slate-900">Collect Fee</h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Student</p>
                    <p className="font-semibold">{selectedStudent.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Admission No</p>
                    <p className="font-semibold">{selectedStudent.admissionNo}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-slate-100 p-3 text-center">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-bold">Rs.{selectedStudent.totalFee}</p>
                    </div>

                    <div className="rounded-lg bg-green-100 p-3 text-center">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="font-bold text-green-700">Rs.{selectedStudent.totalPaid}</p>
                    </div>

                    <div className="rounded-lg bg-red-100 p-3 text-center">
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className="font-bold text-red-700">Rs.{selectedStudent.balance}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Amount</label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={e =>
                        setPaymentForm({
                          ...paymentForm,
                          amount: e.target.value,
                        })
                      }
                      placeholder="Enter Amount"
                      className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Note</label>
                    <textarea
                      rows={3}
                      value={paymentForm.note}
                      onChange={e =>
                        setPaymentForm({
                          ...paymentForm,
                          note: e.target.value,
                        })
                      }
                      placeholder="Optional Note"
                      className="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={() => setShowFeeModal(false)}
                    className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSavePayment}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                  >
                    Save Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )
    }

    return null
  }

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-3 sm:p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div
          className={`flex flex-col gap-4 rounded-3xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between`}
        >
          <div>
            <p className="text-xs tracking-[0.25em] text-slate-500 uppercase">Lecturer Dashboard</p>
            <h1 className="mt-2 text-xl font-black text-slate-900 capitalize sm:text-2xl">{groupName} {section}</h1>
            <p className="mt-1 text-sm text-slate-600">{collegeName}</p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <HeaderActionLink
              href={dashboardReturnUrl}
              label="Back to Dashboard"
              theme={theme}
              variant="neutral"
            />
            <HeaderActionLink href={addStudentHref} label="Add Student" theme={theme} />
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
              activeSection={section}
            />
            <LecturerInfoCard user={user} groupName={groupName} />
            <GroupAttendanceCard groupName={groupName} />
            {includeExternalLinks ? (
              <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm">
                <ExternalLinks />
              </div>
            ) : null}
          </div>

          <div className="space-y-4">{renderSection()}</div>
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
