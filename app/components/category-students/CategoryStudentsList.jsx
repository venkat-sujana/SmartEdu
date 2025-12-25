'use client'
import React, { useMemo } from 'react'

export default function CategoryStudentsList({
  reports = [],
  title = 'Category-wise Students',
}) {
  const data = useMemo(() => {
    if (!reports.length) {
      return { A: [], B: [], C: [] }
    }

    const isVocationalStream = stream =>
      ['M&AT', 'CET', 'MLT'].includes(stream || '')

    const getPercentageForReport = report => {
      const subjectMarks = report.generalSubjects || report.vocationalSubjects || {}
      const isVocational = isVocationalStream(report.stream)

      const marksArr = Object.values(subjectMarks)

      const isAbsent = marksArr.some(val => {
        const v = String(val).toUpperCase()
        return v === 'A' || v === 'AB'
      })
      if (isAbsent) return null

      const total = marksArr.reduce((sum, val) => {
        if (val === 'A' || val === 'AB') return sum
        return sum + Number(val || 0)
      }, 0)

      let maxMarksPerSubject = 100
      if (['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(report.examType)) {
        maxMarksPerSubject = 25
      } else if (['QUARTERLY', 'HALFYEARLY'].includes(report.examType)) {
        maxMarksPerSubject = 50
      } else if (['PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(report.examType)) {
        maxMarksPerSubject = isVocational ? 50 : 100
      }

      const subjectCount = Object.keys(subjectMarks).length || 0
      if (subjectCount === 0) return null

      const percentage = (total / (subjectCount * maxMarksPerSubject)) * 100
      return Number(percentage.toFixed(2))
    }

    const getCategory = p => {
      const per = Number(p) || 0
      if (per >= 75) return 'A'
      if (per >= 60) return 'B'
      return 'C'
    }

    const buckets = { A: [], B: [], C: [] }

    reports.forEach(report => {
      const per = getPercentageForReport(report)
      if (per === null) return

      const cat = getCategory(per)
      const studentName = report.student?.name || 'N/A'
      const hallTicket = report.student?.hallTicket || report.student?.htno || '—'
      const stream = report.stream || ''
      const examType = report.examType || ''

      buckets[cat].push({
        name: studentName,
        hallTicket,
        percentage: per,
        stream,
        examType,
      })
    })

    // each categoryలో percentage descendingగా sort చేయండి
    ;['A', 'B', 'C'].forEach(cat => {
      buckets[cat].sort((a, b) => b.percentage - a.percentage)
    })

    return buckets
  }, [reports])

  const hasAny =
    data.A.length > 0 || data.B.length > 0 || data.C.length > 0

  if (!hasAny) return null

  const renderCategory = (catKey, label, colorClasses) => {
    const list = data[catKey]
    if (!list.length) return null

    return (
      <div className="mb-4 rounded-2xl bg-white p-3 shadow-sm sm:p-4">
        <div className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${colorClasses.badge}`}>
          {label} ({list.length})
        </div>
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="text-left text-[11px] text-gray-500 sm:text-xs">
                <th className="pb-1 pr-2">S.No</th>
                <th className="pb-1 pr-2">Name</th>
                
                <th className="pb-1 pr-2 hidden sm:table-cell">Stream</th>
                
                <th className="pb-1 pr-2 text-right">% </th>
              </tr>
            </thead>
            <tbody>
              {list.map((stu, idx) => (
                <tr key={idx} className="border-t text-[11px] sm:text-xs">
                  <td className="py-1 pr-2 align-top">{idx + 1}</td>
                  <td className="py-1 pr-2 align-top font-medium">{stu.name}</td>
                  
                  <td className="py-1 pr-2 align-top hidden sm:table-cell">
                    {stu.stream}
                  </td>

                  <td className="py-1 pr-2 align-top text-right font-semibold">
                    {stu.percentage.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-3xl border-2 border-indigo-200 bg-indigo-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-center text-lg font-bold text-indigo-800 sm:text-xl">
        📚 {title}
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {renderCategory('A', 'A Category (≥ 75%)', {
          badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        })}
        {renderCategory('B', 'B Category (60–74%)', {
          badge: 'bg-blue-100 text-blue-800 border border-blue-300',
        })}
        {renderCategory('C', 'C Category (< 60%)', {
          badge: 'bg-amber-100 text-amber-800 border border-amber-300',
        })}
      </div>
    </div>
  )
}
