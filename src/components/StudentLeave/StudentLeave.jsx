'use client'

import { useState } from 'react'

export default function StudentLeave() {
  const [leaveDate, setLeaveDate] = useState('')
  const [leaveSession, setLeaveSession] = useState('Full Day')
  const [reason, setReason] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const getTomorrowDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (!leaveDate) {
      setError('Please select leave date')
      return
    }

    if (!reason.trim()) {
      setError('Please enter leave reason')
      return
    }

    // --------------------------------------------------
    // Frontend safety check
    // --------------------------------------------------

    if (leaveDate < getTomorrowDate()) {
      setError(
        'Leave must be applied at least one day in advance'
      )
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/leave/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveDate,
          session: leaveSession,
          reason: reason.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data?.message ||
            'Failed to submit leave request'
        )
        return
      }

      setMessage(
        'Leave request submitted successfully'
      )

      setLeaveDate('')
      setLeaveSession('Full Day')
      setReason('')
    } catch (error) {
      console.error(
        'Student leave submit error:',
        error
      )

      setError(
        'Server error while submitting leave'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl rounded-2xl border border-blue-200 bg-white p-5 shadow-lg">

      {/* Header */}

      <div className="mb-5 text-center">
        <h2 className="text-xl font-extrabold text-blue-800">
          📝 Apply for Leave
        </h2>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Leave must be applied at least one day in advance.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        {/* Leave Date */}

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            📅 Leave Date
          </label>

          <input
            type="date"
            value={leaveDate}
            min={getTomorrowDate()}
            onChange={(e) =>
              setLeaveDate(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Session */}

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            🕐 Session
          </label>

          <select
            value={leaveSession}
            onChange={(e) =>
              setLeaveSession(e.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="Full Day">
              Full Day
            </option>

            <option value="FN">
              FN
            </option>

            <option value="AN">
              AN
            </option>
          </select>
        </div>

        {/* Reason */}

        <div>
          <label className="mb-1 block text-sm font-bold text-slate-700">
            📝 Reason
          </label>

          <textarea
            value={reason}
            onChange={(e) =>
              setReason(e.target.value)
            }
            maxLength={500}
            rows={4}
            placeholder="Enter your leave reason..."
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-right text-xs text-slate-400">
            {reason.length}/500
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Success */}

        {message && (
          <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm font-semibold text-green-700">
            ✅ {message}
          </div>
        )}

        {/* Submit */}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Submitting...'
            : '📤 Apply Leave'}
        </button>

      </form>
    </section>
  )
}