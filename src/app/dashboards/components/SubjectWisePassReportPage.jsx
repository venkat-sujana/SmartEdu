'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import useSWR from 'swr'
import { Download, ArrowLeft } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

const UNIT_EXAMS = ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4']
const PUBLIC_EXAMS = ['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2']
const EXAM_TYPE_ORDER = [...UNIT_EXAMS, ...PUBLIC_EXAMS]

const fetcher = async url => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch data')
  return response.json()
}

const isAbsentMark = mark => ['A', 'AB'].includes(String(mark || '').trim().toUpperCase())
const getAllMarks = report => [...(report?.generalSubjects || []), ...(report?.vocationalSubjects || [])]
const formatExamLabel = examType => String(examType || 'Unknown Exam')

function getSubjectWisePassRows(reports) {
  const subjects = new Map()

  reports.forEach(report => {
    getAllMarks(report).forEach(entry => {
      const subject = String(entry?.subject || '').trim()
      if (!subject) return

      if (!subjects.has(subject)) {
        subjects.set(subject, { subject, appeared: 0, pass: 0, fail: 0, absent: 0 })
      }

      const row = subjects.get(subject)
      if (isAbsentMark(entry?.marks)) {
        row.absent += 1
        return
      }

      row.appeared += 1
      const mark = typeof entry?.marks === 'number' ? entry.marks : Number(entry?.marks)
      let passed = Number.isFinite(mark)
      if (passed && UNIT_EXAMS.includes(report.examType)) passed = mark >= 9
      if (passed && PUBLIC_EXAMS.includes(report.examType)) passed = mark >= 18
      if (passed) row.pass += 1
      else row.fail += 1
    })
  })

  return Array.from(subjects.values())
    .map(row => ({
      ...row,
      passPercent: row.appeared ? `${((row.pass / row.appeared) * 100).toFixed(1)}%` : '0.0%',
    }))
    .sort((a, b) => a.subject.localeCompare(b.subject))
}

function getRowsByExam(reports) {
  const byExam = reports.reduce((result, report) => {
    const examType = String(report?.examType || '').trim()
    if (!examType) return result
    if (!result.has(examType)) result.set(examType, [])
    result.get(examType).push(report)
    return result
  }, new Map())

  return Array.from(byExam.entries())
    .sort(([left], [right]) => {
      const leftOrder = EXAM_TYPE_ORDER.indexOf(left)
      const rightOrder = EXAM_TYPE_ORDER.indexOf(right)
      return (leftOrder === -1 ? Number.MAX_SAFE_INTEGER : leftOrder) -
        (rightOrder === -1 ? Number.MAX_SAFE_INTEGER : rightOrder) || left.localeCompare(right)
    })
    .map(([examType, examReports]) => ({ examType, rows: getSubjectWisePassRows(examReports) }))
}

function SubjectTable({ title, rows }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 sm:px-4">
        <h2 className="truncate text-sm font-black text-slate-900 sm:text-base">{title}</h2>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
          {rows.length} subjects
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="p-5 text-center text-sm text-slate-500">No subject-wise data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2 text-left">S.No</th>
                <th className="px-3 py-2 text-left">Subject</th>
                <th className="px-3 py-2 text-right">Appeared</th>
                <th className="px-3 py-2 text-right">Pass</th>
                <th className="px-3 py-2 text-right">Fail</th>
                <th className="px-3 py-2 text-right">Absent</th>
                <th className="px-3 py-2 text-right">Pass %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.subject} className="border-t border-slate-100 hover:bg-cyan-50/40">
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900">{row.subject}</td>
                  <td className="px-3 py-2 text-right">{row.appeared}</td>
                  <td className="px-3 py-2 text-right font-semibold text-emerald-700">{row.pass}</td>
                  <td className="px-3 py-2 text-right font-semibold text-rose-700">{row.fail}</td>
                  <td className="px-3 py-2 text-right font-semibold text-amber-700">{row.absent}</td>
                  <td className="px-3 py-2 text-right font-black text-cyan-700">{row.passPercent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function SubjectWisePassReportPage({ groupName, routeSegment }) {
  const { data: session } = useSession()
  const [isExporting, setIsExporting] = useState(false)
  const theme = getGroupTheme(groupName)
  const collegeName = session?.user?.collegeName || 'College'
  const { data, error, isLoading } = useSWR(
    session?.user?.collegeId ? `/api/exams?stream=${encodeURIComponent(groupName)}` : null,
    fetcher
  )
  const reports = Array.isArray(data?.data) ? data.data : []
  const firstYear = useMemo(() => getRowsByExam(reports.filter(report => report.yearOfStudy === 'First Year')), [reports])
  const secondYear = useMemo(() => getRowsByExam(reports.filter(report => report.yearOfStudy === 'Second Year')), [reports])
  const hasRows = firstYear.some(item => item.rows.length) || secondYear.some(item => item.rows.length)

  const exportPdf = () => {
    if (!hasRows || isExporting) return
    setIsExporting(true)
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(collegeName, pageWidth / 2, 12, { align: 'center' })
      doc.setFontSize(11)
      doc.text(`${groupName} - Subject Wise Pass % Report`, pageWidth / 2, 18, { align: 'center' })
      let y = 26

      ;[['First Year', firstYear], ['Second Year', secondYear]].forEach(([year, exams]) => {
        exams.forEach(({ examType, rows }) => {
          if (!rows.length) return
          if (y > 180) {
            doc.addPage()
            y = 16
          }
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(10)
          doc.text(`${year} - ${formatExamLabel(examType)}`, 14, y)
          y += 5
          autoTable(doc, {
            startY: y,
            head: [['S.No', 'Subject', 'Appeared', 'Pass', 'Fail', 'Absent', 'Pass %']],
            body: rows.map((row, index) => [index + 1, row.subject, row.appeared, row.pass, row.fail, row.absent, row.passPercent]),
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1.2, halign: 'center' },
            headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
            columnStyles: { 1: { cellWidth: 80, halign: 'left' } },
          })
          y = (doc.lastAutoTable?.finalY || y) + 7
        })
      })
      doc.save(`${groupName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-subject-wise-pass.pdf`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className={`min-h-screen bg-linear-to-br ${theme.shell} p-3 sm:p-4 md:p-6`}>
      <div className="mx-auto max-w-6xl space-y-4">
        <header className={`flex flex-col gap-3 rounded-2xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{collegeName}</p>
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{groupName} Subject-wise Pass %</h1>
            <p className="mt-1 text-sm text-slate-600">Pass % = Pass / Appeared x 100. Subject absences are excluded.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/dashboards/${routeSegment}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <button type="button" onClick={exportPdf} disabled={!hasRows || isLoading || isExporting} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Download className="h-4 w-4" /> {isExporting ? 'Preparing PDF...' : 'Export PDF'}
            </button>
          </div>
        </header>

        {isLoading ? <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">Loading subject-wise results...</p> : null}
        {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">Unable to load subject-wise results. Please try again.</p> : null}
        {!isLoading && !error && !hasRows ? <p className="rounded-2xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">No subject-wise exam data available.</p> : null}
        {!isLoading && !error && hasRows ? (
          <div className="space-y-6">
            {[['First Year', firstYear], ['Second Year', secondYear]].map(([year, exams]) => (
              <section key={year} className="space-y-3">
                <h2 className="text-lg font-black text-slate-900">{year}</h2>
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {exams.map(({ examType, rows }) => <SubjectTable key={examType} title={`${formatExamLabel(examType)} - Subject Pass %`} rows={rows} />)}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}
