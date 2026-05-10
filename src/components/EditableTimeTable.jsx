//
'use client'
import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import {
  Save, Lock, Unlock, RefreshCw, Printer,
  CheckCircle2, AlertCircle, Loader2, Trash2,
  Zap, Database, Clock, BookOpen
} from 'lucide-react'

// ── CONSTANTS ───────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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

const SUBJECTS = {
  general: [
    '', 'Maths', 'Physics', 'Chemistry',
    'Physics Practicals', 'Chemistry Practicals',
    'Botany', 'Botany Practicals', 'Zoology', 'Zoology Practicals',
    'Civics', 'Economics', 'History', 'Commerce',
    'English', 'Telugu', 'Sanskrit', 'Hindi', 'Study Hour',
  ],
  vocational: [
    '', 'English', 'GFC', 'V1', 'V1 Practicals',
    'V2', 'V2 Practicals', 'V3', 'V3 Practicals',
    'V4', 'V4 Practicals', 'V5', 'V5 Practicals',
    'V6', 'V6 Practicals', 'Study Hour', 'Bridge Course',
  ],
}

// Subject → background color
const SUBJECT_COLORS = {
  'Maths':               'bg-blue-100 text-blue-800',
  'Physics':             'bg-yellow-100 text-yellow-800',
  'Chemistry':           'bg-emerald-100 text-emerald-800',
  'Physics Practicals':  'bg-yellow-200 text-yellow-900',
  'Chemistry Practicals':'bg-emerald-200 text-emerald-900',
  'Botany':              'bg-green-100 text-green-800',
  'Botany Practicals':   'bg-green-200 text-green-900',
  'Zoology':             'bg-teal-100 text-teal-800',
  'Zoology Practicals':  'bg-teal-200 text-teal-900',
  'Civics':              'bg-purple-100 text-purple-800',
  'Economics':           'bg-rose-100 text-rose-800',
  'History':             'bg-orange-100 text-orange-800',
  'Commerce':            'bg-amber-100 text-amber-800',
  'English':             'bg-sky-100 text-sky-800',
  'Telugu':              'bg-violet-100 text-violet-800',
  'Sanskrit':            'bg-pink-100 text-pink-800',
  'Hindi':               'bg-fuchsia-100 text-fuchsia-800',
  'Study Hour':          'bg-slate-100 text-slate-600',
  'GFC':                 'bg-lime-100 text-lime-800',
  'Bridge Course':       'bg-indigo-100 text-indigo-800',
}

const SUBJECT_LECTURERS = {
  'Maths':               'Maths Lecturer',
  'Physics':             'Physics Lecturer',
  'Chemistry':           'Chemistry Lecturer',
  'Physics Practicals':  'Physics Lecturer',
  'Chemistry Practicals':'Chemistry Lecturer',
  'Botany':              'Botany Lecturer',
  'Botany Practicals':   'Botany Lecturer',
  'Zoology':             'Zoology Lecturer',
  'Zoology Practicals':  'Zoology Lecturer',
  'English':             'English Lecturer',
  'Telugu':              'Telugu Lecturer',
  'GFC':                 'GFC Lecturer',
}

const MIN_PERIODS = 16
const MAX_PERIODS = 18

// ── WORKLOAD CALCULATION ─────────────────────────────────────────────
function calculateWorkload(table) {
  const workload = {}
  table.forEach(dayRow => {
    dayRow.forEach(cell => {
      if (!cell?.subject) return
      const lecturer = SUBJECT_LECTURERS[cell.subject]
      if (!lecturer) return
      if (!workload[lecturer]) workload[lecturer] = { lecturer, theory: 0, practical: 0, total: 0 }
      if (cell.subject.toLowerCase().includes('practical')) workload[lecturer].practical++
      else workload[lecturer].theory++
      workload[lecturer].total++
    })
  })
  return Object.values(workload)
}

