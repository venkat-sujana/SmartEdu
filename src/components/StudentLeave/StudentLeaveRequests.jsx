'use client'

import { useEffect, useState } from 'react'

function formatLeaveDate(dateValue) {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getStatusStyle(status) {
  switch (status) {
    case 'Approved':
      return {
        badge: 'bg-green-100 text-green-700 border-green-300',
        icon: '✅',
      }

    case 'Rejected':
      return {
        badge: 'bg-red-100 text-red-700 border-red-300',
        icon: '❌',
      }

    default:
      return {
        badge: 'bg-amber-100 text-amber-700 border-amber-300',
        icon: '⏳',
      }
  }
}

export default function StudentLeaveRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadLeaveRequests() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch('/api/leave/my', {
          cache: 'no-store',
        })

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
          'Student leave requests error:',
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

    loadLeaveRequests()
  }, [])

  if (loading) {
    return (
      <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow">
        <div className="flex items-center justify-center gap-3 py-5">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />

          <span className="text-sm font-semibold text-slate-500">
            Loading leave requests...
          </span>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-300 bg-red-50 p-4 text-center">
        <p className="font-semibold text-red-700">
          ⚠️ {error}
        </p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-indigo-200 bg-white p-4 shadow-lg md:p-5">

      {/* Header */}

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-indigo-800">
            📋 My Leave Requests
          </h2>

          <p className="mt-1 text-xs font-medium text-slate-500">
            Track your submitted leave applications
          </p>
        </div>

        <div className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-bold text-indigo-700">
          {requests.length}
        </div>
      </div>

      {/* No requests */}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
          <p className="text-sm font-semibold text-slate-500">
            📭 No leave requests found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">

          {requests.map((request) => {
            const statusStyle =
              getStatusStyle(request.status)

            return (
              <div
                key={request._id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:shadow-md"
              >

                {/* Top row */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="text-base font-extrabold text-slate-800">
                      📅 {formatLeaveDate(
                        request.leaveDate
                      )}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      🕐 {request.session}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit items-center gap-1 rounded-full border px-3 py-1 text-xs font-extrabold ${statusStyle.badge}`}
                  >
                    {statusStyle.icon}{' '}
                    {request.status}
                  </span>

                </div>

                {/* Reason */}

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-bold text-slate-400">
                    REASON
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {request.reason || '—'}
                  </p>
                </div>

                {/* Lecturer remark */}

                {request.lecturerRemark && (
                  <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs font-bold text-blue-500">
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
      )}
    </section>
  )
}