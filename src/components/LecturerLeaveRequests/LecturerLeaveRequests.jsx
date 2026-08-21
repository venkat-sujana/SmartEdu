'use client'

import { useEffect, useState } from 'react'

/* =========================================================
   Helper: Format Date
   ========================================================= */

function formatDate(value) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/* =========================================================
   Helper: Status Style
   ========================================================= */

function getStatusStyle(status) {
  if (status === 'Approved') {
    return 'border-green-300 bg-green-50 text-green-700'
  }

  if (status === 'Rejected') {
    return 'border-red-300 bg-red-50 text-red-700'
  }

  return 'border-amber-300 bg-amber-50 text-amber-700'
}

/* =========================================================
   Review Panel
   ========================================================= */

function ReviewPanel({
  remark,
  setRemark,
  reviewAction,
  reviewLoading,
  cancelReview,
  submitReview,
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-left">

      {/* Review title */}

      <p className="mb-2 text-xs font-bold text-blue-800">
        {reviewAction === 'Approved'
          ? '✅ Approve Leave'
          : '❌ Reject Leave'}
      </p>

      {/* Remark */}

      <textarea
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Lecturer remark (optional)"
        disabled={reviewLoading}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

      {/* Character count */}

      <div className="mt-1 text-right text-xs text-slate-400">
        {remark.length}/500
      </div>

      {/* Buttons */}

      <div className="mt-2 flex justify-end gap-2">

        <button
          type="button"
          onClick={cancelReview}
          disabled={reviewLoading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={submitReview}
          disabled={reviewLoading}
          className={`rounded-lg px-3 py-2 text-xs font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50 ${
            reviewAction === 'Approved'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {reviewLoading
            ? 'Saving...'
            : reviewAction === 'Approved'
              ? 'Confirm Approve'
              : 'Confirm Reject'}
        </button>

      </div>
    </div>
  )
}

/* =========================================================
   Main Component
   ========================================================= */

export default function LecturerLeaveRequests() {

  const [requests, setRequests] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const [reviewingId, setReviewingId] = useState(null)

  const [reviewAction, setReviewAction] = useState('')

  const [remark, setRemark] = useState('')

  const [reviewLoading, setReviewLoading] = useState(false)

  /* =======================================================
     Load Lecturer Leave Requests
     ======================================================= */

  async function loadLeaveRequests() {
    try {
      setLoading(true)
      setError('')

      const res = await fetch(
        '/api/leave/lecturer',
        {
          cache: 'no-store',
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data?.message ||
            'Failed to load leave requests'
        )
      }

      setRequests(
        Array.isArray(data?.data)
          ? data.data
          : []
      )

    } catch (error) {

      console.error(
        'Lecturer leave requests error:',
        error
      )

      setError(
        error.message ||
          'Failed to load leave requests'
      )

    } finally {

      setLoading(false)

    }
  }

  /* =======================================================
     Initial Load
     ======================================================= */

  useEffect(() => {
    loadLeaveRequests()
  }, [])

  /* =======================================================
     Pending Count
     ======================================================= */

  const pendingCount = requests.filter(
    (request) =>
      request.status === 'Pending'
  ).length

  /* =======================================================
     Open Review
     ======================================================= */

  function openReview(request, action) {

    setReviewingId(request._id)

    setReviewAction(action)

    setRemark('')

    setError('')
  }

  /* =======================================================
     Cancel Review
     ======================================================= */

  function cancelReview() {

    if (reviewLoading) return

    setReviewingId(null)

    setReviewAction('')

    setRemark('')
  }

  /* =======================================================
     Submit Approve / Reject
     ======================================================= */

  async function submitReview() {

    if (!reviewingId) return

    if (remark.length > 500) {

      setError(
        'Lecturer remark cannot exceed 500 characters'
      )

      return
    }

    try {

      setReviewLoading(true)

      setError('')

      const res = await fetch(
        '/api/leave/lecturer/review',
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            leaveRequestId: reviewingId,

            action: reviewAction,

            lecturerRemark:
              remark.trim(),
          }),
        }
      )

      const data = await res.json()

      if (!res.ok) {

        throw new Error(
          data?.message ||
            'Failed to review leave request'
        )
      }

      /* -----------------------------------------------
         Close review panel
         ----------------------------------------------- */

      setReviewingId(null)

      setReviewAction('')

      setRemark('')

      /* -----------------------------------------------
         Reload latest data
         ----------------------------------------------- */

      await loadLeaveRequests()

    } catch (error) {

      console.error(
        'Leave review error:',
        error
      )

      setError(
        error.message ||
          'Failed to review leave request'
      )

    } finally {

      setReviewLoading(false)

    }
  }

  /* =======================================================
     Loading
     ======================================================= */

  if (loading) {

    return (
      <section className="rounded-2xl border border-amber-200 bg-white p-5 shadow">

        <div className="flex items-center justify-center gap-3 py-5">

          <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />

          <span className="text-sm font-semibold text-slate-500">
            Loading leave requests...
          </span>

        </div>

      </section>
    )
  }

  /* =======================================================
     Main UI
     ======================================================= */

  return (
    <section className="mx-auto w-full max-w-6xl rounded-2xl border border-amber-200 bg-white p-4 shadow-lg md:p-5">

      {/* ===================================================
          Header
          =================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <h2 className="flex items-center gap-2 text-xl font-extrabold text-amber-800">
            🔔 Student Leave Requests
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Leave applications from your assigned group
          </p>

        </div>

        {/* Counters */}

        <div className="flex flex-wrap items-center gap-2">

          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
            Total: {requests.length}
          </span>

          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
            Pending: {pendingCount}
          </span>

        </div>

      </div>

      {/* ===================================================
          Error
          =================================================== */}

      {error && (

        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>

      )}

      {/* ===================================================
          No Requests
          =================================================== */}

      {requests.length === 0 ? (

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">

          <p className="text-sm font-semibold text-slate-500">
            📭 No leave requests found.
          </p>

        </div>

      ) : (

        <>
          {/* =================================================
              DESKTOP TABLE
              md and above
              ================================================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full min-w-[900px] border-collapse text-sm">

              {/* Table Header */}

              <thead>

                <tr className="bg-linear-to-r from-amber-100 to-orange-100 text-slate-800">

                  <th className="border border-amber-200 px-3 py-3 text-left">
                    Student
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-center">
                    Admission No
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-center">
                    Date
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-center">
                    Session
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-left">
                    Reason
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-center">
                    Status
                  </th>

                  <th className="border border-amber-200 px-3 py-3 text-center">
                    Action
                  </th>

                </tr>

              </thead>

              {/* Table Body */}

              <tbody>

                {requests.map(
                  (request, index) => {

                    const student =
                      request.studentId

                    const isReviewing =
                      reviewingId ===
                      request._id

                    return (

                      <tr
                        key={request._id}
                        className={
                          index % 2 === 0
                            ? 'bg-white'
                            : 'bg-slate-50'
                        }
                      >

                        {/* Student */}

                        <td className="border px-3 py-3">

                          <p className="font-bold text-slate-800">
                            {student?.name || '—'}
                          </p>

                          <p className="text-xs text-slate-500">
                            {student?.yearOfStudy || '—'}
                          </p>

                        </td>

                        {/* Admission */}

                        <td className="border px-3 py-3 text-center font-semibold text-blue-700">

                          {student?.admissionNo || '—'}

                        </td>

                        {/* Date */}

                        <td className="border px-3 py-3 text-center font-semibold">

                          {formatDate(
                            request.leaveDate
                          )}

                        </td>

                        {/* Session */}

                        <td className="border px-3 py-3 text-center">

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">

                            {request.session}

                          </span>

                        </td>

                        {/* Reason */}

                        <td className="border px-3 py-3 font-medium text-slate-700">

                          {request.reason || '—'}

                        </td>

                        {/* Status */}

                        <td className="border px-3 py-3 text-center">

                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${getStatusStyle(
                              request.status
                            )}`}
                          >

                            {request.status ===
                            'Pending'
                              ? '⏳'
                              : request.status ===
                                'Approved'
                                ? '✅'
                                : '❌'}{' '}

                            {request.status}

                          </span>

                        </td>

                        {/* Action */}

                        <td className="border px-3 py-3 text-center">

                          {request.status ===
                          'Pending' ? (

                            <div className="flex flex-col gap-2">

                              <div className="flex justify-center gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      request,
                                      'Approved'
                                    )
                                  }
                                  disabled={
                                    reviewLoading
                                  }
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  ✅ Approve
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReview(
                                      request,
                                      'Rejected'
                                    )
                                  }
                                  disabled={
                                    reviewLoading
                                  }
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  ❌ Reject
                                </button>

                              </div>

                              {isReviewing && (

                                <ReviewPanel
                                  remark={remark}
                                  setRemark={
                                    setRemark
                                  }
                                  reviewAction={
                                    reviewAction
                                  }
                                  reviewLoading={
                                    reviewLoading
                                  }
                                  cancelReview={
                                    cancelReview
                                  }
                                  submitReview={
                                    submitReview
                                  }
                                />

                              )}

                            </div>

                          ) : (

                            <span className="text-xs font-semibold text-slate-400">
                              ✓ Reviewed
                            </span>

                          )}

                        </td>

                      </tr>

                    )
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              MOBILE CARD VIEW
              ================================================= */}

          <div className="space-y-4 md:hidden">

            {requests.map((request) => {

              const student =
                request.studentId

              const isReviewing =
                reviewingId === request._id

              return (

                <div
                  key={request._id}
                  className="rounded-2xl border border-amber-200 bg-white p-4 shadow-md"
                >

                  {/* -----------------------------------------
                      Student + Status
                      ----------------------------------------- */}

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-base font-extrabold text-slate-800">
                        👤 {student?.name || '—'}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Admission No:{' '}
                        {student?.admissionNo ||
                          '—'}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        {student?.yearOfStudy ||
                          '—'}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-extrabold ${getStatusStyle(
                        request.status
                      )}`}
                    >

                      {request.status ===
                      'Pending'
                        ? '⏳'
                        : request.status ===
                          'Approved'
                          ? '✅'
                          : '❌'}{' '}

                      {request.status}

                    </span>

                  </div>

                  {/* -----------------------------------------
                      Date + Session
                      ----------------------------------------- */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-blue-50 p-3">

                      <p className="text-[11px] font-bold text-blue-500">
                        DATE
                      </p>

                      <p className="mt-1 text-sm font-bold text-blue-800">
                        📅{' '}
                        {formatDate(
                          request.leaveDate
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl bg-indigo-50 p-3">

                      <p className="text-[11px] font-bold text-indigo-500">
                        SESSION
                      </p>

                      <p className="mt-1 text-sm font-bold text-indigo-800">
                        🕐 {request.session}
                      </p>

                    </div>

                  </div>

                  {/* -----------------------------------------
                      Reason
                      ----------------------------------------- */}

                  <div className="mt-3 rounded-xl bg-slate-50 p-3">

                    <p className="text-[11px] font-bold text-slate-400">
                      REASON
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {request.reason || '—'}
                    </p>

                  </div>

                  {/* -----------------------------------------
                      Pending Actions
                      ----------------------------------------- */}

                  {request.status ===
                  'Pending' ? (

                    <div className="mt-4">

                      <div className="grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            openReview(
                              request,
                              'Approved'
                            )
                          }
                          disabled={
                            reviewLoading
                          }
                          className="rounded-xl bg-green-600 px-3 py-3 text-sm font-extrabold text-white shadow hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ✅ Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openReview(
                              request,
                              'Rejected'
                            )
                          }
                          disabled={
                            reviewLoading
                          }
                          className="rounded-xl bg-red-600 px-3 py-3 text-sm font-extrabold text-white shadow hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          ❌ Reject
                        </button>

                      </div>

                      {isReviewing && (

                        <div className="mt-3">

                          <ReviewPanel
                            remark={remark}
                            setRemark={
                              setRemark
                            }
                            reviewAction={
                              reviewAction
                            }
                            reviewLoading={
                              reviewLoading
                            }
                            cancelReview={
                              cancelReview
                            }
                            submitReview={
                              submitReview
                            }
                          />

                        </div>

                      )}

                    </div>

                  ) : (

                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-center text-xs font-semibold text-slate-400">
                      ✓ Already reviewed
                    </div>

                  )}

                  {/* -----------------------------------------
                      Lecturer Remark
                      ----------------------------------------- */}

                  {request.lecturerRemark && (

                    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">

                      <p className="text-[11px] font-bold text-blue-500">
                        LECTURER REMARK
                      </p>

                      <p className="mt-1 text-sm font-semibold text-blue-800">
                        {request.lecturerRemark}
                      </p>

                    </div>

                  )}

                </div>

              )
            })}

          </div>

        </>

      )}

    </section>
  )
}