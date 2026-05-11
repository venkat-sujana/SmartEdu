'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  GraduationCap, Clock, BookOpen, Loader2,
  CheckCircle2, AlertCircle, ChevronDown,
  Calendar, FlaskConical, Users
} from 'lucide-react'

// ── Constants (component బయట — OK) ──────────────────────────────────
const ACADEMIC_YEAR = '2026-2027'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

const COLUMNS = [
  { label: '9:10 - 10:00',  type: 'period' },
  { label: '10:00 - 10:50', type: 'period' },
  { label: 'BREAK',         type: 'break'  },
  { label: '11:00 - 11:50', type: 'period' },
  { label: '11:50 - 12:40', type: 'period' },
  { label: 'LUNCH',         type: 'lunch'  },
  { label: '1:20 - 2:10',   type: 'period' },
  { label: '2:10 - 3:00',   type: 'period' },
  { label: '3:10 - 4:00',   type: 'period' },
  { label: '4:00 - 5:00',   type: 'period' },
]

const CLASSES = [
  'FIRST YEAR SCIENCE - GENERAL',
  'SECOND YEAR SCIENCE - GENERAL',
  'FIRST YEAR ARTS - GENERAL',
  'SECOND YEAR ARTS - GENERAL',
  'FIRST YEAR VOCATIONAL',
  'SECOND YEAR VOCATIONAL',
]

const CLASS_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-teal-100 text-teal-800 border-teal-200',
]

const TODAY = ['Sunday','Monday','Tuesday','Wednesday',
  'Thursday','Friday','Saturday'][new Date().getDay()]

