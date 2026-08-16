//src/app/dashboards/mlt/fees/page.jsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { getGroupTheme } from '@/components/dashboard/groupTheme'

const fetcher = async url => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

function getCurrentAcademicYear() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  return month >= 5
    ? `${year}-${year + 1}`
    : `${year - 1}-${year}`
}

function FeeSummaryCard({ title, value, className = '' }) {
  return (
    <div
      className={`
        ${className}
        min-h-[70px]
        rounded-xl
        px-3 py-2.5
        text-white
        shadow-sm
      `}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/75">
        {title}
      </p>

      <p className="mt-1 text-lg font-black">
        {value}
      </p>
    </div>
  )
}

export default function FeeDashboardPage() {
  const { data: session } = useSession()

  const user = session?.user

  const groupName = 'MLT'
  const routeSegment = 'mlt'
  const theme = getGroupTheme(groupName)

  const dashboardReturnUrl = `/dashboards/${routeSegment}`

  const [pendingOnly, setPendingOnly] = useState(false)
  const [paidOnly, setPaidOnly] = useState(false)
  const [selectedFeeYear, setSelectedFeeYear] = useState('All Years')

  const [showFeeModal, setShowFeeModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    note: '',
  })

  const collegeName = user?.collegeName || 'College'
  const collegeId = user?.collegeId

  // --------------------------------------------------
  // Fee API
  // --------------------------------------------------

  const {
    data: feeRows = [],
    mutate: mutateFees,
    isLoading: feeLoading,
  } = useSWR(
    collegeId
      ? `/api/fee/lecturer?collegeId=${collegeId}&group=${encodeURIComponent(
          groupName
        )}`
      : null,
    fetcher
  )

  // --------------------------------------------------
  // Fee data
  // --------------------------------------------------

  const feeData = useMemo(() => {
    return Array.isArray(feeRows?.data)
      ? feeRows.data
      : []
  }, [feeRows])

  // --------------------------------------------------
  // Filters
  // --------------------------------------------------

  const filteredFeeData = useMemo(() => {
    return feeData.filter(item => {
      if (
        selectedFeeYear !== 'All Years' &&
        item.yearOfStudy !== selectedFeeYear
      ) {
        return false
      }

      if (pendingOnly) {
        return item.status === 'Pending'
      }

      if (paidOnly) {
        return item.status === 'Paid'
      }

      return true
    })
  }, [
    feeData,
    pendingOnly,
    paidOnly,
    selectedFeeYear,
  ])

  // --------------------------------------------------
  // Summary
  // --------------------------------------------------

  const feeSummary = useMemo(() => {
    const students = filteredFeeData.length

    const totalFee = filteredFeeData.reduce(
      (sum, item) =>
        sum + Number(item.totalFee || 0),
      0
    )

    const totalPaid = filteredFeeData.reduce(
      (sum, item) =>
        sum + Number(item.totalPaid || 0),
      0
    )

    const balance = totalFee - totalPaid

    return {
      students,
      totalFee,
      totalPaid,
      balance,
    }
  }, [filteredFeeData])

  // --------------------------------------------------
  // Year-wise fee summary
  // --------------------------------------------------

  const firstYearFee = useMemo(() => {
    const rows = filteredFeeData.filter(
      item => item.yearOfStudy === 'First Year'
    )

    return {
      total: rows.reduce(
        (sum, item) =>
          sum + Number(item.totalFee || 0),
        0
      ),

      paid: rows.reduce(
        (sum, item) =>
          sum + Number(item.totalPaid || 0),
        0
      ),
    }
  }, [filteredFeeData])

  const secondYearFee = useMemo(() => {
    const rows = filteredFeeData.filter(
      item => item.yearOfStudy === 'Second Year'
    )

    return {
      total: rows.reduce(
        (sum, item) =>
          sum + Number(item.totalFee || 0),
        0
      ),

      paid: rows.reduce(
        (sum, item) =>
          sum + Number(item.totalPaid || 0),
        0
      ),
    }
  }, [filteredFeeData])

  // --------------------------------------------------
  // Open payment modal
  // --------------------------------------------------

  const openPaymentModal = item => {
    setSelectedStudent(item)

    setPaymentForm({
      amount: '',
      note: '',
    })

    setShowFeeModal(true)
  }

  // --------------------------------------------------
  // Save payment
  // --------------------------------------------------

  async function handleSavePayment() {
    if (!selectedStudent) return

    const enteredAmount = Number(
      paymentForm.amount
    )

    if (!enteredAmount || enteredAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const isExistingFeeRecord =
        Boolean(selectedStudent.feeId)

      const endpoint = isExistingFeeRecord
        ? `/api/fee/admin/${selectedStudent.feeId}`
        : '/api/fee/admin'

      const method = isExistingFeeRecord
        ? 'PUT'
        : 'POST'

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

            academicYear:
              selectedStudent.academicYear ||
              getCurrentAcademicYear(),

            totalFee:
              Number(selectedStudent.totalFee) ||
              enteredAmount,

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

      await mutateFees()
    } catch (error) {
      console.error(error)
      alert('Server Error')
    }
  }

  // --------------------------------------------------
  // Export PDF
  // --------------------------------------------------

  const exportFeePdf = () => {
    const doc = new jsPDF({
      orientation:
        typeof window !== 'undefined' &&
        window.innerWidth < 768
          ? 'portrait'
          : 'landscape',

      unit: 'mm',
      format: 'a4',
    })

    doc.setFontSize(18)

    doc.text(
      collegeName || 'College',
      14,
      15
    )

    doc.setFontSize(14)

    doc.text(
      `${groupName} Fee Report`,
      14,
      24
    )

    doc.setFontSize(10)

    doc.text(
      `Generated: ${new Date().toLocaleString(
        'en-IN'
      )}`,
      14,
      31
    )

    const rows =
      filteredFeeData.length > 0
        ? filteredFeeData.map(
            (item, index) => [
              String(index + 1),

              String(
                item.name || '-'
              ),

              String(
                item.admissionNo || '-'
              ),

              String(
                item.yearOfStudy || '-'
              ),

              String(
                item.academicYear || '-'
              ),

              `Rs.${Number(
                item.totalFee || 0
              ).toLocaleString('en-IN')}`,

              `Rs.${Number(
                item.totalPaid || 0
              ).toLocaleString('en-IN')}`,

              `Rs.${Math.max(
                Number(item.totalFee || 0) -
                  Number(item.totalPaid || 0),
                0
              ).toLocaleString('en-IN')}`,

              String(
                item.status || '-'
              ),
            ]
          )
        : [
            [
              '-',
              'No records found',
              '-',
              '-',
              '-',
              '-',
              '-',
              '-',
              '-',
            ],
          ]

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
        valign: 'middle',
      },

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },

      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 42 },
        2: { cellWidth: 28 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 },
        8: { cellWidth: 22 },
      },

      margin: {
        left: 7,
        right: 7,
      },
    })

    const finalY =
      doc.lastAutoTable.finalY + 10

    const filterLabel = [
      selectedFeeYear !== 'All Years'
        ? selectedFeeYear
        : 'All Years',

      pendingOnly
        ? 'Pending Only'
        : paidOnly
          ? 'Paid Only'
          : 'All Statuses',
    ].join(' | ')

    doc.setFontSize(9)

    doc.text(
      `Filters: ${filterLabel}`,
      14,
      finalY
    )

    doc.text(
      `Students: ${feeSummary.students}`,
      14,
      finalY + 8
    )

    doc.text(
      `Total Fee: Rs.${feeSummary.totalFee.toLocaleString(
        'en-IN'
      )}`,
      65,
      finalY + 8
    )

    doc.text(
      `Collected: Rs.${feeSummary.totalPaid.toLocaleString(
        'en-IN'
      )}`,
      140,
      finalY + 8
    )

    doc.text(
      `Balance: Rs.${feeSummary.balance.toLocaleString(
        'en-IN'
      )}`,
      215,
      finalY + 8
    )

    doc.save(
      `${groupName}-Fee-Report.pdf`
    )
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <main
      className={`
        min-h-screen
        bg-linear-to-br
        ${theme.shell}
        px-2 py-3
        sm:px-3 sm:py-4
        md:px-4
      `}
    >
      <div className="mx-auto w-full max-w-7xl space-y-3">

        {/* Header */}

        <header
          className={`
            rounded-xl
            border ${theme.softBorder}
            bg-linear-to-r ${theme.soft}
            px-3 py-2.5
            shadow-sm
            sm:px-4 sm:py-3
          `}
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Lecturer Dashboard
              </p>

              <h1 className="mt-0.5 text-base font-black text-slate-900 sm:text-lg">
                Fee Dashboard
              </h1>

              <p className="mt-0.5 text-[11px] text-slate-500">
                {groupName} • Fee Collection & Records
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-700">
                {collegeName}
              </p>
            </div>

            <Link
              href={dashboardReturnUrl}
              className="
                inline-flex min-h-9
                items-center justify-center
                gap-1.5
                rounded-lg
                border border-slate-200
                bg-white
                px-3 py-1.5
                text-xs font-bold text-slate-700
                shadow-sm
                transition
                hover:bg-slate-50
              "
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>

          </div>
        </header>

        {/* Filters */}

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-sm font-black text-slate-900 sm:text-base">
                Fee Filters
              </h2>

              <p className="text-[11px] text-slate-500">
                Filter fee records before collection or export.
              </p>
            </div>

            <button
              onClick={exportFeePdf}
              className="
                rounded-xl
                bg-red-500
                px-4 py-2
                text-sm font-semibold
                text-white
                transition
                hover:bg-red-600
              "
            >
              Export PDF
            </button>

          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={pendingOnly}
                onChange={e => {
                  const checked =
                    e.target.checked

                  setPendingOnly(checked)

                  if (checked) {
                    setPaidOnly(false)
                  }
                }}
                className="h-4 w-4"
              />

              Pending Only
            </label>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={paidOnly}
                onChange={e => {
                  const checked =
                    e.target.checked

                  setPaidOnly(checked)

                  if (checked) {
                    setPendingOnly(false)
                  }
                }}
                className="h-4 w-4"
              />

              Paid Only
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">

              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Year Filter
              </p>

              <select
                value={selectedFeeYear}
                onChange={e =>
                  setSelectedFeeYear(
                    e.target.value
                  )
                }
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none"
              >
                <option value="All Years">
                  All Years
                </option>

                <option value="First Year">
                  First Year
                </option>

                <option value="Second Year">
                  Second Year
                </option>
              </select>

            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">

              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Active Filter
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-900">
                {pendingOnly
                  ? 'Pending Only'
                  : paidOnly
                    ? 'Paid Only'
                    : 'All Statuses'}
              </p>

            </div>

          </div>

        </section>

        {/* Summary */}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <FeeSummaryCard
            title="Students"
            value={feeSummary.students}
            className="bg-blue-600"
          />

          <FeeSummaryCard
            title="Total Fee"
            value={`Rs.${feeSummary.totalFee.toLocaleString(
              'en-IN'
            )}`}
            className="bg-indigo-600"
          />

          <FeeSummaryCard
            title="Collected"
            value={`Rs.${feeSummary.totalPaid.toLocaleString(
              'en-IN'
            )}`}
            className="bg-emerald-600"
          />

          <FeeSummaryCard
            title="Balance"
            value={`Rs.${feeSummary.balance.toLocaleString(
              'en-IN'
            )}`}
            className="bg-rose-600"
          />

        </section>

        {/* Year-wise Fee */}

        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              First Year Fee
            </p>

            <p className="mt-2 text-xl font-black text-slate-900">
              {firstYearFee.paid} / {firstYearFee.total}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Collected / Total
            </p>

          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Second Year Fee
            </p>

            <p className="mt-2 text-xl font-black text-slate-900">
              {secondYearFee.paid} / {secondYearFee.total}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Collected / Total
            </p>

          </div>

        </section>

        {/* Fee Records */}

        <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

          <div className="mb-4 border-b border-slate-100 pb-3">

            <h2 className="text-base font-black text-slate-900">
              Student Fee Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredFeeData.length} record(s) shown
            </p>

          </div>

          {feeLoading ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm text-slate-500">
                Loading fee records...
              </p>
            </div>
          ) : filteredFeeData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No fee records found
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {filteredFeeData.map(item => {

                const totalFee =
                  Number(item.totalFee || 0)

                const totalPaid =
                  Number(item.totalPaid || 0)

                const balance =
                  Math.max(
                    totalFee - totalPaid,
                    0
                  )

                return (
                  <div
                    key={item._id}
                    className="
                      rounded-xl
                      border border-slate-200
                      bg-white
                      p-4
                      shadow-sm
                    "
                  >

                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                      <div className="min-w-0">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {item.admissionNo || '-'}
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-slate-900">
                          {item.name || '-'}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {item.yearOfStudy || '-'}
                          {' | '}
                          {item.academicYear || '-'}
                        </p>

                      </div>

                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-3 py-1
                          text-xs font-bold
                          ${
                            item.status === 'Paid'
                              ? 'bg-green-100 text-green-700'
                              : item.status === 'Partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }
                        `}
                      >
                        {item.status || '-'}
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Total Fee
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          Rs.{totalFee.toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                          Paid
                        </p>

                        <p className="mt-1 text-sm font-bold text-emerald-700">
                          Rs.{totalPaid.toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-rose-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                          Balance
                        </p>

                        <p className="mt-1 text-sm font-bold text-rose-700">
                          Rs.{balance.toLocaleString(
                            'en-IN'
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Academic Year
                        </p>

                        <p className="mt-1 truncate text-sm font-bold text-slate-900">
                          {item.academicYear || '-'}
                        </p>
                      </div>

                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Payment Status
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {item.status || '-'}
                        </p>
                      </div>

                      {item.status === 'Pending' ? (
                        <button
                          onClick={() =>
                            openPaymentModal(item)
                          }
                          className="
                            w-full
                            rounded-xl
                            bg-emerald-600
                            px-4 py-2.5
                            text-xs font-semibold
                            text-white
                            hover:bg-emerald-700
                            sm:w-auto
                          "
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
                )
              })}

            </div>
          )}

        </section>

        {/* Payment Modal */}

        {showFeeModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">

              <h2 className="mb-5 text-xl font-bold text-slate-900">
                Collect Fee
              </h2>

              <div className="space-y-3">

                <div>
                  <p className="text-sm text-slate-500">
                    Student
                  </p>

                  <p className="font-semibold text-slate-900">
                    {selectedStudent.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Admission No
                  </p>

                  <p className="font-semibold text-slate-900">
                    {selectedStudent.admissionNo || '-'}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <div className="rounded-lg bg-slate-100 p-3 text-center">
                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="font-bold">
                      Rs.
                      {Number(
                        selectedStudent.totalFee || 0
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-green-100 p-3 text-center">
                    <p className="text-xs text-slate-500">
                      Paid
                    </p>

                    <p className="font-bold text-green-700">
                      Rs.
                      {Number(
                        selectedStudent.totalPaid || 0
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-rose-100 p-3 text-center">
                    <p className="text-xs text-slate-500">
                      Balance
                    </p>

                    <p className="font-bold text-rose-700">
                      Rs.
                      {Math.max(
                        Number(
                          selectedStudent.totalFee || 0
                        ) -
                          Number(
                            selectedStudent.totalPaid || 0
                          ),
                        0
                      ).toLocaleString('en-IN')}
                    </p>
                  </div>

                </div>

              </div>

              <div className="mt-5 space-y-4">

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Amount
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={paymentForm.amount}
                    onChange={e =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: e.target.value,
                      })
                    }
                    placeholder="Enter Amount"
                    className="
                      w-full
                      rounded-lg
                      border border-slate-300
                      p-3
                      focus:border-blue-500
                      focus:outline-none
                    "
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Note
                  </label>

                  <textarea
                    value={paymentForm.note}
                    onChange={e =>
                      setPaymentForm({
                        ...paymentForm,
                        note: e.target.value,
                      })
                    }
                    placeholder="Optional note"
                    rows={3}
                    className="
                      w-full
                      rounded-lg
                      border border-slate-300
                      p-3
                      focus:border-blue-500
                      focus:outline-none
                    "
                  />
                </div>

              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  onClick={() => {
                    setShowFeeModal(false)
                    setSelectedStudent(null)
                  }}
                  className="
                    rounded-lg
                    bg-gray-500
                    px-4 py-2
                    text-white
                    hover:bg-gray-600
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={handleSavePayment}
                  className="
                    rounded-lg
                    bg-emerald-600
                    px-4 py-2
                    text-white
                    hover:bg-emerald-700
                  "
                >
                  Save Payment
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  )
}