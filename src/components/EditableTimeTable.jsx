//src/components/EditableTimeTable.jsx
'use client'
import { useState, useRef, useMemo, useEffect, useCallback } from 'react'

import {
  Lock,
  Unlock,
  RefreshCw,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Database,
  Clock,
  BookOpen,
  FileText,
  AlertTriangle,
  X,
  Zap,
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import AutoGenerateModal from '@/components/AutoGenerateModal'
import LecturerAvailabilityMatrix from '@/components/LecturerAvailabilityMatrix'
import SubstituteRecommendation from '@/components/SubstituteRecommendation'
import LecturerAvailabilityByPeriod from '@/components/LecturerAvailabilityByPeriod'
import {
  TIMETABLE_COLUMNS as COLUMNS,
  TIMETABLE_DAYS as DAYS,
  TIMETABLE_SUBJECT_COLORS as SUBJECT_COLORS,
  TIMETABLE_SUBJECT_LECTURERS as SUBJECT_LECTURERS,
  TIMETABLE_SUBJECT_OPTIONS as SUBJECTS,
  TIMETABLE_SUBJECT_TARGETS as SUBJECT_TARGETS,
} from '@/lib/timetable-config'


import {
  Eye,
  ShieldCheck,
} from "lucide-react"


// ── CONSTANTS ────────────────────────────────────────────────────────
const MIN_PERIODS = 16
const MAX_PERIODS = 24
// ── WORKLOAD ─────────────────────────────────────────────────────────

function calculateWorkload(table) {
  const SUBJECT_TARGETS = {
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
    Telugu: 10,
    Hindi: 10,
  }

  const workload = {}

  table.forEach(dayRow => {
    dayRow.forEach(cell => {
      if (!cell?.subject || cell.periodType !== 'period') return

      const lecturer = cell.lecturerName || SUBJECT_LECTURERS[cell.subject] || 'Unknown'

      if (!lecturer || lecturer === 'Unknown') return

      if (!workload[lecturer]) {
        workload[lecturer] = {
          lecturer,
          subjects: [],
          theory: 0,
          practical: 0,
          total: 0,
        }
      }

      // Duplicate subjects వద్దు
      if (!workload[lecturer].subjects.includes(cell.subject)) {
        workload[lecturer].subjects.push(cell.subject)
      }

      if (cell.isPractical || cell.subject.toLowerCase().includes('practical')) {
        workload[lecturer].practical++
      } else {
        workload[lecturer].theory++
      }

      workload[lecturer].total++
    })
  })

  return Object.values(workload).sort((a, b) => b.total - a.total)
}

// ── WORKLOAD TABLE ────────────────────────────────────────────────────
function WorkloadReport({ data }) {
  if (!data.length) return null

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-center text-sm font-bold text-slate-700">
        📊 Lecturer Workload Report
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              {[
                'Lecturer',
                'Subjects',
                'Theory',
                'Practical',
                'Total / Week',
                'Target',
                'Status',
              ].map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-bold tracking-wide uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.filter(Boolean).map(row => {
              // ✅ Subject-wise target sum
              const subjects = row.subjects || []
              const targetTotal = subjects.reduce(
                (sum, sub) => sum + (SUBJECT_TARGETS[sub] || 0),
                0
              )

              const status =
                targetTotal === 0
                  ? row.total < MIN_PERIODS
                    ? 'Underload'
                    : row.total > MAX_PERIODS
                      ? 'Overload'
                      : 'Normal'
                  : row.total < targetTotal
                    ? 'Underload'
                    : row.total > targetTotal
                      ? 'Overload'
                      : 'Normal'

              // ✅ Each subject — assigned vs target
              const subjectDetails = subjects.map(sub => ({
                name: sub,
                target: SUBJECT_TARGETS[sub] || 0,
                isPractical: sub.toLowerCase().includes('practical'),
              }))

              return (
                <tr
                  key={row.lecturer}
                  className={status === 'Normal' ? 'bg-emerald-50' : 'bg-rose-50'}
                >
                  {/* Lecturer */}
                  <td className="px-4 py-2 font-semibold whitespace-nowrap text-slate-800">
                    {row.lecturer}
                  </td>

                  {/* ✅ Subject + target badges */}
                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {subjectDetails.map((s, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            s.isPractical
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-blue-200 bg-blue-50 text-blue-700'
                          }`}
                        >
                          {s.name}
                          {s.target > 0 && (
                            <span className="rounded-full bg-white px-1 font-black">
                              {s.target}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Theory */}
                  <td className="px-4 py-2 text-center">{row.theory}</td>

                  {/* Practical */}
                  <td className="px-4 py-2 text-center">{row.practical}</td>

                  {/* Total */}
                  <td className="px-4 py-2 text-center font-black text-slate-800">{row.total}</td>

                  {/* ✅ Target */}
                  <td className="px-4 py-2 text-center">
                    {targetTotal > 0 ? (
                      <span
                        className={`font-bold ${
                          row.total === targetTotal
                            ? 'text-emerald-600'
                            : row.total < targetTotal
                              ? 'text-rose-600'
                              : 'text-red-700'
                        }`}
                      >
                        {row.total}/{targetTotal}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-2 text-center">
                    {status === 'Normal' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 size={11} /> Normal
                      </span>
                    )}
                    {status === 'Underload' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                        <AlertCircle size={11} /> Underload
                      </span>
                    )}
                    {status === 'Overload' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                        <AlertCircle size={11} /> Overload
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
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs font-semibold">
        <span className="text-emerald-700">🟢 Normal range</span>
        <span className="text-rose-700">🔴 Under/Over Load</span>
        <span className="text-blue-600">🔢 Subject badge = weekly target periods</span>
      </div>
    </div>
  )
}
// ── SAVE STATUS ───────────────────────────────────────────────────────
function SaveStatus({ status }) {
  if (status === 'saving')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
        <Loader2 size={12} className="animate-spin" /> Saving...
      </span>
    )
  if (status === 'saved')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <CheckCircle2 size={12} /> Saved
      </span>
    )
  if (status === 'error')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
        <AlertCircle size={12} /> Failed
      </span>
    )
  if (status === 'loading')
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
        <Loader2 size={12} className="animate-spin" /> Loading...
      </span>
    )
  return null
}

// ── CONFLICT TOOLTIP ──────────────────────────────────────────────────
function ConflictTooltip({ conflict }) {
  if (!conflict) return null
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-52 -translate-x-1/2 rounded-xl border border-red-200 bg-white p-3 text-left shadow-xl">
      <div className="mb-2 flex items-center gap-1.5">
        <AlertTriangle size={12} className="shrink-0 text-red-500" />
        <span className="text-xs font-bold text-red-600">Conflict!</span>
      </div>
      <p className="mb-1 text-[10px] font-semibold text-slate-600">{conflict.lecturerName}</p>
      <p className="mb-1.5 text-[10px] text-slate-500">
        {conflict.day} · Period {Number(conflict.periodIndex) + 1}
      </p>
      <div className="space-y-1">
        {conflict.classes?.map((cls, i) => (
          <div key={i} className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1">
            <span className="truncate text-[9px] font-bold text-red-700">{cls.classLabel}</span>
          </div>
        ))}
      </div>
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
    </div>
  )
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────
export default function EditableTimeTable({
  title,
  stream = 'general',
  academicYear = '2026-2027',
  readOnly = false,
  onConflictChange, // parent కి conflict count notify చేయడానికి
}) {
  const printRef = useRef(null)
  const classLabel = title

  const [showAutoModal, setShowAutoModal] = useState(false)

  const emptyTable = () =>
    DAYS.map(() =>
      COLUMNS.map(c => ({
        subject: c.type === 'period' ? '' : c.label,
        lecturerName: '',
        isLocked: false,
        isPractical: false,
        _id: null,
        periodType: c.type,
      }))
    )

  const [table, setTable] = useState(emptyTable)
  const [editing, setEditing] = useState(null)
  const [saveStatus, setSaveStatus] = useState(null)
  const [savingCell, setSavingCell] = useState(null)
  const [conflicts, setConflicts] = useState([]) // ✅ conflict state
  const [hoverConflict, setHoverConflict] = useState(null) // tooltip

  // ── Fetch conflicts from API ─────────────────────────────────────
  const fetchConflicts = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/timetable-builder/conflicts?academicYear=${encodeURIComponent(academicYear)}`
      )
      const data = await res.json()
      if (!res.ok) return

      const allConflicts = data.data?.conflicts || []

      // ✅ ఈ class కి related conflicts మాత్రమే filter చేయండి
      const myConflicts = allConflicts.filter(c =>
        c.classes?.some(cls => cls.classLabel === classLabel)
      )

      setConflicts(myConflicts)

      // Parent కి total conflicts notify చేయండి
      onConflictChange?.(classLabel, myConflicts.length)
    } catch (err) {
      console.error('Conflict fetch error:', err)
    }
  }, [classLabel, academicYear, onConflictChange])

  // ── Fetch timetable ───────────────────────────────────────────────
  const fetchTimetable = useCallback(async () => {
    setSaveStatus('loading')
    try {
      const res = await fetch(
        `/api/timetable-builder/slots?classLabel=${encodeURIComponent(classLabel)}&academicYear=${encodeURIComponent(academicYear)}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      const slots = data.data?.slots || []
      if (slots.length === 0) {
        setTable(emptyTable())
        setSaveStatus(null)
        return
      }

      const newTable = emptyTable()
      slots.forEach(slot => {
        const dIndex = DAYS.indexOf(slot.day)
        if (dIndex === -1) return
        newTable[dIndex][slot.periodIndex] = {
          subject: slot.subject || '',
          lecturerName: slot.lecturerName || '',
          isLocked: slot.isLocked || false,
          isPractical: slot.isPractical || false,
          _id: slot._id,
          periodType: slot.periodType || 'period',
        }
      })

      setTable(newTable)
      setSaveStatus(null)
    } catch (err) {
      console.error('Fetch error:', err)
      setSaveStatus('error')
    }
  }, [classLabel, academicYear])

  useEffect(() => {
    fetchTimetable().then(() => fetchConflicts())
  }, [fetchTimetable, fetchConflicts])

  // ── Save cell ──────────────────────────────────────────────────────
  const saveCell = async (dIndex, pIndex, subject) => {
    const day = DAYS[dIndex]
    const col = COLUMNS[pIndex]
    const lecturerName = SUBJECT_LECTURERS[subject] || ''
    const isPractical = subject.toLowerCase().includes('practical')

    setSavingCell({ dIndex, pIndex })
    setSaveStatus('saving')

    try {
      const res = await fetch('/api/timetable-builder/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLabel,
          stream,
          academicYear,
          day,
          periodIndex: pIndex,
          periodLabel: col.label,
          periodType: col.type,
          subject,
          lecturerName,
          isPractical,
          subjectColor: '#e2e8f0',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

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

      // ✅ Save తర్వాత conflicts re-check చేయండి
      await fetchConflicts()
    } catch (err) {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    } finally {
      setSavingCell(null)
    }
  }

  // ── Conflict helpers ───────────────────────────────────────────────

  // ఒక cell conflict లో ఉందా?
  const getConflict = useCallback(
    (dIndex, pIndex) => {
      const day = DAYS[dIndex]
      return conflicts.find(c => c.day === day && Number(c.periodIndex) === pIndex) || null
    },
    [conflicts]
  )

  // ── Toggle Lock ────────────────────────────────────────────────────
  const toggleLock = async (dIndex, pIndex) => {
    const cell = table[dIndex]?.[pIndex] ?? {
      subject: '',
      lecturerName: '',
      isLocked: false,
      isPractical: false,
      _id: null,
      periodType: col.type,
    }
    if (!cell._id) return
    const newLocked = !cell.isLocked
    try {
      await fetch(`/api/timetable-builder/slots/${cell._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: newLocked }),
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
      setConflicts([])
      onConflictChange?.(classLabel, 0)
      setSaveStatus(null)
    } catch (err) {
      setSaveStatus('error')
    }
  }

  // ── Print ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = printRef.current.innerHTML
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

  // ── Export PDF ──────────────────────────────────────────────────────
  const handleExportPDF = () => {

    const doc = new jsPDF('landscape', 'mm', 'a4')

    const subjectColors = {
      Maths: [219, 234, 254],
      Physics: [254, 243, 199],
      Chemistry: [209, 250, 229],
      'Physics Practicals': [253, 230, 138],
      'Chemistry Practicals': [167, 243, 208],
      Botany: [220, 252, 231],
      'Botany Practicals': [187, 247, 208],
      Zoology: [204, 251, 241],
      'Zoology Practicals': [153, 246, 228],
      Civics: [243, 232, 255],
      Economics: [254, 228, 226],
      History: [255, 237, 213],
      Commerce: [254, 243, 199],
      English: [224, 242, 254],
      Telugu: [237, 233, 254],
      Sanskrit: [253, 232, 243],
      Hindi: [253, 231, 243],
      'Study Hour': [241, 245, 249],
      GFC: [236, 253, 245],
      'Bridge Course': [224, 231, 255],
    }

    doc.setFontSize(13)

    doc.setFont('helvetica', 'bold')
doc.setFontSize(16)
doc.text('S.K.R.GOVERNMENT JUNIOR COLLEGE', 148, 10, {
  align: 'center'
})

doc.setFontSize(11)
doc.text('GUDUR, SPSR NELLORE DISTRICT', 148, 16, {
  align: 'center'
})

doc.setFontSize(13)
doc.text(title.toUpperCase(), 148, 24, {
  align: 'center'
})

doc.setFont('helvetica', 'normal')
doc.setFontSize(8)
doc.text(
  `Academic Year : ${academicYear}     Stream : ${stream}`,
  148,
  30,
  { align: 'center' }
)

    if (conflicts.length > 0) {
      doc.setTextColor(220, 38, 38)
      doc.text(
  `⚠ ${conflicts.length} conflict(s) detected`,
  148,
  35,
  { align: 'center' }
)
      doc.setTextColor(0, 0, 0)
    }

    const head = [['Day', ...COLUMNS.map(c => c.label)]]
    const body = DAYS.map((day, dIndex) => [
      day,
      ...COLUMNS.map((col, pIndex) => {
        if (col.type === 'break') return 'BREAK'
        if (col.type === 'lunch') return 'LUNCH'

        const cell = table[dIndex]?.[pIndex]

if (!cell) return ''

return [
  cell.subject,
  cell.lecturerName || ''
].filter(Boolean).join('\n')


      }),
    ])

    const cellColorMap = DAYS.map((_, dIndex) =>
      COLUMNS.map((col, pIndex) => {
        if (col.type === 'break') return [209, 213, 219]
        if (col.type === 'lunch') return [156, 163, 175]
        // Conflict → red
        if (getConflict(dIndex, pIndex)) return [254, 202, 202]
        const subj = table[dIndex]?.[pIndex]?.subject || ''
        return subjectColors[subj] || null
      })
    )

    autoTable(doc, {
      startY: conflicts.length > 0 ? 40 : 36,
      head,
      body,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        minCellHeight: 11,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252], cellWidth: 22 },
      },
      didParseCell(hookData) {
        if (hookData.section !== 'body') return
        if (hookData.column.index === 0) return
        const color = cellColorMap[hookData.row.index]?.[hookData.column.index - 1]
        if (color) hookData.cell.styles.fillColor = color
      },
      margin: { left: 12, right: 12 },
    })

    // if (workloadData.length > 0) {
    //   doc.setFontSize(10)
    //   doc.setFont('helvetica', 'bold')
    //   doc.text('Lecturer Workload', 148, doc.lastAutoTable.finalY + 8, { align: 'center' })
    //   autoTable(doc, {
    //     startY: doc.lastAutoTable.finalY + 12,

    //     head: [['#', 'Lecturer', 'Subject', 'Theory', 'Practical', 'Load / Target', 'Status']],

    //     body: workloadData.map((row, i) => {
    //       const SUBJECT_TARGETS = {
    //         Mathematics: 12,
    //         Maths: 12,
    //         Physics: 11,
    //         Chemistry: 11,
    //         Botany: 6,
    //         Zoology: 6,
    //         History: 11,
    //         Commerce: 11,
    //         Economics: 11,
    //         Civics: 11,
    //         English: 14,
    //         Telugu: 10,
    //         Hindi: 10,
    //       }

    //       const mainSubject =
    //         (row.subjects || []).find(s => !s.toLowerCase().includes('practical')) ||
    //         row.subjects?.[0] ||
    //         ''

    //       const expected = SUBJECT_TARGETS[mainSubject] || 0
    //       const status =
    //         expected === 0
    //           ? 'Normal'
    //           : row.total < expected
    //             ? 'Underload'
    //             : row.total > expected
    //               ? 'Overload'
    //               : 'Normal'

    //       return [
    //         i + 1,
    //         row.lecturer || row.name,

    //         mainSubject,

    //         row.theory,
    //         row.practical,
    //         `${row.total} / ${expected}`,
    //         status,
    //       ]
    //     }),

    //     theme: 'grid',
    //     styles: { fontSize: 8, halign: 'center', textColor: [30, 41, 59] },
    //     headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },

    //     columnStyles: {
    //       0: { cellWidth: 10 },
    //       1: { halign: 'left', fontStyle: 'bold', cellWidth: 42 },
    //       2: { cellWidth: 24 },
    //       3: { cellWidth: 16 },
    //       4: { cellWidth: 18 },
    //       5: { cellWidth: 22 },
    //       6: { cellWidth: 22 },
    //     },

    //     didParseCell(h) {
    //       if (h.section !== 'body' || h.column.index !== 5) return
    //       if (h.cell.raw === 'Normal') h.cell.styles.fillColor = [209, 250, 229]
    //       if (h.cell.raw === 'Underload') h.cell.styles.fillColor = [254, 226, 226]
    //       if (h.cell.raw === 'Overload') h.cell.styles.fillColor = [254, 202, 202]
    //     },
    //     margin: { left: 30, right: 30 },
    //   })
    // }

    const pageCount = doc.getNumberOfPages()

for (let i = 1; i <= pageCount; i++) {

  doc.setPage(i)

  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()

  // =============================
  // Signature Area
  // =============================

  const lineY = pageHeight - 22

  doc.setDrawColor(180)
  doc.setLineWidth(0.3)
  doc.line(15, lineY - 8, pageWidth - 15, lineY - 8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(60)

  // Labels
  doc.text('Prepared By', 40, lineY)
  doc.text('Time Table Convener', pageWidth / 2, lineY, {
    align: 'center',
  })
  doc.text('Principal', pageWidth - 40, lineY, {
    align: 'right',
  })

  // Signature lines
  doc.line(20, lineY + 10, 60, lineY + 10)

  doc.line(
    pageWidth / 2 - 25,
    lineY + 10,
    pageWidth / 2 + 25,
    lineY + 10
  )

  doc.line(pageWidth - 60, lineY + 10, pageWidth - 20, lineY + 10)

  // =============================
  // Footer
  // =============================

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(130)

  doc.text(
    `Generated by OSRA ERP • ${new Date().toLocaleString()} • Page ${i} of ${pageCount}`,
    pageWidth / 2,
    pageHeight - 4,
    {
      align: 'center',
    }
  )
}

    doc.save(`${title.replace(/\s+/g, '_')}_${academicYear}.pdf`)
  }

  // ── Stats ──────────────────────────────────────────────────────────
  const workloadData = useMemo(() => calculateWorkload(table), [table])

  const totalPeriods = COLUMNS.filter(c => c.type === 'period').length * DAYS.length
  const filledPeriods = table.flat().filter(c => c.periodType === 'period' && c.subject).length
  const fillPercent = Math.round((filledPeriods / totalPeriods) * 100)
  const conflictCount = conflicts.length

  return (
    <div className="mb-12 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ── Header ── */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b px-5 py-4 ${
          conflictCount > 0
            ? 'border-red-700 bg-linear-to-r from-red-900 to-rose-800'
            : 'border-slate-700 bg-linear-to-r from-slate-800 to-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl shadow ${
              conflictCount > 0 ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            <BookOpen size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">{title}</h2>
            <p className="text-xs font-medium text-slate-400">
              {academicYear} · {stream}
            </p>
          </div>

          {/* ✅ Conflict Badge */}
          {conflictCount > 0 && (
            <div className="flex animate-pulse items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1 shadow-md">
              <AlertTriangle size={13} className="text-white" />
              <span className="text-xs font-black text-white">
                {conflictCount} Conflict{conflictCount > 1 ? 's' : ''}!
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fill Progress */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-700/80 px-3 py-1.5">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-600">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-500"
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-300">
              {filledPeriods}/{totalPeriods}
            </span>
          </div>

          <div className="min-w-20">
            <SaveStatus status={saveStatus} />
          </div>

          {!readOnly && (
            <>
              <button
                onClick={() => fetchTimetable().then(fetchConflicts)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-500 print:hidden"
              >
                <RefreshCw size={12} /> Refresh
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 print:hidden"
              >
                <Trash2 size={12} /> Clear All
              </button>
            </>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 print:hidden"
          >
            <Printer size={12} /> Print
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 print:hidden"
          >
            <FileText size={12} /> PDF
          </button>
          <button
            onClick={() => setShowAutoModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-700 print:hidden"
          >
            <Zap size={12} /> Auto Generate
          </button>
        </div>
      </div>

      {/* ✅ Conflict Alert Bar */}
      {conflictCount > 0 && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-2.5 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-red-500" />
            <span className="text-xs font-bold text-red-700">
              {conflictCount} conflict{conflictCount > 1 ? 's' : ''} detected!
            </span>
            <div className="flex flex-wrap gap-2">
              {conflicts.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700"
                >
                  <AlertTriangle size={9} />
                  {c.lecturerName} · {c.day} · P{Number(c.periodIndex) + 1}
                  <span className="text-red-400">({c.classes?.length} classes)</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DB Sync indicator ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2 print:hidden">
        <Database size={11} className="text-slate-400" />
        <span className="text-xs text-slate-400">
          Cell select → Auto save · Conflict check automatic
        </span>
        {saveStatus === null && filledPeriods > 0 && conflictCount === 0 && (
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 size={11} /> No Conflicts ✅
          </span>
        )}
      </div>

      {/* ── Timetable Grid ── */}
      <div ref={printRef} className="overflow-x-auto p-4">
        <table className="w-full min-w-[1000px] border-3 text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="w-24 border border-slate-600 px-3 py-2.5 text-left text-xs font-bold tracking-wide uppercase">
                Day
              </th>
              {COLUMNS.map((c, i) => (
                <th
                  key={i}
                  className={`border px-2 py-2.5 text-center text-xs font-bold ${
                    c.type === 'break'
                      ? 'w-12 border-slate-600 bg-slate-600'
                      : c.type === 'lunch'
                        ? 'w-14 border-slate-500 bg-slate-500'
                        : 'border-slate-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    {c.type === 'period' && <Clock size={10} className="mb-0.5 text-slate-400" />}
                    <span className="whitespace-nowrap">{c.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day, dIndex) => (
              <tr key={day} className={dIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="border border-slate-300 px-3 py-2 text-xs font-bold whitespace-nowrap text-slate-700">
                  <div className="flex flex-col">
                    <span>{day}</span>
                    <span className="font-normal text-slate-400">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dIndex]}
                    </span>
                  </div>
                </td>

                {COLUMNS.map((col, pIndex) => {

                  const cell = table[dIndex][pIndex]

                  const isSaving = savingCell?.dIndex === dIndex && savingCell?.pIndex === pIndex
                  const isEditing = editing?.dIndex === dIndex && editing?.pIndex === pIndex
                  const conflict = getConflict(dIndex, pIndex) // ✅
                  const colorClass = conflict
                    ? '' // conflict ఉంటే custom style వాడతాం
                    : SUBJECT_COLORS[cell.subject] || ''

                  if (col.type !== 'period') {
                    return (
                      <td
                        key={pIndex}
                        className={`border border-slate-200 px-1 py-2 text-center text-xs font-bold ${
                          col.type === 'break'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {col.type === 'break' ? '☕' : '🍱'}
                        <div className="mt-0.5 text-[9px]">{col.label}</div>
                      </td>
                    )
                  }

                  return (
                    <td
                      key={pIndex}
                      className={`border p-0 text-center text-xs transition-all ${
                        conflict
                          ? 'border-red-400 ring-2 ring-red-400 ring-inset' // ✅ red ring
                          : 'border-slate-200'
                      } ${
                        readOnly
                          ? ''
                          : 'cursor-pointer hover:ring-2 hover:ring-blue-300 hover:ring-inset'
                      } ${isSaving ? 'opacity-60' : ''}`}
                      onClick={() => !readOnly && !cell.isLocked && setEditing({ dIndex, pIndex })}
                    >
                      {isEditing ? (
                        <select
                          autoFocus
                          value={cell.subject}
                          onChange={async e => {
                            setEditing(null)
                            await saveCell(dIndex, pIndex, e.target.value)
                          }}
                          onBlur={() => setEditing(null)}
                          className="w-full rounded border-0 bg-white px-1 py-1.5 text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                          {SUBJECTS[stream].map(sub => (
                            <option key={sub} value={sub}>
                              {sub || '— Select —'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          className={`relative flex min-h-[52px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 ${
                            conflict
                              ? 'bg-red-100' // ✅ conflict → red background
                              : colorClass
                          }`}
                          onMouseEnter={() =>
                            conflict && setHoverConflict({ dIndex, pIndex, conflict })
                          }
                          onMouseLeave={() => setHoverConflict(null)}
                        >
                          {/* ✅ Conflict icon */}
                          {conflict && (
                            <AlertTriangle
                              size={10}
                              className="absolute top-1 left-1 animate-pulse text-red-500"
                            />
                          )}

                          {cell.isLocked && (
                            <Lock size={9} className="absolute top-1 right-1 text-slate-500" />
                          )}

                          {isSaving && <Loader2 size={14} className="animate-spin text-blue-500" />}

                          {!isSaving && (
                            <>
                              <span
                                className={`text-center leading-tight font-semibold ${conflict ? 'text-red-800' : ''}`}
                                style={{ fontSize: '10px' }}
                              >
                                {cell.subject || (
                                  <span className="font-normal text-slate-500">Click to add</span>
                                )}
                              </span>
                              {cell.lecturerName && (
                                <span
                                  className={`text-[9px] leading-tight ${conflict ? 'font-bold text-red-600' : 'opacity-60'}`}
                                >
                                  {cell.lecturerName}
                                </span>
                              )}
                              {/* Conflict label */}
                              {conflict && (
                                <span className="mt-0.5 rounded bg-red-200 px-1 text-[8px] font-bold text-red-600">
                                  CONFLICT
                                </span>
                              )}
                            </>
                          )}

                          {/* Conflict Tooltip */}
                          {hoverConflict?.dIndex === dIndex && hoverConflict?.pIndex === pIndex && (
                            <ConflictTooltip conflict={conflict} />
                          )}

                          {/* Lock toggle */}
                          {!readOnly && cell.subject && cell._id && !isSaving && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                toggleLock(dIndex, pIndex)
                              }}
                              className="absolute right-0.5 bottom-0.5 opacity-0 transition-opacity hover:opacity-100 print:hidden"
                              title={cell.isLocked ? 'Unlock' : 'Lock'}
                            >
                              {cell.isLocked ? (
                                <Unlock size={8} className="text-slate-500" />
                              ) : (
                                <Lock size={8} className="text-slate-400" />
                              )}
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
        <WorkloadReport data={workloadData} />

        <LecturerAvailabilityMatrix
        columns={COLUMNS}
    table={table}

/>
<LecturerAvailabilityByPeriod
    table={table}
/>

<SubstituteRecommendation
    table={table}
/>
     
      </div>

      {showAutoModal && (
        <AutoGenerateModal
          classLabel={classLabel}
          stream={stream}
          academicYear={academicYear}
          onClose={() => setShowAutoModal(false)}
          onGenerated={result => {
            if (!result?.unallocated?.length) setShowAutoModal(false)
            fetchTimetable().then(fetchConflicts)
          }}
        />
      )}

      {/* ── Footer ── */}
      {/* ───────────── Footer ───────────── */}
<div className="rounded-b-2xl border-t border-slate-200 bg-linear-to-r from-slate-50 via-white to-slate-50 px-5 py-3 print:hidden">

  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

    {/* Left */}
    <div className="flex items-center gap-2 text-xs text-slate-500">
      {!readOnly ? (
        <>
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span>
            Click a cell → Select Subject → Changes are saved automatically
          </span>
        </>
      ) : (
        <>
          <Eye size={13} className="text-blue-500" />
          <span>Read Only Mode</span>
        </>
      )}
    </div>

    {/* Center */}
    <div className="flex items-center gap-4 text-xs">

      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
        <CheckCircle2 size={11} />
        {filledPeriods} Filled
      </span>

      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
        {totalPeriods - filledPeriods} Empty
      </span>

      {conflictCount > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
          <AlertTriangle size={11} />
          {conflictCount} Conflict{conflictCount > 1 ? "s" : ""}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
          <ShieldCheck size={11} />
          No Conflicts
        </span>
      )}

    </div>

    {/* Right */}
    <div className="text-right text-[11px] leading-tight text-slate-400">

      <p className="font-semibold text-slate-600">
        OSRA Timetable Builder
      </p>

      <p>
        Academic Year {academicYear}
      </p>

    </div>

  </div>

</div>
    </div>
  )
}
