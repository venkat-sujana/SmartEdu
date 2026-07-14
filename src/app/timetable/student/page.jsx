//src/app/timetable/student/page.jsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  BookOpen, Clock, Calendar, Loader2,
  CheckCircle2, ChevronDown, GraduationCap,
  Sunrise, Sunset, Coffee, UtensilsCrossed
} from 'lucide-react'
import {
  TIMETABLE_ACADEMIC_YEAR as ACADEMIC_YEAR,
  TIMETABLE_CLASS_LABELS as CLASSES,
  TIMETABLE_COLUMNS as COLUMNS,
  TIMETABLE_DAYS as DAYS,
  TIMETABLE_SUBJECT_COLORS_WITH_BORDER as SUBJECT_COLORS,
  TIMETABLE_TODAY as TODAY,
} from '@/lib/timetable-config'

// ── Mobile Period Card ────────────────────────────────────────────────
function PeriodCard({ col, cell, isToday }) {
  if (col.type === 'break') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2">
        <Coffee size={13} className="text-slate-500 shrink-0" />
        <span className="text-xs font-bold text-slate-500">BREAK — {col.label}</span>
      </div>
    )
  }
  if (col.type === 'lunch') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-200 px-3 py-2">
        <UtensilsCrossed size={13} className="text-slate-500 shrink-0" />
        <span className="text-xs font-bold text-slate-500">LUNCH — {col.label}</span>
      </div>
    )
  }

  const colorCls = SUBJECT_COLORS[cell?.subject] || 'bg-white text-slate-400 border-slate-100'

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${colorCls}`}>
      <div className="flex flex-col items-center shrink-0 w-14">
        <Clock size={11} className="opacity-50 mb-0.5" />
        <span className="text-[9px] font-bold leading-tight text-center opacity-60">
          {col.label}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {cell?.subject ? (
          <>
            <p className="text-xs font-black truncate">{cell.subject}</p>
            {cell.lecturerName && (
              <p className="text-[10px] opacity-60 truncate">{cell.lecturerName}</p>
            )}
          </>
        ) : (
          <p className="text-xs opacity-30">Free Period</p>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function StudentTimetablePage() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0])
  const [slots,         setSlots]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [activeDay,     setActiveDay]     = useState(TODAY !== 'Sunday' ? TODAY : 'Monday')
  const [viewMode,      setViewMode]      = useState('week') // 'week' | 'day'

  // ── Fetch slots ──────────────────────────────────────────────────
  const fetchSlots = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(
        `/api/timetable-builder/slots?classLabel=${encodeURIComponent(selectedClass)}&academicYear=${ACADEMIC_YEAR}`
      )
      const data = await res.json()
      setSlots(data.data?.slots || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [selectedClass])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  // ── Build grid ───────────────────────────────────────────────────
  const getCell = (day, pIndex) => {
    const slot = slots.find(s => s.day === day && s.periodIndex === pIndex)
    return slot || null
  }

  // Stats
  const periodSlots = slots.filter(s => s.periodType === 'period')
  const filled      = periodSlots.filter(s => s.subject).length
  const subjects    = [...new Set(periodSlots.filter(s => s.subject).map(s => s.subject))]

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 shadow">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800">My Timetable</h1>
                <p className="text-xs text-slate-400">{ACADEMIC_YEAR}</p>
              </div>
            </div>

            {/* Class selector */}
            <div className="relative">
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-bold text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                {CLASSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Periods/Week', value: filled, icon: <Clock size={14}/>, color: 'blue' },
            { label: 'Subjects',     value: subjects.length, icon: <BookOpen size={14}/>, color: 'emerald' },
            { label: 'Today',        value: TODAY !== 'Sunday' ? TODAY.slice(0,3) : 'Sun', icon: <Calendar size={14}/>, color: 'violet' },
          ].map(({ label, value, icon, color }) => {
            const bg  = { blue:'bg-blue-50 text-blue-600', emerald:'bg-emerald-50 text-emerald-600', violet:'bg-violet-50 text-violet-600' }
            const val = { blue:'text-blue-700', emerald:'text-emerald-700', violet:'text-violet-700' }
            return (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl ${bg[color]}`}>{icon}</div>
                <p className={`text-xl font-black ${val[color]}`}>{value}</p>
                <p className="text-[10px] font-semibold text-slate-400">{label}</p>
              </div>
            )
          })}
        </div>

        {/* ── View Toggle ── */}
        <div className="flex items-center gap-2">
          {['week', 'day'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded-xl px-4 py-1.5 text-xs font-bold transition ${
                viewMode === mode
                  ? 'bg-slate-800 text-white shadow'
                  : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {mode === 'week' ? '📅 Week View' : '📆 Day View'}
            </button>
          ))}

          {/* Day tabs (day view) */}
          {viewMode === 'day' && (
            <div className="ml-2 flex gap-1 overflow-x-auto">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    activeDay === day
                      ? 'bg-blue-600 text-white shadow'
                      : day === TODAY
                        ? 'border-2 border-blue-300 bg-blue-50 text-blue-700'
                        : 'border border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {day.slice(0, 3)}
                  {day === TODAY && <span className="ml-1 text-[8px]">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-400" />
              <p className="text-sm font-medium text-slate-400">Loading timetable...</p>
            </div>
          </div>
        ) : (

          <>
            {/* ── WEEK VIEW — Desktop Table ── */}
            {viewMode === 'week' && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-800 text-white">
                        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide w-24 border-r border-slate-600">
                          Day
                        </th>
                        {COLUMNS.map((c, i) => (
                          <th key={i} className={`px-2 py-3 text-center text-xs font-bold border-r border-slate-600 ${
                            c.type === 'break' ? 'bg-slate-600 w-10'
                            : c.type === 'lunch' ? 'bg-slate-500 w-12'
                            : ''
                          }`}>
                            <div className="flex flex-col items-center gap-0.5">
                              {c.type === 'period' && <Clock size={9} className="text-slate-400"/>}
                              <span className="whitespace-nowrap text-[10px]">{c.label}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day, dIndex) => {
                        const isToday = day === TODAY
                        return (
                          <tr
                            key={day}
                            className={`${isToday ? 'bg-blue-50' : dIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                          >
                            {/* Day */}
                            <td className={`border-r border-b border-slate-100 px-3 py-2 ${isToday ? 'border-r-blue-200' : ''}`}>
                              <div className="flex flex-col">
                                <span className={`text-xs font-black ${isToday ? 'text-blue-700' : 'text-slate-700'}`}>
                                  {day}
                                </span>
                                {isToday && (
                                  <span className="text-[9px] font-bold text-blue-500">Today ●</span>
                                )}
                              </div>
                            </td>

                            {COLUMNS.map((col, pIndex) => {
                              const cell = getCell(day, pIndex)

                              if (col.type === 'break') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-200 text-center text-[10px] font-bold text-slate-500 px-1 py-2">
                                  <Coffee size={12} className="mx-auto mb-0.5"/>☕
                                </td>
                              )
                              if (col.type === 'lunch') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-300 text-center text-[10px] font-bold text-slate-600 px-1 py-2">
                                  <UtensilsCrossed size={12} className="mx-auto mb-0.5"/>🍱
                                </td>
                              )

                              const colorCls = SUBJECT_COLORS[cell?.subject] || ''

                              return (
                                <td key={pIndex} className="border-r border-b border-slate-100 p-0">
                                  <div className={`min-h-14 flex flex-col items-center justify-center px-1 py-1.5 ${colorCls} ${isToday && !colorCls ? 'bg-blue-50/50' : ''}`}>
                                    {cell?.subject ? (
                                      <>
                                        <span className="text-[10px] font-black text-center leading-tight">
                                          {cell.subject}
                                        </span>
                                        {cell.lecturerName && (
                                          <span className="text-[8px] opacity-50 mt-0.5 text-center leading-tight">
                                            {cell.lecturerName}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-[9px] text-slate-200">—</span>
                                    )}
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── DAY VIEW — Mobile Cards ── */}
            {viewMode === 'day' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  {activeDay === TODAY
                    ? <div className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white"><CheckCircle2 size={12}/> Today — {activeDay}</div>
                    : <div className="flex items-center gap-1.5 rounded-xl bg-slate-700 px-3 py-1.5 text-xs font-bold text-white"><Calendar size={12}/> {activeDay}</div>
                  }
                </div>

                {COLUMNS.map((col, pIndex) => (
                  <PeriodCard
                    key={pIndex}
                    col={col}
                    cell={getCell(activeDay, pIndex)}
                    isToday={activeDay === TODAY}
                  />
                ))}
              </div>
            )}

            {/* ── Subject Legend ── */}
            {subjects.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Subjects this week
                </h3>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(sub => (
                    <span
                      key={sub}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                        SUBJECT_COLORS[sub] || 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <BookOpen size={9} /> {sub}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