// ── WORKLOAD TABLE ───────────────────────────────────────────────────
function WorkloadReport({ data }) {
  if (!data.length) return null
  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:mt-6">
      <h3 className="mb-4 text-center text-base font-bold text-slate-700">
        📊 Lecturer Workload Report
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              {['Lecturer','Theory','Practical','Total / Week','Status'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map(row => {
              const status   = row.total < MIN_PERIODS ? 'Underload' : row.total > MAX_PERIODS ? 'Overload' : 'Normal'
              const rowStyle = status === 'Normal'
                ? 'bg-emerald-50'
                : 'bg-rose-50'
              return (
                <tr key={row.lecturer} className={rowStyle}>
                  <td className="px-4 py-2 font-semibold text-slate-800">{row.lecturer}</td>
                  <td className="px-4 py-2 text-center">{row.theory}</td>
                  <td className="px-4 py-2 text-center">{row.practical}</td>
                  <td className="px-4 py-2 text-center font-bold">{row.total}</td>
                  <td className="px-4 py-2 text-center">
                    {status === 'Normal'    && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700"><CheckCircle2 size={11}/> Normal</span>}
                    {status === 'Underload' && <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700"><AlertCircle size={11}/> Underload</span>}
                    {status === 'Overload'  && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700"><AlertCircle size={11}/> Overload</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-center gap-6 text-xs font-semibold">
        <span className="text-emerald-700">🟢 16–18 Periods : Normal</span>
        <span className="text-rose-700">🔴 &lt;16 or &gt;18 : Under / Over Load</span>
      </div>
    </div>
  )
}

// ── SAVE STATUS INDICATOR ────────────────────────────────────────────
function SaveStatus({ status }) {
  if (status === 'saving')  return <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Loader2 size={12} className="animate-spin"/> Saving...</span>
  if (status === 'saved')   return <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600"><CheckCircle2 size={12}/> Saved</span>
  if (status === 'error')   return <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"><AlertCircle size={12}/> Save failed</span>
  if (status === 'loading') return <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600"><Loader2 size={12} className="animate-spin"/> Loading...</span>
  return null
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────
export default function EditableTimeTable({
  title,
  stream        = 'general',
  academicYear  = '2026-2027',
  readOnly      = false,
}) {
  const printRef   = useRef(null)
  const classLabel = title  // classLabel = title string

  // ── State ──────────────────────────────────────────────────────────
  // table[dayIndex][periodIndex] = { subject, lecturerName, isLocked, _id }
  const emptyTable = () =>
    DAYS.map(() =>
      COLUMNS.map(c => ({
        subject:      c.type === 'period' ? '' : c.label,
        lecturerName: '',
        isLocked:     false,
        isPractical:  false,
        _id:          null,
        periodType:   c.type,
      }))
    )

  const [table,      setTable]      = useState(emptyTable)
  const [editing,    setEditing]    = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)  // 'loading'|'saving'|'saved'|'error'|null
  const [savingCell, setSavingCell] = useState(null)  // { dIndex, pIndex }

  // ── Fetch from DB ──────────────────────────────────────────────────
  const fetchTimetable = useCallback(async () => {
    setSaveStatus('loading')
    try {
      const res  = await fetch(
        `/api/timetable-builder/slots?classLabel=${encodeURIComponent(classLabel)}&academicYear=${encodeURIComponent(academicYear)}`
      )
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Fetch failed')

      const slots = data.data?.slots || []

      if (slots.length === 0) {
        // DB లో data లేదు — empty table చూపించు
        setTable(emptyTable())
        setSaveStatus(null)
        return
      }

      // DB slots → table grid గా map చేయండి
      const newTable = emptyTable()
      slots.forEach(slot => {
        const dIndex = DAYS.indexOf(slot.day)
        if (dIndex === -1) return
        newTable[dIndex][slot.periodIndex] = {
          subject:      slot.subject      || '',
          lecturerName: slot.lecturerName || '',
          isLocked:     slot.isLocked     || false,
          isPractical:  slot.isPractical  || false,
          _id:          slot._id,
          periodType:   slot.periodType   || 'period',
        }
      })

      setTable(newTable)
      setSaveStatus(null)

    } catch (err) {
      console.error('Fetch timetable error:', err)
      setSaveStatus('error')
    }
  }, [classLabel, academicYear])

  useEffect(() => { fetchTimetable() }, [fetchTimetable])

  // ── Save single cell to DB ─────────────────────────────────────────
  const saveCell = async (dIndex, pIndex, subject) => {
    const day         = DAYS[dIndex]
    const col         = COLUMNS[pIndex]
    const lecturerName = SUBJECT_LECTURERS[subject] || ''
    const isPractical  = subject.toLowerCase().includes('practical')

    setSavingCell({ dIndex, pIndex })
    setSaveStatus('saving')

    try {
      const res  = await fetch('/api/timetable-builder/slots', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          classLabel,
          stream,
          academicYear,
          day,
          periodIndex:  pIndex,
          periodLabel:  col.label,
          periodType:   col.type,
          subject,
          lecturerName,
          isPractical,
          subjectColor: '#e2e8f0',
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Save failed')

      // ✅ Local state update
      setTable(prev => {
        const copy = prev.map(row => [...row])
        copy[dIndex][pIndex] = {
          ...copy[dIndex][pIndex],
          subject,
          lecturerName,
          isPractical,
          _id: data.data?._id || copy[dIndex][pIndex]._id,
        }
        return copy
      })

      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)

    } catch (err) {
      console.error('Save cell error:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setSavingCell(null)
    }
  }

  // ── Toggle Lock ────────────────────────────────────────────────────
  const toggleLock = async (dIndex, pIndex) => {
    const cell      = table[dIndex][pIndex]
    const newLocked = !cell.isLocked

    if (!cell._id) return  // DB లో save కానిది lock చేయలేము

    try {
      await fetch(`/api/timetable-builder/slots/${cell._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isLocked: newLocked }),
      })

      setTable(prev => {
        const copy = prev.map(row => [...row])
        copy[dIndex][pIndex] = { ...copy[dIndex][pIndex], isLocked: newLocked }
        return copy
      })
    } catch (err) {
      console.error('Lock toggle error:', err)
    }
  }

  // ── Clear All ──────────────────────────────────────────────────────
  const handleClearAll = async () => {
    if (!window.confirm(`"${classLabel}" అన్ని periods clear చేస్తారా?`)) return
    try {
      setSaveStatus('saving')
      await fetch(
        `/api/timetable-builder/slots?classLabel=${encodeURIComponent(classLabel)}&academicYear=${encodeURIComponent(academicYear)}`,
        { method: 'DELETE' }
      )
      setTable(emptyTable())
      setSaveStatus(null)
    } catch (err) {
      setSaveStatus('error')
    }
  }

  // ── Print ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content  = printRef.current.innerHTML
    const original = document.body.innerHTML
    document.body.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11px; text-align: center; }
        thead { background: #1e40af; color: white; }
        .no-print { display: none; }
      </style>
      ${content}
    `
    window.print()
    document.body.innerHTML = original
    window.location.reload()
  }

  // ── Workload ───────────────────────────────────────────────────────
  const workloadData = useMemo(() => calculateWorkload(table), [table])

  // ── Stats ──────────────────────────────────────────────────────────
  const totalPeriods  = COLUMNS.filter(c => c.type === 'period').length * DAYS.length
  const filledPeriods = table.flat().filter(c => c.periodType === 'period' && c.subject).length
  const fillPercent   = Math.round((filledPeriods / totalPeriods) * 100)

  return (
    <div className="mb-12 rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow">
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">{title}</h2>
            <p className="text-xs font-medium text-slate-400">{academicYear} · {stream} stream</p>
          </div>
        </div>

        {/* Stats + Actions */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Fill Progress */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-700 px-3 py-1.5">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-600">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-300">{filledPeriods}/{totalPeriods}</span>
          </div>

          {/* Save Status */}
          <div className="min-w-[80px]">
            <SaveStatus status={saveStatus} />
          </div>

          {/* Buttons */}
          {!readOnly && (
            <>
              <button
                onClick={fetchTimetable}
                className="flex items-center gap-1.5 rounded-xl bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-500 print:hidden"
              >
                <RefreshCw size={12} /> Refresh
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 print:hidden"
              >
                <Trash2 size={12} /> Clear All
              </button>
            </>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 print:hidden"
          >
            <Printer size={12} /> Print
          </button>
        </div>
      </div>

      {/* ── DB Sync indicator ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2 print:hidden">
        <Database size={11} className="text-slate-400" />
        <span className="text-xs text-slate-400">
          Cell select చేసినప్పుడు automatically DB లో save అవుతుంది
        </span>
        {saveStatus === null && filledPeriods > 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={11} /> DB Synced
          </span>
        )}
      </div>

      {/* ── Timetable Grid ── */}
      <div ref={printRef} className="overflow-x-auto p-4">
        <table className="min-w-[1000px] w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-slate-600 px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide w-24">
                Day
              </th>
              {COLUMNS.map((c, i) => (
                <th
                  key={i}
                  className={`border px-2 py-2.5 text-xs font-bold text-center ${
                    c.type === 'break' ? 'border-slate-600 bg-slate-600 w-12'
                    : c.type === 'lunch' ? 'border-slate-500 bg-slate-500 w-14'
                    : 'border-slate-600'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 items-center">
                    {c.type === 'period' && (
                      <Clock size={10} className="text-slate-400 mb-0.5" />
                    )}
                    <span className="whitespace-nowrap">{c.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day, dIndex) => (
              <tr key={day} className={dIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>

                {/* Day label */}
                <td className="border border-slate-200 px-3 py-2 font-bold text-slate-700 text-xs whitespace-nowrap">
                  <div className="flex flex-col">
                    <span>{day}</span>
                    <span className="text-slate-400 font-normal">
                      {['Mon','Tue','Wed','Thu','Fri','Sat'][dIndex]}
                    </span>
                  </div>
                </td>

                {COLUMNS.map((col, pIndex) => {
                  const cell      = table[dIndex][pIndex]
                  const isSaving  = savingCell?.dIndex === dIndex && savingCell?.pIndex === pIndex
                  const isEditing = editing?.dIndex === dIndex && editing?.pIndex === pIndex
                  const colorClass = SUBJECT_COLORS[cell.subject] || ''

                  // Break / Lunch cells
                  if (col.type !== 'period') {
                    return (
                      <td
                        key={pIndex}
                        className={`border border-slate-200 text-center text-xs font-bold px-1 py-2 ${
                          col.type === 'break' ? 'bg-slate-200 text-slate-600' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {col.type === 'break' ? '☕' : '🍱'}
                        <div className="text-[9px] mt-0.5">{col.label}</div>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={pIndex}
                      className={`border border-slate-200 p-0 text-center text-xs transition-all ${
                        readOnly ? '' : 'cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-inset'
                      } ${isSaving ? 'opacity-60' : ''}`}
                      onClick={() => !readOnly && !cell.isLocked && setEditing({ dIndex, pIndex })}
                    >
                      {isEditing ? (
                        // ── Editing: dropdown ──────────────────────
                        <select
                          autoFocus
                          value={cell.subject}
                          onChange={async e => {
                            setEditing(null)
                            await saveCell(dIndex, pIndex, e.target.value)
                          }}
                          onBlur={() => setEditing(null)}
                          className="w-full rounded border-0 bg-white px-1 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {SUBJECTS[stream].map(sub => (
                            <option key={sub} value={sub}>{sub || '— Select —'}</option>
                          ))}
                        </select>

                      ) : (
                        // ── Display cell ───────────────────────────
                        <div className={`relative min-h-[52px] flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 ${colorClass}`}>

                          {/* Lock icon */}
                          {cell.isLocked && (
                            <Lock size={9} className="absolute top-1 right-1 text-slate-500" />
                          )}

                          {/* Saving spinner */}
                          {isSaving && (
                            <Loader2 size={14} className="animate-spin text-blue-500" />
                          )}

                          {/* Subject name */}
                          {!isSaving && (
                            <>
                              <span className="font-semibold leading-tight text-center" style={{ fontSize: '10px' }}>
                                {cell.subject || (
                                  <span className="text-slate-300 font-normal">Click to add</span>
                                )}
                              </span>
                              {cell.lecturerName && (
                                <span className="text-[9px] opacity-60 leading-tight">{cell.lecturerName}</span>
                              )}
                            </>
                          )}

                          {/* Lock toggle button */}
                          {!readOnly && cell.subject && cell._id && !isSaving && (
                            <button
                              onClick={e => { e.stopPropagation(); toggleLock(dIndex, pIndex) }}
                              className="absolute bottom-0.5 right-0.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity print:hidden"
                              title={cell.isLocked ? 'Unlock' : 'Lock this slot'}
                            >
                              {cell.isLocked
                                ? <Unlock size={8} className="text-slate-500"/>
                                : <Lock size={8} className="text-slate-400 hover:text-slate-700"/>
                              }
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── Workload Report ── */}
        <WorkloadReport data={workloadData} />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-2.5 rounded-b-2xl print:hidden">
        <span className="text-xs text-slate-400">
          {!readOnly ? '💡 Cell click చేయండి → Subject select చేయండి → Auto save అవుతుంది' : '👁 Read-only view'}
        </span>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lock size={10}/> Locked: {table.flat().filter(c => c.isLocked).length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={10} className="text-emerald-500"/>
            {filledPeriods} filled · {totalPeriods - filledPeriods} empty
          </span>
        </div>
      </div>
    </div>
  )
}
