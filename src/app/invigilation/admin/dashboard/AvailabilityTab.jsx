// src/app/invigilation/admin/dashboard/AvailabilityTab.jsx
'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CheckCircle2, XCircle, HelpCircle,
  RefreshCw, Calendar, Users, ChevronDown,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function weekDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}

// ── Status Cell ───────────────────────────────────────────────────────────────
function StatusCell({ status, onClick, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    )
  }

  if (status === 'available') {
    return (
      <button onClick={onClick} title="Click to change"
        className="flex items-center justify-center gap-1 rounded-lg bg-emerald-100 px-2 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 w-full"
      >
        <CheckCircle2 size={12} /> Available
      </button>
    )
  }

  if (status === 'unavailable') {
    return (
      <button onClick={onClick} title="Click to change"
        className="flex items-center justify-center gap-1 rounded-lg bg-rose-100 px-2 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-200 w-full"
      >
        <XCircle size={12} /> Unavail.
      </button>
    )
  }

  // Not marked
  return (
    <button onClick={onClick} title="Click to mark"
      className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-amber-100 hover:text-amber-700 w-full"
    >
      <HelpCircle size={12} /> Not Set
    </button>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AvailabilityTab() {
  const [lecturers, setLecturers]       = useState([])  // ✅ internal fetch
  const [examSlots, setExamSlots]       = useState([])
  const [availMap, setAvailMap]         = useState({})
  const [loading, setLoading]           = useState(false)
  const [cellLoading, setCellLoading]   = useState('')
  const [filterSession, setFilterSession] = useState('')

  // ── Load all data internally ──────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [lecRes, examRes, availRes] = await Promise.all([
        fetch('/api/invigilation/lecturers', { cache: 'no-store' }),
        fetch('/api/invigilation/exams',     { cache: 'no-store' }),
        fetch('/api/invigilation/availability', { cache: 'no-store' }),
      ])
      const [lecData, examData, availData] = await Promise.all([
        lecRes.json(), examRes.json(), availRes.json(),
      ])
      if (!lecRes.ok)  throw new Error(lecData.message)
      if (!examRes.ok) throw new Error(examData.message)
      if (!availRes.ok) throw new Error(availData.message)

      // ✅ Set lecturers from API
      setLecturers(lecData.data || [])
      console.log('Lecturers API:', lecData.data)

      // Unique date+session slots (sorted)
      const seen = new Set()
      const slots = []
      ;(examData.data || []).forEach(e => {
        const dateStr = formatDate(e.date)
        const key = `${dateStr}_${e.session}`
        if (!seen.has(key)) { seen.add(key); slots.push({ date: dateStr, session: e.session }) }
      })
      slots.sort((a, b) => a.date.localeCompare(b.date) || a.session.localeCompare(b.session))
      setExamSlots(slots)
      if (slots.length === 0) {

  setExamSlots([
    {
      date: formatDate(new Date()),
      session: 'FN',
    },

    {
      date: formatDate(new Date()),
      session: 'AN',
    },
  ])
}

      // Build availability map: 'lecturerId_date_session' → { status, _id }
      const map = {}
      ;(availData.data || []).forEach(r => {
        const lid  = String(r.lecturerId?._id || r.lecturerId)
        const date = formatDate(r.date)
        const key  = `${lid}_${date}_${r.session}`
        map[key]   = { status: r.status, _id: r._id }
      })
      setAvailMap(map)
    } catch (err) {
      toast.error(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Admin click → cycle through: not-set → available → unavailable → not-set
  const onCellClick = useCallback(async (lecturer, date, session) => {
    const lid      = String(lecturer._id || lecturer.id)
    const cellKey  = `${lid}_${date}_${session}`
    const current  = availMap[cellKey]?.status

    const nextStatus = !current
      ? 'available'
      : current === 'available'
        ? 'unavailable'
        : null  // null = delete / reset

    setCellLoading(cellKey)
    try {
      if (nextStatus === null) {
        // Reset — delete record if exists
        const existingId = availMap[cellKey]?._id
        if (existingId) {
          const res = await fetch(`/api/invigilation/availability/${existingId}`, { method: 'DELETE' })
          if (!res.ok) { const d = await res.json(); throw new Error(d.message) }
        }
        setAvailMap(s => {
          const next = { ...s }
          delete next[cellKey]
          return next
        })
      } else {
        // Upsert
        const res = await fetch('/api/invigilation/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lecturerId: lid,
            date, session,
            status: nextStatus,
            reason: '',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setAvailMap(s => ({ ...s, [cellKey]: { status: nextStatus, _id: data.data?._id } }))
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setCellLoading('')
    }
  }, [availMap])

  // ── Derived stats ─────────────────────────────────────────────────────────────
    // Filter slots by session
  const visibleSlots = useMemo(() =>
    filterSession ? examSlots.filter(s => s.session === filterSession) : examSlots,
    [examSlots, filterSession]
  )
const { availCount, unavailCount, notSetCount } = useMemo(() => {
  let avail = 0
  let unavail = 0
  let notSet = 0

  lecturers.forEach(lecturer => {
    const lid = String(lecturer._id || lecturer.id)

    visibleSlots.forEach(slot => {
      const key = `${lid}_${slot.date}_${slot.session}`

      const status = availMap[key]?.status

      if (status === 'available') {
        avail += 1
      } else if (status === 'unavailable') {
        unavail += 1
      } else {
        notSet += 1
      }
    })
  })

  return {
    availCount: avail,
    unavailCount: unavail,
    notSetCount: notSet,
  }
}, [lecturers, visibleSlots, availMap])



  // Group slots by date for header
  const dateGroups = useMemo(() => {
    const map = {}
    visibleSlots.forEach(s => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s.session)
    })
    return Object.entries(map).map(([date, sessions]) => ({ date, sessions, count: sessions.length }))
  }, [visibleSlots])

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lecturers</p>
          <p className="mt-1 text-3xl font-black text-slate-700">{lecturers.length}</p>
        </div>
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">Exam Slots</p>
          <p className="mt-1 text-3xl font-black text-indigo-700">{examSlots.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Available</p>
          <p className="mt-1 text-3xl font-black text-emerald-700">{availCount}</p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Unavailable</p>
          <p className="mt-1 text-3xl font-black text-rose-700">{unavailCount}</p>
        </div>
      </div>

      {/* ── Legend + Filter ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-600">Legend:</span>
          <span className="flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">
            <CheckCircle2 size={11} /> Available
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-rose-100 px-2 py-1 font-semibold text-rose-700">
            <XCircle size={11} /> Unavailable
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-500">
            <HelpCircle size={11} /> Not Set
          </span>
          <span className="text-slate-400">· Click any cell to toggle status</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-1.5 pr-7 text-sm focus:border-indigo-400 focus:outline-none"
            >
              <option value="">All Sessions</option>
              <option value="FN">FN Only</option>
              <option value="AN">AN Only</option>
              <option value="EN">EN Only</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2 top-2.5 text-slate-400" />
          </div>
          <button onClick={loadAll} disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Matrix Table ── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
          <Calendar size={15} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">Lecturer × Date Availability Matrix</h3>
          {notSetCount > 0 && (
            <span className="ml-auto rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              {notSetCount} not set
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : lecturers.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No lecturers found</p>
          </div>
          
        
          
          
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                {/* Row 1 — Dates */}
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wide min-w-40 border-r border-slate-200">
                    Lecturer
                  </th>
                  {dateGroups.map(({ date, count }) => (
                    <th key={date}
                      colSpan={count}
                      className="px-2 py-2 text-center text-xs font-bold text-slate-700 border-r border-slate-200 last:border-r-0"
                    >
                      <div className="text-[11px] font-semibold text-slate-400">{weekDay(date)}</div>
                      <div>{shortDate(date)}</div>
                    </th>
                  ))}
                </tr>
                {/* Row 2 — Sessions */}
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 border-r border-slate-200" />
                  {visibleSlots.map(({ date, session }) => (
                    <th key={`${date}_${session}`}
                      className="px-2 py-1.5 text-center border-r border-slate-100 last:border-r-0"
                    >
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                        session === 'FN' ? 'bg-amber-100 text-amber-700' :
                        session === 'AN' ? 'bg-blue-100 text-blue-700' :
                        'bg-violet-100 text-violet-700'
                      }`}>
                        {session}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {lecturers.map((lecturer, li) => {
                  const lid = String(lecturer._id || lecturer.id)
                  return (
                    <tr key={`${lid}_${li}`} className={`hover:bg-slate-50/60 transition-colors ${li % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      {/* Lecturer name — sticky */}
                      <td className="sticky left-0 z-10 border-r border-slate-200 bg-inherit px-4 py-2.5 min-w-40">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                            {lecturer.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-700">{lecturer.name}</p>
                            <p className="truncate text-[10px] text-slate-400">{lecturer.designation || 'Lecturer'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Availability cells */}
                      {visibleSlots.map(({ date, session }) => {
                        console.log(visibleSlots)
                        const cellKey = `${lid}_${date}_${session}`
                        const status  = availMap[cellKey]?.status || null
                        return (
                          <td key={cellKey} className="px-1.5 py-1.5 border-r border-slate-100 last:border-r-0 min-w-[90px]">
                            <StatusCell
                              status={status}
                              loading={cellLoading === cellKey}
                              onClick={() => onCellClick(lecturer, date, session)}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer summary */}
        {!loading && lecturers.length > 0 && examSlots.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs text-slate-500">
            <span>{lecturers.length} lecturers × {visibleSlots.length} slots = {lecturers.length * visibleSlots.length} cells</span>
            <span className="text-emerald-600 font-semibold">✓ {availCount} available</span>
            <span className="text-rose-600 font-semibold">✗ {unavailCount} unavailable</span>
            <span className="text-amber-600 font-semibold">? {notSetCount} not set</span>
          </div>
        )}
      </div>
    </div>
  )
}