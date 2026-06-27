//src/app/timetable/dashboard/page.jsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LayoutGrid, AlertTriangle, CheckCircle2, Loader2,
  BookOpen, TrendingUp, RefreshCw,
  FlaskConical, ShieldAlert, BarChart3,
  CalendarDays, Layers, GraduationCap, ArrowRight
} from 'lucide-react'
import {
  TIMETABLE_ACADEMIC_YEAR as ACADEMIC_YEAR,
  TIMETABLE_CLASSES as CLASSES,
  TIMETABLE_TOTAL_PERIODS_PER_CLASS as TOTAL_PERIODS_PER_CLASS,
} from '@/lib/timetable-config'

const SUBJECT_WORKLOAD = {
  Mathematics: 12,
  Maths: 12,

  Physics: 11,
  Chemistry: 11,

  Botany: 6,
  Zoology: 6,

  History: 11,
  Commerce: 11,
  Economics: 11,
  Civics: 11,

  English: 14,
}

const getExpectedLoad = (subject) => {
  return SUBJECT_WORKLOAD[subject] ?? 18
}

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700',   bar: 'bg-blue-500',   icon: 'bg-blue-100 text-blue-600'   },
  indigo: { bg: 'bg-indigo-50',  border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700',bar: 'bg-indigo-500', icon: 'bg-indigo-100 text-indigo-600'},
  violet: { bg: 'bg-violet-50',  border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700',bar: 'bg-violet-500', icon: 'bg-violet-100 text-violet-600'},
  purple: { bg: 'bg-purple-50',  border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700',bar: 'bg-purple-500', icon: 'bg-purple-100 text-purple-600'},
  emerald:{ bg: 'bg-emerald-50', border: 'border-emerald-200',text: 'text-emerald-700',badge: 'bg-emerald-100 text-emerald-700',bar:'bg-emerald-500',icon: 'bg-emerald-100 text-emerald-600'},
  teal:   { bg: 'bg-teal-50',    border: 'border-teal-200',   text: 'text-teal-700',   badge: 'bg-teal-100 text-teal-700',   bar: 'bg-teal-500',   icon: 'bg-teal-100 text-teal-600'   },
}

// ── Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  const bg  = { blue:'bg-blue-100 text-blue-600', emerald:'bg-emerald-100 text-emerald-600', rose:'bg-rose-100 text-rose-600', amber:'bg-amber-100 text-amber-600', violet:'bg-violet-100 text-violet-600' }
  const val = { blue:'text-blue-700', emerald:'text-emerald-700', rose:'text-rose-700', amber:'text-amber-700', violet:'text-violet-700' }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg[color]}`}>{icon}</div>
      </div>
      <p className={`text-3xl font-black ${val[color]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

// ── Class Card ───────────────────────────────────────────────────────
function ClassCard({ cls, data, conflictCount, loading }) {
  const c          = COLOR_MAP[cls.color]
  const filled     = data?.filled     || 0
  const total      = data?.total      || TOTAL_PERIODS_PER_CLASS
  const subjects   = data?.subjects   || []
  const pct        = Math.round((filled / total) * 100)
  const hasConflict = conflictCount > 0

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
      hasConflict ? 'border-red-300' : c.border
    }`}>
      {/* Card Header */}
      <div className={`rounded-t-2xl border-b px-4 py-3 ${
        hasConflict ? 'bg-red-50 border-red-200' : `${c.bg} ${c.border}`
      }`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${c.icon}`}>
              <BookOpen size={14} />
            </div>
            <div>
              <p className={`text-xs font-black leading-tight ${hasConflict ? 'text-red-800' : c.text}`}>
                {cls.title}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {cls.stream} · {ACADEMIC_YEAR}
              </p>
            </div>
          </div>

          {/* Conflict / OK badge */}
          {hasConflict ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black text-red-700">
              <AlertTriangle size={9} /> {conflictCount}
            </span>
          ) : filled > 0 ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 size={9} /> OK
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={18} className="animate-spin text-slate-300" />
          </div>
        ) : (
          <>
            {/* Fill Progress */}
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-semibold text-slate-600">Fill Progress</span>
                <span className={`font-black ${pct === 100 ? 'text-emerald-600' : pct > 50 ? 'text-blue-600' : 'text-slate-400'}`}>
                  {pct}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    hasConflict ? 'bg-red-400' : c.bar
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>{filled} filled</span>
                <span>{total - filled} empty</span>
              </div>
            </div>

            {/* Subjects preview */}
            {subjects.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {subjects.slice(0, 6).map(s => (
                  <span key={s} className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${c.badge}`}>
                    {s}
                  </span>
                ))}
                {subjects.length > 6 && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                    +{subjects.length - 6}
                  </span>
                )}
              </div>
            )}

            {/* Empty state */}
            {filled === 0 && (
              <p className="text-center text-xs text-slate-300 py-2">
                No periods assigned yet
              </p>
            )}
          </>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
        <span className="text-[10px] font-semibold text-slate-400">
          {filled}/{total} periods
        </span>
        <Link
          href="/timetable"
          className={`flex items-center gap-1 text-[10px] font-bold ${c.text} hover:underline`}
        >
          Edit <ArrowRight size={9} />
        </Link>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function TimetableDashboardPage() {
  const [classData,   setClassData]   = useState({})   // { classLabel: { filled, total, subjects } }
  const [conflicts,   setConflicts]   = useState([])
  const [workload,    setWorkload]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ── Fetch all data ───────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Conflicts + Workload (single API call)
      const conflictRes  = await fetch(
        `/api/timetable-builder/conflicts?academicYear=${ACADEMIC_YEAR}`
      )
      const conflictData = await conflictRes.json()
      setConflicts(conflictData.data?.conflicts  || [])
      setWorkload(conflictData.data?.workload    || [])

      // 2. Each class slots — parallel fetch
      const slotResults = await Promise.allSettled(
        CLASSES.map(cls =>
          fetch(`/api/timetable-builder/slots?classLabel=${encodeURIComponent(cls.title)}&academicYear=${ACADEMIC_YEAR}`)
            .then(r => r.json())
            .then(d => ({ classLabel: cls.title, slots: d.data?.slots || [] }))
        )
      )

      // 3. Process slot data
      const newClassData = {}
      slotResults.forEach(result => {
        if (result.status !== 'fulfilled') return
        const { classLabel, slots } = result.value
        const periodSlots = slots.filter(s => s.periodType === 'period')
        const filled      = periodSlots.filter(s => s.subject).length
        const subjects    = [...new Set(periodSlots.filter(s => s.subject).map(s => s.subject))]

        newClassData[classLabel] = {
          filled,
          total:    TOTAL_PERIODS_PER_CLASS,
          subjects,
          slots,
        }
      })

      setClassData(newClassData)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Computed stats ───────────────────────────────────────────────
  const totalFilled    = Object.values(classData).reduce((s, d) => s + (d.filled || 0), 0)
  const totalPeriods   = CLASSES.length * TOTAL_PERIODS_PER_CLASS
  const totalConflicts = conflicts.length
  const overallPct     = Math.round((totalFilled / totalPeriods) * 100)
  const classesComplete= Object.values(classData).filter(d => d.filled === TOTAL_PERIODS_PER_CLASS).length

  // Conflict map per class
  const conflictMap = {}
  conflicts.forEach(c => {
    c.classes?.forEach(cls => {
      conflictMap[cls.classLabel] = (conflictMap[cls.classLabel] || 0) + 1
    })
  })

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 shadow-md">
                <BarChart3 size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-800">
                  Timetable Dashboard
                </h1>
                <p className="text-xs font-medium text-slate-400">
                  Academic Year {ACADEMIC_YEAR} · All Classes Overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="text-xs text-slate-400">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchAll}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <Link
                href="/timetable"
                className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700"
              >
                <LayoutGrid size={14} /> Edit Timetables
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Classes"
            value={CLASSES.length}
            icon={<Layers size={18}/>}
            color="blue"
            sub={`${CLASSES.filter(c=>c.stream==='general').length} General · ${CLASSES.filter(c=>c.stream==='vocational').length} Vocational`}
          />
          <StatCard
            label="Overall Fill"
            value={`${overallPct}%`}
            icon={<TrendingUp size={18}/>}
            color="emerald"
            sub={`${totalFilled} / ${totalPeriods} periods`}
          />
          <StatCard
            label="Conflicts"
            value={totalConflicts}
            icon={<ShieldAlert size={18}/>}
            color={totalConflicts > 0 ? 'rose' : 'emerald'}
            sub={totalConflicts > 0 ? 'Fix needed!' : 'All clear ✅'}
          />
          <StatCard
            label="Complete Classes"
            value={classesComplete}
            icon={<CalendarDays size={18}/>}
            color="violet"
            sub={`${CLASSES.length - classesComplete} remaining`}
          />
        </div>

        {/* ── Overall Progress Bar ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Overall Timetable Completion</h3>
            <span className="text-sm font-black text-blue-700">{overallPct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{totalFilled} filled</span>
            <span>{totalPeriods - totalFilled} remaining</span>
          </div>
        </div>

        {/* ── Conflict Alert ── */}
        {totalConflicts > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <h3 className="text-sm font-bold text-red-700">
                {totalConflicts} Conflict{totalConflicts > 1 ? 's' : ''} Detected!
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {conflicts.map((c, i) => (
                <div key={i} className="rounded-xl border border-red-200 bg-white px-3 py-2 shadow-sm">
                  <p className="text-xs font-bold text-red-700">{c.lecturerName}</p>
                  <p className="text-[10px] text-red-500">{c.day} · Period {Number(c.periodIndex)+1}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.classes?.map((cls, j) => (
                      <span key={j} className="rounded-full bg-red-50 border border-red-200 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">
                        {cls.classLabel.split(' - ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Class Cards Grid ── */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Class-wise Summary
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CLASSES.map(cls => (
              <ClassCard
                key={cls.title}
                cls={cls}
                data={classData[cls.title]}
                conflictCount={conflictMap[cls.title] || 0}
                loading={loading}
              />
            ))}
          </div>
        </div>

        {/* ── Lecturer Workload Table ── */}
        {workload.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-800 px-5 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
                <GraduationCap size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Lecturer Workload</h3>
                <p className="text-xs text-slate-400">All classes combined · {ACADEMIC_YEAR}</p>
              </div>
              <div className="ml-auto flex gap-2 text-xs font-semibold">
                <span className="rounded-full bg-emerald-900/40 px-2.5 py-1 text-emerald-400">
                  ✅ Normal: {workload.filter(w=>w.status==='Normal').length}
                </span>
                <span className="rounded-full bg-rose-900/40 px-2.5 py-1 text-rose-400">
                  ⚠ Issues: {workload.filter(w=>w.status!=='Normal').length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['#','Lecturer','Theory','Practical','Total / Week','Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
  {workload.map((w, i) => {

    const expected = w.expected

    const status =
      w.total < expected
        ? 'Underload'
        : w.total > expected
        ? 'Overload'
        : 'Normal'

    return (
      <tr
        key={w.name}
        className={`transition-colors hover:bg-slate-50 ${
          i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
        }`}
      >
        <td className="px-5 py-3 text-xs font-bold text-slate-400">
          {i + 1}
        </td>

        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-white">
              {w.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="font-bold text-slate-700">{w.name}</span>
          </div>
        </td>

        <td className="px-5 py-3">
          <div className="flex items-center gap-1.5">
            <BookOpen size={12} className="text-blue-400" />
            <span className="font-bold text-slate-700">{w.theory}</span>
          </div>
        </td>

        <td className="px-5 py-3">
          <div className="flex items-center gap-1.5">
            <FlaskConical size={12} className="text-amber-500" />
            <span className="font-bold text-slate-700">{w.practical}</span>
          </div>
        </td>

        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full ${
                  status === 'Normal'
                    ? 'bg-emerald-500'
                    : status === 'Underload'
                    ? 'bg-rose-400'
                    : 'bg-red-600'
                }`}
                style={{
                  width: `${Math.min((w.total / expected) * 100, 100)}%`,
                }}
              />
            </div>

            <span className="text-base font-black text-slate-800">
              {w.total}
            </span>

            <span className="text-xs text-slate-400">
              / {expected}
            </span>
          </div>
        </td>

        <td className="px-5 py-3">
          {status === 'Normal' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={11} /> Normal
            </span>
          )}

          {status === 'Underload' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
              <AlertTriangle size={11} /> Underload
            </span>
          )}

          {status === 'Overload' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
              <AlertTriangle size={11} /> Overload
            </span>
          )}
        </td>
      </tr>
    )
  })}
</tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold">
              <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11}/> 16–18 : Normal</span>
              <span className="text-rose-600 flex items-center gap-1"><AlertTriangle size={11}/> &lt;16 : Underload</span>
              <span className="text-red-700 flex items-center gap-1"><AlertTriangle size={11}/> &gt;18 : Overload</span>
            </div>
          </div>
        )}

        {/* ── Quick Links ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold text-slate-700">Quick Navigation</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/timetable"
              className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">
              <LayoutGrid size={14}/> Edit All Timetables
            </Link>
            <Link href="/timetable/dashboard"
              className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">
              <BarChart3 size={14}/> Dashboard (Current)
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
