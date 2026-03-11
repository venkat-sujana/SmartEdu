//app/components/category-students/YearGroupCategoryStudentsList.jsx
'use client'
import React, { useMemo } from 'react'

export default function YearGroupCategoryStudentsList({
  reports = [],
  title = 'Year & Group-wise Category Students',
}) {
  const data = useMemo(() => {
    if (!reports.length) return {}

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

    const out = {}

    reports.forEach(report => {
      const per = getPercentageForReport(report)
      if (per === null) return

      const year = report.yearOfStudy || report.academicYear || 'Year-NA'
      const stream = report.stream || 'UNKNOWN'
      const cat = getCategory(per)

      const studentName = report.student?.name || 'N/A'
      const hallTicket = report.student?.hallTicket || report.student?.htno || '—'
      const examType = report.examType || ''

      if (!out[year]) out[year] = {}
      if (!out[year][stream]) out[year][stream] = { A: [], B: [], C: [] }

      out[year][stream][cat].push({
        name: studentName,
        hallTicket,
        percentage: per,
        stream,
        examType,
      })
    })

    // sort ప్రతి bucketలో percentage desc
    Object.keys(out).forEach(yearKey => {
      const streams = out[yearKey]
      Object.keys(streams).forEach(streamKey => {
        ;['A', 'B', 'C'].forEach(cat => {
          streams[streamKey][cat].sort((a, b) => b.percentage - a.percentage)
        })
      })
    })

    return out
  }, [reports])

  const yearKeys = Object.keys(data)
  if (!yearKeys.length) return null

  const renderCategoryTable = (list, catLabel) => {
    if (!list.length) return null
    return (
      <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3">
        <div className="mb-2 text-[11px] font-semibold text-slate-700 sm:text-xs">
          {catLabel} ({list.length})
        </div>
        <div className="max-h-52 overflow-y-auto">
          <table className="w-full text-[11px] sm:text-xs">
            <thead>
              <tr className="text-left text-[10px] text-gray-500 sm:text-[11px]">
                <th className="pb-1 pr-2">#</th>
                <th className="pb-1 pr-2">Name</th>
                <th className="pb-1 pr-2 text-right">% </th>
              </tr>
            </thead>
            <tbody>
              {list.map((stu, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-1 pr-2 align-top">{idx + 1}</td>
                  <td className="py-1 pr-2 align-top font-medium">{stu.name}</td>
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
    <div className="mt-6 rounded-3xl border-2 border-fuchsia-200 bg-fuchsia-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-center text-lg font-bold text-fuchsia-800 sm:text-xl">
        🧩 {title}
      </h3>

      <div className="space-y-6">
        {yearKeys.map(yearKey => {
          const streams = data[yearKey]
          const streamKeys = Object.keys(streams)

          return (
            <div key={yearKey} className="rounded-2xl border border-fuchsia-200 bg-white p-3 sm:p-4">
              <div className="mb-3 text-center text-sm font-bold text-fuchsia-700 sm:text-base">
                🎓 Year: {yearKey}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {streamKeys.map(streamKey => {
                  const groups = streams[streamKey]
                  const aList = groups.A || []
                  const bList = groups.B || []
                  const cList = groups.C || []
                  const total =
                    aList.length + bList.length + cList.length

                  if (!total) return null

                  return (
                    <div
                      key={yearKey + streamKey}
                      className=" rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                    >
                      <div className="mb-2 text-xs font-semibold text-slate-800 sm:text-sm">
                        Stream: {streamKey} ({total})
                      </div>
                    
                      {renderCategoryTable(aList, 'A Category (≥ 75%)')}
                      {renderCategoryTable(bList, 'B Category (60–74%)')}
                      {renderCategoryTable(cList, 'C Category (< 60%)')}
                      

                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
