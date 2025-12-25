//app/components/subject-toppers-table/SubjectToppersTable.jsx
'use client'
import React from 'react'

export default function SubjectToppersTable({ reports = [], columns = [], title = 'Subject-wise Toppers' }) {
  if (!reports.length || !columns.length) return null

  const isVocationalStream = stream =>
    ['M&AT', 'CET', 'MLT'].includes(stream || '')

  const examType = reports[0]?.examType || ''

  const getToppersForSubject = subject => {
    let bestMarks = -1
    let toppers = []

    reports.forEach(report => {
      const subjectMarks = report.generalSubjects || report.vocationalSubjects || {}
      const raw = subjectMarks[subject]

      if (raw === undefined || raw === null || raw === '') return
      const vStr = String(raw).toUpperCase()
      if (vStr === 'A' || vStr === 'AB') return

      const mark = Number(raw)
      if (isNaN(mark)) return

      const isVoc = isVocationalStream(report.stream)
      let isPass = true

      if (['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(examType)) {
        if (mark < 9) isPass = false
      } else if (['QUARTERLY', 'HALFYEARLY'].includes(examType)) {
        if (mark < 18) isPass = false
      } else if (['PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(examType)) {
        if (isVoc) {
          if (mark < 18) isPass = false
        } else {
          if (mark < 35) isPass = false
        }
      }

      if (!isPass) return

      const studentName = report.student?.name || 'N/A'
      const hallTicket = report.student?.hallTicket || report.student?.htno || '—'

      if (mark > bestMarks) {
        bestMarks = mark
        toppers = [{ name: studentName, hallTicket, marks: mark }]
      } else if (mark === bestMarks) {
        toppers.push({ name: studentName, hallTicket, marks: mark })
      }
    })

    return toppers
  }

  return (
    <div className="mt-6 rounded-3xl border-2 border-emerald-200 bg-emerald-50 p-4 shadow-lg sm:p-6">
      <h3 className="mb-4 text-center text-lg font-bold text-emerald-800 sm:text-xl">
        🏅 {title}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[360px] border-collapse text-xs sm:min-w-[400px] sm:text-sm">
          <thead>
            <tr className="bg-emerald-200 text-emerald-900">
              <th className="border px-2 py-2 sm:py-3">Subject</th>
              <th className="border px-2 py-2 sm:py-3">Topper Name(s)</th>
              <th className="border px-2 py-2 sm:py-3">Marks</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((subject, idx) => {
              const toppers = getToppersForSubject(subject)

              if (!toppers || toppers.length === 0) {
                return (
                  <tr key={idx} className="bg-white">
                    <td className="border px-2 py-2 font-semibold">{subject}</td>
                    <td className="border px-2 py-2 italic text-gray-400" colSpan={3}>
                      No toppers (no passes / only absent)
                    </td>
                  </tr>
                )
              }

              const names = toppers.map(t => t.name).join(', ')
              
              const marks = toppers[0].marks

              return (
                <tr key={idx} className="bg-white">
                  <td className="border px-2 py-2 font-semibold">{subject}</td>
                  <td className="border px-2 py-2">{names}</td>
                  
                  <td className="border px-2 py-2 text-center font-bold">{marks}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