// ── Component ─────────────────────────────────────────────────────────
export default function LecturerTimetablePage() {

  // ✅ అన్ని useState లు ఇక్కడే — component లోపల
  const [selectedLecturer, setSelectedLecturer] = useState('')
  const [lecturerList,     setLecturerList]     = useState([])
  const [allSlots,         setAllSlots]         = useState([])
  const [loading,          setLoading]          = useState(false)
  const [activeDay,        setActiveDay]        = useState(
    TODAY !== 'Sunday' ? TODAY : 'Monday'
  )

  // ── Fetch all classes → extract lecturer names ───────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        CLASSES.map(cls =>
          fetch(
            `/api/timetable-builder/slots?classLabel=${encodeURIComponent(cls)}&academicYear=${ACADEMIC_YEAR}`
          )
            .then(r => r.json())
            .then(d =>
              (d.data?.slots || []).map(s => ({ ...s, classLabel: cls }))
            )
        )
      )

      const combined = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)

      setAllSlots(combined)

      // ✅ DB నుండి actual lecturer names తీసుకోండి
      const uniqueLecturers = [
        ...new Set(
          combined
            .filter(s => s.lecturerName && s.periodType === 'period' && s.subject)
            .map(s => s.lecturerName)
        ),
      ].sort()

      console.log('DB Lecturers:', uniqueLecturers)

      setLecturerList(uniqueLecturers)

      // First lecturer auto-select
      if (uniqueLecturers.length > 0 && !selectedLecturer) {
        setSelectedLecturer(uniqueLecturers[0])
      }

    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedLecturer])

  useEffect(() => { fetchAll() }, [])

  // ── Filter this lecturer's slots ─────────────────────────────────
  const mySlots = allSlots.filter(
    s => s.lecturerName === selectedLecturer &&
         s.periodType === 'period' &&
         s.subject
  )

  const getMyCell = (day, pIndex) =>
    mySlots.find(s => s.day === day && s.periodIndex === pIndex) || null

  // ── Stats ─────────────────────────────────────────────────────────
  const totalPeriods  = mySlots.length
  const theoryPeriods = mySlots.filter(s => !s.isPractical).length
  const practicals    = mySlots.filter(s => s.isPractical).length
  const myClasses     = [...new Set(mySlots.map(s => s.classLabel))]
  const todaySlots    = mySlots.filter(s => s.day === TODAY)

  const statusLabel =
    totalPeriods < 16 ? 'Underload' :
    totalPeriods > 18 ? 'Overload'  : 'Normal'

  const statusColor =
    statusLabel === 'Normal' ? 'text-emerald-600' : 'text-rose-600'

  // ── Render ────────────────────────────────────────────────────────
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
                <h1 className="text-lg font-black text-slate-800">Lecturer Schedule</h1>
                <p className="text-xs text-slate-400">{ACADEMIC_YEAR} · Read-only</p>
              </div>
            </div>

            {/* Lecturer selector */}
            <div className="relative">
              <select
                value={selectedLecturer}
                onChange={e => setSelectedLecturer(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-bold text-slate-700 focus:border-blue-400 focus:outline-none"
              >
                {lecturerList.length > 0 ? (
                  lecturerList.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))
                ) : (
                  <option value="">Loading lecturers...</option>
                )}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Periods', value: totalPeriods,  color: 'blue',    icon: <Clock size={14}/> },
            { label: 'Theory',        value: theoryPeriods, color: 'indigo',  icon: <BookOpen size={14}/> },
            { label: 'Practicals',    value: practicals,    color: 'amber',   icon: <FlaskConical size={14}/> },
            { label: 'Classes',       value: myClasses.length, color: 'emerald', icon: <Users size={14}/> },
          ].map(({ label, value, color, icon }) => {
            const bg  = { blue:'bg-blue-50 text-blue-600', indigo:'bg-indigo-50 text-indigo-600', amber:'bg-amber-50 text-amber-600', emerald:'bg-emerald-50 text-emerald-600' }
            const val = { blue:'text-blue-700', indigo:'text-indigo-700', amber:'text-amber-700', emerald:'text-emerald-700' }
            return (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-center">
                <div className={`mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-xl ${bg[color]}`}>{icon}</div>
                <p className={`text-xl font-black ${val[color]}`}>{value}</p>
                <p className="text-[10px] font-semibold text-slate-400">{label}</p>
              </div>
            )
          })}
        </div>

        {/* ── Workload Status ── */}
        {selectedLecturer && (
          <div className={`rounded-2xl border px-4 py-3 shadow-sm flex items-center gap-3 ${
            statusLabel === 'Normal'
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50'
          }`}>
            {statusLabel === 'Normal'
              ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0"/>
              : <AlertCircle  size={16} className="text-rose-600 shrink-0"/>
            }
            <div className="flex-1">
              <p className={`text-sm font-black ${statusColor}`}>
                Workload: {statusLabel} ({totalPeriods}/18 periods)
              </p>
              <p className="text-xs text-slate-400">
                {statusLabel === 'Normal'    ? '16–18 periods — ideal range'
                : statusLabel === 'Underload' ? 'Less than 16 — more classes needed'
                : 'More than 18 — reduce load'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full transition-all ${
                    statusLabel === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min((totalPeriods / 18) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-600">{totalPeriods}/18</span>
            </div>
          </div>
        )}

        {/* ── Today's Schedule ── */}
        {todaySlots.length > 0 && TODAY !== 'Sunday' && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
              <Calendar size={14}/> Today — {TODAY}
            </h3>
            <div className="flex flex-wrap gap-2">
              {todaySlots
                .sort((a, b) => a.periodIndex - b.periodIndex)
                .map((s, i) => (
                  <div
                    key={i}
                    className={`rounded-xl border px-3 py-2 ${
                      CLASS_COLORS[CLASSES.indexOf(s.classLabel)] ||
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}
                  >
                    <p className="text-xs font-black">{s.subject}</p>
                    <p className="text-[10px] opacity-70">{COLUMNS[s.periodIndex]?.label}</p>
                    <p className="text-[9px] mt-0.5 opacity-60 truncate max-w-[120px]">
                      {s.classLabel.split(' - ')[0]}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-blue-400" />
              <p className="text-sm text-slate-400">Loading schedule...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Weekly Grid ── */}
            {mySlots.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-800 px-5 py-3">
                  <h3 className="text-sm font-bold text-white">Weekly Schedule — {selectedLecturer}</h3>
                  <p className="text-xs text-slate-400">Color = class assignment</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="border-r border-b border-slate-200 px-3 py-2.5 text-left text-xs font-bold text-slate-500 w-24">Day</th>
                        {COLUMNS.map((c, i) => (
                          <th key={i} className={`border-r border-b border-slate-200 px-2 py-2.5 text-center text-[10px] font-bold text-slate-500 ${
                            c.type === 'break' ? 'bg-slate-200' : c.type === 'lunch' ? 'bg-slate-300' : ''
                          }`}>
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS.map((day, dIndex) => {
                        const isToday = day === TODAY
                        return (
                          <tr key={day} className={isToday ? 'bg-blue-50' : dIndex%2===0 ? 'bg-white' : 'bg-slate-50/40'}>
                            <td className="border-r border-b border-slate-100 px-3 py-2">
                              <span className={`text-xs font-black ${isToday ? 'text-blue-700' : 'text-slate-600'}`}>
                                {day}
                              </span>
                              {isToday && <p className="text-[9px] text-blue-500 font-bold">Today</p>}
                            </td>
                            {COLUMNS.map((col, pIndex) => {
                              const myCell = getMyCell(day, pIndex)
                              if (col.type === 'break') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-200 text-center text-[9px] text-slate-500 py-1">☕</td>
                              )
                              if (col.type === 'lunch') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-300 text-center text-[9px] text-slate-600 py-1">🍱</td>
                              )
                              const classIdx = myCell ? CLASSES.indexOf(myCell.classLabel) : -1
                              const colorCls = classIdx >= 0 ? CLASS_COLORS[classIdx] : ''
                              return (
                                <td key={pIndex} className="border-r border-b border-slate-100 p-0">
                                  <div className={`min-h-[52px] flex flex-col items-center justify-center px-1 py-1.5 ${colorCls}`}>
                                    {myCell ? (
                                      <>
                                        <span className="text-[10px] font-black text-center leading-tight">{myCell.subject}</span>
                                        <span className="text-[8px] opacity-60 mt-0.5 text-center leading-tight truncate w-full px-1">
                                          {myCell.classLabel.split(' ').slice(0, 3).join(' ')}
                                        </span>
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
            ) : (
              /* ── Empty State ── */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                <GraduationCap size={32} className="mb-3 text-slate-300" />
                <p className="font-semibold text-slate-400">No periods assigned</p>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedLecturer
                    ? `${selectedLecturer} కి ఇంకా periods assign కాలేదు`
                    : 'Lecturer select చేయండి'}
                </p>
              </div>
            )}

            {/* ── Assigned Classes ── */}
            {myClasses.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Assigned Classes ({myClasses.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {myClasses.map((cls, i) => (
                    <span key={cls} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                      CLASS_COLORS[i] || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      <Users size={9}/> {cls}
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
