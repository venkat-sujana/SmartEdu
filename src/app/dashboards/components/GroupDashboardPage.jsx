//src/app/dashboards/components/GroupDashboardPage.jsx
'use client'
import { useState, useEffect, useCallback } from 'react'
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
import ConsecutiveAbsenteesCard from '@/components/attendance/cards/ConsecutiveAbsenteesCard'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

export default function GroupDashboardPage({
  groupName,
  routeSegment,
  returnUrl,
  includeExternalLinks = false,
  includeEditAttendance = true,
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
  const [feeData, setFeeData] = useState([])
  const [loadingFees, setLoadingFees] = useState(true)
  const [pendingOnly, setPendingOnly] = useState(false)
  const [paidOnly, setPaidOnly] = useState(false)
  const [selectedFeeYear, setSelectedFeeYear] = useState('All Years')
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    note: '',
  })

  const [systemSettings, setSystemSettings] = useState(null)
  const [showFeeModule, setShowFeeModule] = useState(true)
  const [showAdmissionsModule, setShowAdmissionsModule] = useState(true)

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
  const { data: groupDashboardData } = useSWR(
    user?.collegeId ? `/api/attendance/group-wise-today?collegeId=${user.collegeId}` : null,
    fetcher
  )
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

  const loadFees = useCallback(async () => {
    if (!user?.collegeId) return

    try {
      setLoadingFees(true)

      const res = await fetch(
        `/api/fee/lecturer?collegeId=${user.collegeId}&group=${encodeURIComponent(groupName)}`
      )

      const result = await res.json()

      if (result.status === 'success') {
        setFeeData(result.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingFees(false)
    }
  }, [user?.collegeId, groupName])

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
            studentId: selectedStudent.studentId || selectedStudent._id,
            collegeId: user?.collegeId,
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

      loadFees()
    } catch (error) {
      console.error(error)
      alert('Server Error')
    }
  }

  const loadSystemSettings = useCallback(async () => {
    if (!user?.collegeId) {
      setSystemSettings(null)
      return
    }

    try {
      const res = await fetch(`/api/settings?collegeId=${user.collegeId}`)

      const result = await res.json()

      if (result.success && result.data) {
        setSystemSettings(result.data)
      } else {
        setSystemSettings(null)
      }
    } catch (error) {
      console.error(error)
    }
  }, [user?.collegeId])

  const groupSummary = feeData.reduce((acc, item) => {
    const group = item.group || 'Unknown'

    if (!acc[group]) {
      acc[group] = {
        group,
        students: 0,
        totalFee: 0,
        totalPaid: 0,
        balance: 0,
        pendingStudents: 0,
      }
    }

    acc[group].students += 1
    acc[group].totalFee += item.totalFee || 0
    acc[group].totalPaid += item.totalPaid || 0
    acc[group].balance += item.balance || 0

    if ((item.balance || 0) > 0) {
      acc[group].pendingStudents += 1
    }

    return acc
  }, {})

  const exportFeePdf = () => {
    const doc = new jsPDF('landscape')

    doc.setFontSize(18)
    doc.text(collegeName || 'College', 14, 15)

    doc.setFontSize(14)
    doc.text(`${groupName} Fee Report`, 14, 24)

    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 31)

    const rows =
      groupFeeRows.length > 0
        ? groupFeeRows.map((item, index) => [
            String(index + 1),
            String(item.name || '-'),
            String(item.admissionNo || '-'),
            String(item.group || '-'),
            String(item.yearOfStudy || '-'),
            String(item.academicYear || '-'),
            `Rs.${Number(item.totalFee || 0).toLocaleString('en-IN')}`,
            `Rs.${Number(item.totalPaid || 0).toLocaleString('en-IN')}`,
            `Rs.${Number(item.balance || 0).toLocaleString('en-IN')}`,
            String(item.paymentCount || 0),
            String(item.status || '-'),
          ])
        : [['-', 'No records found for selected filters', '-', '-', '-', '-', '-', '-', '-', '-', '-']]

    autoTable(doc, {
      startY: 38,
      head: [
        [
          'S.No',
          'Student Name',
          'Admission No',
          'Group',
          'Year',
          'Academic Year',
          'Total Fee',
          'Paid',
          'Balance',
          'Payments',
          'Status',
        ],
      ],
      body: rows,
      theme: 'grid',
      tableWidth: 'auto',
      margin: { left: 10, right: 10 },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [37, 99, 235],
        fontSize: 8,
        halign: 'center',
      },
      bodyStyles: {
        textColor: [31, 41, 55],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 42 },
        2: { cellWidth: 24, halign: 'center' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 24, halign: 'center' },
        6: { cellWidth: 24, halign: 'right' },
        7: { cellWidth: 24, halign: 'right' },
        8: { cellWidth: 24, halign: 'right' },
        9: { cellWidth: 18, halign: 'center' },
        10: { cellWidth: 18, halign: 'center' },
      },
    })

    const finalY = doc.lastAutoTable.finalY + 10

    doc.setFontSize(11)

    const filterLabel = [
      groupName,
      selectedFeeYear !== 'All Years' ? selectedFeeYear : 'All Years',
      pendingOnly ? 'Pending Only' : paidOnly ? 'Paid Only' : 'All Statuses',
    ].join(' | ')

    doc.text(`Filters : ${filterLabel}`, 14, finalY)
    doc.text(`Students : ${feeSummary.students}`, 14, finalY + 8)
    doc.text(`Total Fee : ₹${feeSummary.totalFee.toLocaleString('en-IN')}`, 80, finalY + 8)
    doc.text(`Collected : ₹${feeSummary.totalPaid.toLocaleString('en-IN')}`, 150, finalY + 8)
    doc.text(`Balance : ₹${feeSummary.balance.toLocaleString('en-IN')}`, 225, finalY + 8)

    doc.save(`${groupName}-Fee-Report.pdf`)
  }

  const groupData = Object.values(groupSummary)
  // const [systemSettings, setSystemSettings] = useState(null)
  // const [showFeeModule, setShowFeeModule] = useState(true)


  const groupFeeRows = feeData.filter(item => {
    // Group filter
    if (item.group !== groupName) return false

    // Year filter
    if (selectedFeeYear !== 'All Years' && item.yearOfStudy !== selectedFeeYear) {
      return false
    }

    // Pending Only filter
    if (pendingOnly) {
      return item.status === 'Pending'
    }

    // Paid Only filter
    if (paidOnly) {
      return item.status === 'Paid'
    }

    return true
  })

  const feeSummary = groupFeeRows.reduce(
  (acc, item) => {
    acc.students += 1
    acc.totalFee += item.totalFee || 0
    acc.totalPaid += item.totalPaid || 0
    acc.balance += item.balance || 0
    acc.paymentCount += item.paymentCount || 0

    return acc
  },
  {
    students: 0,
    totalFee: 0,
    totalPaid: 0,
    balance: 0,
    paymentCount: 0,
  }
)

  




  // Fee summary from Group Dashboard API
  const firstYearFee = groupDashboardData?.feeSummary?.[groupName]?.['First Year'] || {
    total: 0,
    paid: 0,
    partial: 0,
    pending: 0,
  }

  const secondYearFee = groupDashboardData?.feeSummary?.[groupName]?.['Second Year'] || {
    total: 0,
    paid: 0,
    partial: 0,
    pending: 0,
  }

  const dashboardSummary = groupData.reduce(
    (acc, group) => {
      acc.students += group.students
      acc.totalFee += group.totalFee
      acc.totalPaid += group.totalPaid
      acc.balance += group.balance
      acc.pendingStudents += group.pendingStudents

      return acc
    },
    {
      students: 0,
      totalFee: 0,
      totalPaid: 0,
      balance: 0,
      pendingStudents: 0,
    }
  )

  dashboardSummary.collectionPercentage =
    dashboardSummary.totalFee > 0
      ? ((dashboardSummary.totalPaid / dashboardSummary.totalFee) * 100).toFixed(2)
      : 0
  useEffect(() => {
    loadFees()
  }, [loadFees, user?.collegeId, groupName])

  useEffect(() => {
    if (!user?.collegeId) return
    loadSystemSettings()
  }, [user?.collegeId, loadSystemSettings])

  console.log(systemSettings)

  useEffect(() => {
    if (!systemSettings) return

    const fee = systemSettings.modules?.fee

    // Module disabled
    if (!fee?.enabled) {
      setShowFeeModule(false)
      return
    }

    // Manual mode
    if (fee.mode === 'manual') {
      setShowFeeModule(true)
      return
    }

    // Automatic mode
    const today = new Date().toISOString().slice(0, 10)

    const show = today >= fee.startDate && today <= fee.endDate

    setShowFeeModule(show)
  }, [systemSettings])

  useEffect(() => {
    if (!systemSettings) return

    const admissions = systemSettings.modules?.admissions

    if (!admissions?.enabled) {
      setShowAdmissionsModule(false)
      return
    }

    if (admissions.mode === 'manual') {
      setShowAdmissionsModule(true)
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const show = today >= admissions.startDate && today <= admissions.endDate

    setShowAdmissionsModule(show)
  }, [systemSettings])

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
      {showFeeModule ? (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-8">
            <div className="rounded-xl bg-blue-600 p-4 text-white">
              <p className="text-sm">Students</p>
              <h2 className="text-2xl font-bold">{dashboardSummary.students}</h2>
            </div>

            <div className="rounded-xl bg-indigo-600 p-4 text-white">
              <p className="text-sm">Total Fee</p>
              <h2 className="text-2xl font-bold">
                ₹{dashboardSummary.totalFee.toLocaleString('en-IN')}
              </h2>
            </div>

            <div className="rounded-xl bg-green-600 p-4 text-white">
              <p className="text-sm">Collected</p>
              <h2 className="text-2xl font-bold">
                ₹{dashboardSummary.totalPaid.toLocaleString('en-IN')}
              </h2>
            </div>

            <div className="rounded-xl bg-red-600 p-4 text-white">
              <p className="text-sm">Balance</p>
              <h2 className="text-2xl font-bold">
                ₹{dashboardSummary.balance.toLocaleString('en-IN')}
              </h2>
            </div>

            <div className="rounded-xl bg-orange-500 p-4 text-white">
              <p className="text-sm">Pending</p>
              <h2 className="text-2xl font-bold">{dashboardSummary.pendingStudents}</h2>
            </div>

            <div className="rounded-xl bg-emerald-700 p-4 text-white">
              <p className="text-sm">Collection %</p>
              <h2 className="text-2xl font-bold">{dashboardSummary.collectionPercentage}%</h2>
            </div>

            <div className="rounded-xl bg-cyan-600 p-4 text-white">
              <p className="text-sm">First Year Fee</p>
              <h2 className="text-2xl font-bold">
                {firstYearFee.paid} / {firstYearFee.total}
              </h2>
            </div>

            <div className="rounded-xl bg-violet-600 p-4 text-white">
              <p className="text-sm">Second Year Fee</p>
              <h2 className="text-2xl font-bold">
                {secondYearFee.paid} / {secondYearFee.total}
              </h2>
            </div>
          </div>
          {/* ===== Fee Table ===== */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-linear-to-r from-slate-950 via-slate-900 to-blue-900 px-4 py-4 text-white sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.25em] text-blue-200 uppercase">
                    Fee Register
                  </p>
                  <h3 className="mt-1 text-xl font-black">{groupName} Fee Table</h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Compact mobile cards and a cleaner desktop ledger for quick review.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                    <p className="text-[11px] tracking-wide text-slate-300 uppercase">Students</p>
                    <p className="text-lg font-bold">{feeSummary.students}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
                    <p className="text-[11px] tracking-wide text-slate-300 uppercase">Balance</p>
                    <p className="text-lg font-bold">
                      ₹{feeSummary.balance.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
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
                  <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white">
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
                  <select
                    value={selectedFeeYear}
                    onChange={e => setSelectedFeeYear(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white outline-none"
                  >
                    <option value="All Years" className="text-slate-900">
                      All Years
                    </option>
                    <option value="First Year" className="text-slate-900">
                      First Year
                    </option>
                    <option value="Second Year" className="text-slate-900">
                      Second Year
                    </option>
                  </select>
                  <button
                    onClick={exportFeePdf}
                    className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2 xl:hidden">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Total Fee
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">
                  ₹{feeSummary.totalFee.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Collected
                </p>
                <p className="mt-1 text-lg font-black text-emerald-700">
                  ₹{feeSummary.totalPaid.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Payments
                </p>
                <p className="mt-1 text-lg font-black text-slate-900">{feeSummary.paymentCount}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Collection %
                </p>
                <p className="mt-1 text-lg font-black text-blue-700">
                  {dashboardSummary.collectionPercentage}%
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 xl:hidden">
              {groupFeeRows.map((item, index) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                        #{index + 1} • {item.admissionNo}
                      </p>
                      <h4 className="mt-1 text-base font-black text-slate-900">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.group} • {item.yearOfStudy}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
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

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                        Total Fee
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        ₹{item.totalFee.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-emerald-600 uppercase">
                        Paid
                      </p>
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        ₹{item.totalPaid.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-rose-600 uppercase">
                        Balance
                      </p>
                      <p className="mt-1 text-sm font-bold text-rose-700">
                        ₹{item.balance.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-[11px] font-semibold tracking-wide text-blue-600 uppercase">
                        Payments
                      </p>
                      <p className="mt-1 text-sm font-bold text-blue-700">{item.paymentCount}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                        Academic Year
                      </p>
                      <p className="truncate text-sm font-medium text-slate-700">
                        {item.academicYear}
                      </p>
                    </div>

                    {item.status === "Pending" ? (
  <button
    onClick={() => {
      setSelectedStudent(item)
      setPaymentForm({
        amount: "",
        note: "",
      })
      setShowFeeModal(true)
    }}
    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
  >
    Collect Fee
  </button>
) : (
  <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
    Completed
  </span>
)}
                  </div>
                </div>
              ))}

              {groupFeeRows.length === 0 && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">No fee records found</p>
                </div>
              )}
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className="w-full min-w-7xl border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-900 whitespace-nowrap text-white">
                  <tr>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      S.No
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left text-xs font-bold tracking-wide uppercase">
                      Student Name
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Admission No
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Group
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Year
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Academic Year
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-right text-xs font-bold tracking-wide uppercase">
                      Total Fee
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-right text-xs font-bold tracking-wide uppercase">
                      Paid
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-right text-xs font-bold tracking-wide uppercase">
                      Balance
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Payments
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Status
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-left text-xs font-bold tracking-wide uppercase">
                      College
                    </th>
                    <th className="border-b border-slate-700 px-3 py-3 text-center text-xs font-bold tracking-wide uppercase">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {groupFeeRows.map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 whitespace-nowrap even:bg-slate-50 hover:bg-blue-50"
                    >
                      <td className="px-3 py-3 text-center text-sm font-semibold">{index + 1}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-slate-900">
                        {item.name}
                      </td>
                      <td className="px-3 py-3 text-center text-sm">
                        {item.admissionNo}
                      </td>
                      <td className="px-3 py-3 text-center text-sm">{item.group}</td>
                      <td className="px-3 py-3 text-center text-sm">
                        {item.yearOfStudy}
                      </td>
                      <td className="px-3 py-3 text-center text-sm">{item.academicYear}</td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-slate-900">
                        ₹{item.totalFee.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-green-600">
                        ₹{item.totalPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-right text-sm font-semibold text-red-600">
                        ₹{item.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3 text-center text-sm">{item.paymentCount}</td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === 'Paid'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'Partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-700">
                        {item.studentId?.collegeId?.name}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {item.status === "Pending" ? (
  <button
    onClick={() => {
      setSelectedStudent(item)
      setPaymentForm({
        amount: "",
        note: "",
      })
      setShowFeeModal(true)
    }}
    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
  >
    Collect Fee
  </button>
) : (
  <span className="rounded-lg bg-green-100 px-3 py-2 text-xs font-bold text-green-700">
    Completed
  </span>
)}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-blue-100 font-bold text-slate-900">
                    <td className="px-3 py-3" colSpan={5}>
                      Grand Total
                    </td>
                    <td className="px-3 py-3 text-center">{feeSummary.students}</td>
                    <td className="px-3 py-3 text-right">
                      ₹{feeSummary.totalFee.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right text-green-700">
                      ₹{feeSummary.totalPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-right text-red-700">
                      ₹{feeSummary.balance.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-3 text-center">{feeSummary.paymentCount}</td>
                    <td className="px-3 py-3" colSpan={3}></td>
                  </tr>
                </tbody>
              </table>
            </div>
            {showFeeModal && selectedStudent && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <h2 className="mb-5 text-xl font-bold text-slate-900">
        Collect Fee
      </h2>

      <div className="space-y-3">

        <div>
          <p className="text-sm text-slate-500">Student</p>
          <p className="font-semibold">
            {selectedStudent.name}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Admission No</p>
          <p className="font-semibold">
            {selectedStudent.admissionNo}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-lg bg-slate-100 p-3 text-center">
            <p className="text-xs text-slate-500">Total</p>
            <p className="font-bold">
              ₹{selectedStudent.totalFee}
            </p>
          </div>

          <div className="rounded-lg bg-green-100 p-3 text-center">
            <p className="text-xs text-slate-500">Paid</p>
            <p className="font-bold text-green-700">
              ₹{selectedStudent.totalPaid}
            </p>
          </div>

          <div className="rounded-lg bg-red-100 p-3 text-center">
            <p className="text-xs text-slate-500">Balance</p>
            <p className="font-bold text-red-700">
              ₹{selectedStudent.balance}
            </p>
          </div>

        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">
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

      <div className="mt-5 space-y-4">

  <div>
    <label className="mb-1 block text-sm font-medium text-slate-700">
      Amount
    </label>

    <input
      type="number"
      value={paymentForm.amount}
      onChange={(e) =>
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
    <label className="mb-1 block text-sm font-medium text-slate-700">
      Note
    </label>

    <textarea
      rows={3}
      value={paymentForm.note}
      onChange={(e) =>
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

    </div>
  </div>
)}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-yellow-700">Fee Collection Closed</h2>

          <p className="mt-3 text-gray-700">
            Fee Dashboard is hidden because the configured fee collection period has ended.
          </p>
        </div>
      )}

      <div className="w-full space-y-4">
        <div
          className={`flex flex-col gap-4 rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between`}
        >
          {/* Left Section */}
          <div>
            <p className="text-xs tracking-wide text-slate-500 uppercase">Lecturer Dashboard</p>
            <h1 className="text-lg font-semibold text-slate-900">{groupName}</h1>
            <p className="text-sm text-slate-600">{collegeName}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
            {showAdmissionsModule ? (
              <Link
                href={addStudentHref}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400 shadow-sm"
                title="Admissions are currently closed"
              >
                <UserPlus className="h-4 w-4" />
                Admissions Closed
              </button>
            )}

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

        <ConsecutiveAbsenteesCard
          data={consecutiveAbsentees}
          title={`${groupName} Consecutive Absentees`}
          loading={!consecutiveData}
          showViewAll={false}
        />

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
