//src/app/timetable/lecturer/page.jsx
'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  GraduationCap, Clock, BookOpen, Loader2,
  CheckCircle2, AlertCircle, ChevronDown,
  Calendar, FlaskConical, Users, Printer, FileText
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  TIMETABLE_ACADEMIC_YEAR as ACADEMIC_YEAR,
  TIMETABLE_CLASS_LABELS as CLASSES,
  TIMETABLE_CLASS_COLORS as CLASS_COLORS,
  TIMETABLE_CLASS_PDF_COLORS as CLASS_PDF_COLORS,
  TIMETABLE_COLUMNS as COLUMNS,
  TIMETABLE_DAYS as DAYS,
  TIMETABLE_TODAY as TODAY,
} from '@/lib/timetable-config'

// ── Component ─────────────────────────────────────────────────────────
export default function LecturerTimetablePage() {

  const printRef = useRef(null)

  const [selectedLecturer, setSelectedLecturer] = useState('')
  const [lecturerList,     setLecturerList]     = useState([])
  const [allSlots,         setAllSlots]         = useState([])
  const [loading,          setLoading]          = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        CLASSES.map(cls =>
          fetch(`/api/timetable-builder/slots?classLabel=${encodeURIComponent(cls)}&academicYear=${ACADEMIC_YEAR}`)
            .then(r => r.json())
            .then(d => (d.data?.slots || []).map(s => ({ ...s, classLabel: cls })))
        )
      )

      const combined = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)

      setAllSlots(combined)

      const uniqueLecturers = [
        ...new Set(
          combined
            .filter(s => s.lecturerName && s.periodType === 'period' && s.subject)
            .map(s => s.lecturerName)
        ),
      ].sort()

      setLecturerList(uniqueLecturers)
      if (uniqueLecturers.length > 0 && !selectedLecturer) {
        setSelectedLecturer(uniqueLecturers[0])
      }
    } catch (err) {
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedLecturer])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Filter slots ─────────────────────────────────────────────────
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

  // ── Print ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content  = printRef.current?.innerHTML
    if (!content) return
    const original = document.body.innerHTML
    document.body.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; margin: 16px; }
        h1   { font-size: 16px; font-weight: bold; text-align: center; margin-bottom: 4px; }
        p    { font-size: 11px; text-align: center; color: #666; margin-bottom: 12px; }
        table { border-collapse: collapse; width: 100%; font-size: 10px; }
        th, td { border: 1px solid #000; padding: 5px 6px; text-align: center; }
        thead { background: #1e293b; color: white; }
        .break-cell { background: #d1d5db; font-weight: bold; }
        .lunch-cell { background: #9ca3af; font-weight: bold; }
        .no-print   { display: none !important; }
      </style>
      <h1>Lecturer Schedule — ${selectedLecturer}</h1>
      <p>Academic Year: ${ACADEMIC_YEAR} &nbsp;|&nbsp; Total Periods: ${totalPeriods} &nbsp;|&nbsp; Workload: ${statusLabel}</p>
      ${content}
    `
    window.print()
    document.body.innerHTML = original
    window.location.reload()
  }

  // ── Export PDF ────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4')

    // ── Title ──
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`Lecturer Schedule — ${selectedLecturer}`, 148, 12, { align: 'center' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Academic Year: ${ACADEMIC_YEAR}  ·  Total: ${totalPeriods} periods  ·  Theory: ${theoryPeriods}  ·  Practical: ${practicals}  ·  Workload: ${statusLabel}`,
      148, 18, { align: 'center' }
    )

    // ── Precompute cell colors ──
    // cellColorMap[dayIndex][colIndex] = [r,g,b] or null
    const cellColorMap = DAYS.map((day, dIndex) =>
      COLUMNS.map((col, pIndex) => {
        if (col.type === 'break') return [209, 213, 219]
        if (col.type === 'lunch') return [156, 163, 175]
        const cell     = getMyCell(day, pIndex)
        if (!cell) return null
        const classIdx = CLASSES.indexOf(cell.classLabel)
        return classIdx >= 0 ? CLASS_PDF_COLORS[classIdx] : [254, 243, 199]
      })
    )

    // ── Build body ──
    const head = [['Day', ...COLUMNS.map(c => c.label)]]
    const body = DAYS.map((day, dIndex) => [
      day,
      ...COLUMNS.map((col, pIndex) => {

        if (col.type === 'break') return 'B\nR\nE\nA\nK'

       if (col.type === 'lunch') return 'L\nU\nN\nC\nH'


        const cell = getMyCell(day, pIndex)
        return cell ? `${cell.subject}\n${cell.classLabel.split(' ').slice(0,3).join(' ')}` : ''
      }),
    ])

    // ── Timetable table ──
    autoTable(doc, {
      startY: 22,
      head,
      body,
      theme: 'grid',
      styles: {
        fontSize:      7,
        cellPadding:   2,
        halign:        'center',
        valign:        'middle',
        minCellHeight: 16,
        textColor:     [30, 41, 59],
        lineColor:     [203, 213, 225],
        lineWidth:     0.2,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize:  7,
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], cellWidth: 22 },
      },



      didParseCell(hookData) {
        if (hookData.section !== 'body') return
        if (hookData.column.index === 0)  return
        const color = cellColorMap[hookData.row.index]?.[hookData.column.index - 1]
        if (color) hookData.cell.styles.fillColor = color
      },
      margin: { left: 5, right: 5 },
    })

    // ── Workload summary table ──
    const mySubjects = [...new Set(mySlots.map(s => s.subject))]
    if (mySubjects.length > 0) {
      const finalY = doc.lastAutoTable.finalY + 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Period Summary', 148, finalY, { align: 'center' })

      // Per-class breakdown
      const classBreakdown = myClasses.map(cls => {
        const clsSlots = mySlots.filter(s => s.classLabel === cls)
        return [
          cls,
          clsSlots.filter(s => !s.isPractical).length,
          clsSlots.filter(s => s.isPractical).length,
          clsSlots.length,
        ]
      })

      autoTable(doc, {
        startY: finalY + 4,
        head:   [['Class', 'Theory', 'Practical', 'Total']],
        body:   [
          ...classBreakdown,
          ['TOTAL', theoryPeriods, practicals, totalPeriods],
        ],
        theme: 'grid',
        styles: { fontSize: 8, halign: 'center', textColor: [30, 41, 59] },
        headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
        didParseCell(h) {
          if (h.section === 'body' && h.row.index === classBreakdown.length) {
            // Total row
            cell.styles.fontStyle = 'bold'
cell.styles.halign = 'center'
cell.styles.valign = 'middle'
          }
        },
        margin: { left: 50, right: 50 },
      })
    }

    // ── Footer ──
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(150)
      doc.text(
        `Page ${i} of ${pageCount}  ·  Generated: ${new Date().toLocaleString()}`,
        148, 205, { align: 'center' }
      )
    }

    doc.save(`${selectedLecturer.replace(/\s+/g,'_')}_schedule_${ACADEMIC_YEAR}.pdf`)
  }

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

            <div className="flex flex-wrap items-center gap-2">
              {/* Lecturer selector */}
              <div className="relative">
                <select
                  value={selectedLecturer}
                  onChange={e => setSelectedLecturer(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-2 text-sm font-bold text-slate-700 focus:border-blue-400 focus:outline-none"
                >
                  {lecturerList.length > 0
                    ? lecturerList.map(l => <option key={l} value={l}>{l}</option>)
                    : <option value="">Loading...</option>
                  }
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-2.5 text-slate-400" />
              </div>

              {/* ✅ Print Button */}
              <button
                onClick={handlePrint}
                disabled={mySlots.length === 0}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
              >
                <Printer size={14} /> Print
              </button>

              {/* ✅ PDF Button */}
              <button
                onClick={handleExportPDF}
                disabled={mySlots.length === 0}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-40"
              >
                <FileText size={14} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-5 space-y-4">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Periods', value: totalPeriods,     color: 'blue',    icon: <Clock size={14}/> },
            { label: 'Theory',        value: theoryPeriods,    color: 'indigo',  icon: <BookOpen size={14}/> },
            { label: 'Practicals',    value: practicals,       color: 'amber',   icon: <FlaskConical size={14}/> },
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
            statusLabel === 'Normal' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
          }`}>
            {statusLabel === 'Normal'
              ? <CheckCircle2 size={16} className="text-emerald-600 shrink-0"/>
              : <AlertCircle  size={16} className="text-rose-600 shrink-0"/>}
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
                  className={`h-full rounded-full transition-all ${statusLabel === 'Normal' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${Math.min((totalPeriods/18)*100, 100)}%` }}
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
              {todaySlots.sort((a,b)=>a.periodIndex-b.periodIndex).map((s,i) => (
                <div key={i} className={`rounded-xl border px-3 py-2 ${CLASS_COLORS[CLASSES.indexOf(s.classLabel)] || 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                  <p className="text-xs font-black">{s.subject}</p>
                  <p className="text-[10px] opacity-70">{COLUMNS[s.periodIndex]?.label}</p>
                  <p className="text-[9px] mt-0.5 opacity-60 truncate max-w-[120px]">{s.classLabel.split(' - ')[0]}</p>
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
            {/* ── Weekly Grid (printRef) ── */}
            {mySlots.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-800 px-5 py-3 no-print">
                  <h3 className="text-sm font-bold text-white">
                    Weekly Schedule — {selectedLecturer}
                  </h3>
                  <p className="text-xs text-slate-400">Color = class assignment</p>
                </div>

                {/* ✅ printRef ఇక్కడ — table మాత్రమే print అవుతుంది */}
                <div ref={printRef} className="overflow-x-auto p-0">
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
                              <span className={`text-xs font-black ${isToday ? 'text-blue-700' : 'text-slate-600'}`}>{day}</span>
                              {isToday && <p className="text-[9px] text-blue-500 font-bold">Today</p>}
                            </td>
                            {COLUMNS.map((col, pIndex) => {
                              const myCell   = getMyCell(day, pIndex)
                              if (col.type === 'break') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-200 text-center text-[9px] text-slate-500 py-1">☕<div className="text-[8px]">BREAK</div></td>
                              )
                              if (col.type === 'lunch') return (
                                <td key={pIndex} className="border-r border-b border-slate-100 bg-slate-300 text-center text-[9px] text-slate-600 py-1">🍱<div className="text-[8px]">LUNCH</div></td>
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
                                          {myCell.classLabel.split(' ').slice(0,3).join(' ')}
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                <GraduationCap size={32} className="mb-3 text-slate-300" />
                <p className="font-semibold text-slate-400">No periods assigned</p>
                <p className="text-xs text-slate-300 mt-1">
                  {selectedLecturer ? `${selectedLecturer} కి ఇంకా periods assign కాలేదు` : 'Lecturer select చేయండి'}
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
                    <span key={cls} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${CLASS_COLORS[i] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
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
