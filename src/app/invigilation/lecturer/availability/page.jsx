// src/app/invigilation/lecturer/availability/page.jsx
'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Calendar, CheckCircle2, XCircle, Save,
  RefreshCw, Clock, AlertCircle, Info,
} from 'lucide-react'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function displayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', {
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ── UI Components ─────────────────────────────────────────────────────────────
function StatusBtn({ active, variant, onClick, children }) {
  const styles = {
    available: active
      ? 'bg-emerald-500 text-white shadow-sm border-emerald-500'
      : 'border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50',
    unavailable: active
      ? 'bg-rose-500 text-white shadow-sm border-rose-500'
      : 'border border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition active:scale-95 ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LecturerAvailabilityPage() {
  const [examDates, setExamDates]   = useState([])   // [{ date, sessions: ['FN','AN'] }]
  const [availMap, setAvailMap]     = useState({})   // { 'date_session': { status, reason, id } }
  const [dirty, setDirty]           = useState({})   // { 'date_session': true }
  const [loading, setLoading]       = useState(false)
  const [saving, setSaving]         = useState(false)

  // ── Load data ───────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [examRes, availRes] = await Promise.all([
        fetch('/api/invigilation/exams', { cache: 'no-store' }),
        fetch('/api/invigilation/availability', { cache: 'no-store' }),
      ])
      const [examData, availData] = await Promise.all([examRes.json(), availRes.json()])
      if (!examRes.ok) throw new Error(examData.message)

      // Unique date + sessions
      const seen = new Set()
      const dateMap = {}
      ;(examData.data || []).forEach(exam => {
        const dateStr = formatDate(exam.date)
        const key     = `${dateStr}_${exam.session}`
        if (!seen.has(key)) {
          seen.add(key)
          if (!dateMap[dateStr]) dateMap[dateStr] = []
          dateMap[dateStr].push(exam.session)
        }
      })

      setExamDates(
        Object.entries(dateMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, sessions]) => ({
            date,
            sessions: ['FN', 'AN', 'EN'].filter(s => sessions.includes(s)), // sorted order
          }))
      )

      // Build availability map from own records
      const map = {}
      ;(availData.data || []).forEach(a => {
        const key = `${formatDate(a.date)}_${a.session}`
        map[key]  = { status: a.status, reason: a.reason || '', id: a._id }
      })
      setAvailMap(map)
      setDirty({})
    } catch (err) {
      toast.error(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Slot update ─────────────────────────────────────────────────────────────
  const setSlot = (key, field, value) => {
    setAvailMap(s => ({ ...s, [key]: { ...(s[key] || {}), [field]: value } }))
    setDirty(s => ({ ...s, [key]: true }))
  }

  // ── Save all dirty slots ────────────────────────────────────────────────────
  const saveAll = async () => {
    const dirtyKeys = Object.keys(dirty).filter(k => dirty[k])
    const invalid   = dirtyKeys.filter(k => !availMap[k]?.status)
    if (invalid.length > 0) {
      toast.error('Please mark Available or Unavailable for all changed slots')
      return
    }
    if (dirtyKeys.length === 0) { toast('No changes to save'); return }

    setSaving(true)
    try {
      await Promise.all(
        dirtyKeys.map(key => {
          const [date, session] = key.split('_')
          const entry = availMap[key]
          return fetch('/api/invigilation/availability', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date, session,
              status: entry.status,
              reason: entry.reason || '',
            }),
          })
        })
      )
      toast.success(`${dirtyKeys.length} slot${dirtyKeys.length > 1 ? 's' : ''} saved!`)
      setDirty({})
      loadData()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const dirtyCount    = Object.values(dirty).filter(Boolean).length
  const totalSlots    = examDates.reduce((s, d) => s + d.sessions.length, 0)
  const markedSlots   = Object.keys(availMap).length
  const unavailCount  = Object.values(availMap).filter(v => v.status === 'unavailable').length

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <InvigilationGuard allowRoles={['lecturer']}>
      {user => (
        <InvigilationShell user={user} title="My Availability">
          <div className="min-h-screen bg-slate-50">

            {/* ── Header ── */}
            <div className="bg-white border-b border-slate-200 px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-lg font-black text-slate-800">Mark Your Availability</h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Mark each session before the schedule is finalized. Unavailable slots will be skipped during duty assignment.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </button>
                  {dirtyCount > 0 && (
                    <button
                      onClick={saveAll}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-60"
                    >
                      {saving
                        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        : <Save size={14} />}
                      Save ({dirtyCount} unsaved)
                    </button>
                  )}
                </div>
              </div>

              {/* Summary chips */}
              {totalSlots > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    Total Slots · <span className="text-slate-800">{totalSlots}</span>
                  </div>
                  <div className="rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700">
                    Marked · <span>{markedSlots}</span>
                  </div>
                  {unavailCount > 0 && (
                    <div className="rounded-xl bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-700">
                      Unavailable · <span>{unavailCount}</span>
                    </div>
                  )}
                  {dirtyCount > 0 && (
                    <div className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700">
                      Unsaved · {dirtyCount}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 space-y-4 max-w-3xl">

              {/* Info banner */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                  Please submit your availability <strong>before the exam duty is auto-assigned</strong>.
                  If you mark <strong>Unavailable</strong>, you will be skipped for that date and session.
                  You can update your response anytime before finalization.
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                </div>
              ) : examDates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-20 text-center">
                  <Calendar size={36} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-semibold">No upcoming exam schedules</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Admin has not generated the schedule yet. Check back soon.
                  </p>
                </div>
              ) : (
                <>
                  {examDates.map(({ date, sessions }) => (
                    <div key={date} className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">

                      {/* Date header */}
                      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50/80 border-b border-slate-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                          <Calendar size={15} />
                        </div>
                        <span className="font-bold text-slate-700">{displayDate(date)}</span>

                        {/* Date-level status summary */}
                        <div className="ml-auto flex gap-2">
                          {sessions.map(s => {
                            const key    = `${date}_${s}`
                            const status = availMap[key]?.status
                            return (
                              <span
                                key={s}
                                className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                                  status === 'available'   ? 'bg-emerald-100 text-emerald-700' :
                                  status === 'unavailable' ? 'bg-rose-100 text-rose-700' :
                                  'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {s} {status === 'available' ? '✓' : status === 'unavailable' ? '✗' : '?'}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Sessions grid */}
                      <div className={`grid ${sessions.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'} divide-x divide-slate-100`}>
                        {sessions.map(session => {
                          const key       = `${date}_${session}`
                          const entry     = availMap[key] || {}
                          const isAvail   = entry.status === 'available'
                          const isUnavail = entry.status === 'unavailable'
                          const changed   = dirty[key]

                          return (
                            <div
                              key={session}
                              className={`p-5 transition-colors ${changed ? 'bg-indigo-50/40' : 'bg-white'}`}
                            >
                              {/* Session label */}
                              <div className="flex items-center gap-2 mb-4">
                                <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold ${
                                  session === 'FN' ? 'bg-amber-100 text-amber-700' :
                                  session === 'AN' ? 'bg-blue-100 text-blue-700' :
                                  'bg-violet-100 text-violet-700'
                                }`}>
                                  <Clock size={13} />
                                  {session === 'FN' ? 'FN · Forenoon' : session === 'AN' ? 'AN · Afternoon' : 'EN · Evening'}
                                </span>
                                {changed && (
                                  <span className="text-xs text-indigo-500 font-semibold animate-pulse">
                                    • Unsaved
                                  </span>
                                )}
                              </div>

                              {/* Available / Unavailable buttons */}
                              <div className="flex gap-3 mb-4">
                                <StatusBtn
                                  variant="available"
                                  active={isAvail}
                                  onClick={() => setSlot(key, 'status', 'available')}
                                >
                                  <CheckCircle2 size={16} />
                                  Available
                                </StatusBtn>
                                <StatusBtn
                                  variant="unavailable"
                                  active={isUnavail}
                                  onClick={() => setSlot(key, 'status', 'unavailable')}
                                >
                                  <XCircle size={16} />
                                  Unavailable
                                </StatusBtn>
                              </div>

                              {/* Reason textarea — only when unavailable */}
                              {isUnavail && (
                                <textarea
                                  rows={2}
                                  placeholder="Reason for unavailability (optional)…"
                                  value={entry.reason || ''}
                                  onChange={e => setSlot(key, 'reason', e.target.value)}
                                  className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 focus:outline-none resize-none"
                                />
                              )}

                              {/* Not marked yet */}
                              {!entry.status && (
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                  <AlertCircle size={12} /> Not marked yet
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Sticky save button */}
                  {dirtyCount > 0 && (
                    <div className="sticky bottom-6 flex justify-center pt-2">
                      <button
                        onClick={saveAll}
                        disabled={saving}
                        className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-xl hover:bg-indigo-700 transition disabled:opacity-60"
                      >
                        {saving
                          ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          : <Save size={16} />}
                        Save {dirtyCount} Change{dirtyCount > 1 ? 's' : ''}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}