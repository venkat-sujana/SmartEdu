
//app/components/category-summary/CategorySummary.jsx
'use client'
import React from 'react'

// props:
// reports: exam/year/filters ఆధారంగా వచ్చిన reports (rows లేదా filteredReports)
// title: card పై title
export default function CategorySummary({ reports = [], title = 'Category Summary' }) {
  if (!reports.length) return null

  // ఒక report నుంచి overall % తీసుకోవడం కోసం helper
  const getPercentageForReport = report => {
    const subjectMarks = report.generalSubjects || report.vocationalSubjects || {}
    const isVocational = ['M&AT', 'CET', 'MLT'].includes(report.stream || '')

    const marksArr = Object.values(subjectMarks)

    // A/AB ఉన్నవారు overall % కోసం కూడా skip చేద్దాం అనుకుంటే:
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
    return percentage
  }

  const getCategory = p => {
    const per = Number(p) || 0
    if (per >= 75) return 'A'
    if (per >= 60) return 'B'
    return 'C'
  }

  let aCount = 0
  let bCount = 0
  let cCount = 0
  let totalCount = 0

  reports.forEach(report => {
    const per = getPercentageForReport(report)
    if (per === null) return // absent లేదా invalid అయితే skip

    const cat = getCategory(per)
    totalCount++
    if (cat === 'A') aCount++
    else if (cat === 'B') bCount++
    else cCount++
  })

  if (totalCount === 0) return null

  const aPer = ((aCount / totalCount) * 100).toFixed(2)
  const bPer = ((bCount / totalCount) * 100).toFixed(2)
  const cPer = ((cCount / totalCount) * 100).toFixed(2)

  return (
    <div className="mt-6 rounded-3xl border-2 border-purple-200 bg-purple-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-center text-lg font-bold text-purple-800 sm:text-xl">
        🎯 {title}
      </h3>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        <div className="min-w-[100px] rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-center shadow">
          <div className="text-sm font-semibold text-emerald-700">A (≥ 75%)</div>
          <div className="text-xl font-extrabold text-emerald-800">
            {aCount}
          </div>
          <div className="text-xs text-emerald-600">{aPer}%</div>
        </div>

        <div className="min-w-[100px] rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-center shadow">
          <div className="text-sm font-semibold text-blue-700">B (60–74%)</div>
          <div className="text-xl font-extrabold text-blue-800">
            {bCount}
          </div>
          <div className="text-xs text-blue-600">{bPer}%</div>
        </div>

        <div className="min-w-[100px] rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center shadow">
          <div className="text-sm font-semibold text-amber-700">C (&lt; 60%)</div>
          <div className="text-xl font-extrabold text-amber-800">
            {cCount}
          </div>
          <div className="text-xs text-amber-600">{cPer}%</div>
        </div>

        <div className="min-w-[100px] rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center shadow">
          <div className="text-sm font-semibold text-slate-700">Total</div>
          <div className="text-xl font-extrabold text-slate-800">
            {totalCount}
          </div>
        </div>
      </div>
    </div>
  )
}
