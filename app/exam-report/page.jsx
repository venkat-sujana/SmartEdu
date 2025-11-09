//app/exam-report/page.jsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import EditExamForm from '@/app/edit-exam-form/page'
import { Toaster } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import ExamFailureTable from '@/app/components/exam-failure-table/page'



export default function ExamReportPage() {
  const [reports, setReports] = useState([])
  const [filters, setFilters] = useState({
    studentName: '',
    stream: '',
    academicYear: '',
    examType: '',
    yearOfStudy: '',
  })
  const [examType, setExamType] = useState([
    'UNIT-1',
    'UNIT-2',
    'UNIT-3',
    'UNIT-4',
    'QUARTERLY',
    'HALFYEARLY',
    'PRE-PUBLIC-1',
    'PRE-PUBLIC-2',
  ])
  const [editingExam, setEditingExam] = useState(null)
  const { data: session } = useSession()
  const [collegeId, setCollegeId] = useState('')
  const [collegeName, setCollegeName] = useState('')

  const [generalColumns, setGeneralColumns] = useState([
    'Telugu/Sanskrit',
    'English',
    'Maths/Botany/Civics',
    'Maths/Zoology/History',
    'Physics/Economics',
    'Chemistry/Commerce',
  ])

  const [vocationalColumns, setVocationalColumns] = useState([
    'GFC',
    'English',
    'V1/V4',
    'V2/V5',
    'V3/V6',
  ])

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId)
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName)
  }, [session])

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/exams')
      let data = {}
      try {
        const text = await res.text()
        data = text ? JSON.parse(text) : {}
      } catch (e) {
        data = {}
      }
      if (data.success) {
        setReports(data.data)
      }
    } catch (err) {
      console.error('Error loading reports:', err)
    }
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students')
        await res.json()
      } catch (err) {
        console.error('Error loading students:', err)
      }
    }
    fetchReports()
    fetchStudents()
  }, [])

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this report?')) return
    try {
      const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setReports(prev => prev.filter(r => r._id !== id))
      } else {
        alert('Failed to delete report.')
      }
    } catch (err) {
      alert('Error deleting report.')
      console.error(err)
    }
  }

  const filteredReports = reports.filter(report => {
    const studentNameMatch = filters.studentName
      ? report.student?.name?.toLowerCase().includes(filters.studentName.toLowerCase())
      : true
    const streamMatch = filters.stream ? report.stream === filters.stream : true
    const yearMatch = filters.academicYear ? report.academicYear === filters.academicYear : true
    const examMatch = filters.examType ? report.examType === filters.examType : true
    const yearOfStudyMatch = filters.yearOfStudy ? report.yearOfStudy === filters.yearOfStudy : true
    return studentNameMatch && streamMatch && yearMatch && examMatch && yearOfStudyMatch
  })

  // Group by Exam Type then by Year
  function groupByExamAndYear(reports) {
    const out = {}
    reports.forEach(item => {
      const exam = item.examType || 'N/A'
      const year = item.yearOfStudy || 'N/A'
      if (!out[exam]) out[exam] = {}
      if (!out[exam][year]) out[exam][year] = []
      out[exam][year].push(item)
    })
    return out
  }

  const examYearReports = groupByExamAndYear(filteredReports)

  // Calculate Pass/Fail stats
  const { passCount, failCount, passPercentage } = (() => {
    let pass = 0,
      fail = 0
    for (const report of filteredReports) {
      const subjectMarks = report.generalSubjects || report.vocationalSubjects || {}
      let isFail = false
      for (const mark of Object.values(subjectMarks)) {
        const markStr = String(mark).toUpperCase()
        if (markStr === 'A' || markStr === 'AB' || Number(mark) === 0) {
          isFail = true
          break
        }
        const numericMark = Number(mark)
        if (!isNaN(numericMark)) {
          if (
            ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(report.examType) &&
            numericMark < 9
          ) {
            isFail = true
            break
          }
          if (['QUARTERLY', 'HALFYEARLY'].includes(report.examType) && numericMark < 18) {
            isFail = true
            break
          }
          if (['PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(report.examType) && numericMark < 35) {
            isFail = true
            break
          }
        }
      }
      if (isFail) fail++
      else pass++
    }
    const total = pass + fail
    const percentage = total > 0 ? ((pass / total) * 100).toFixed(2) : '0.00'
    return { passCount: pass, failCount: fail, passPercentage: percentage }
  })()





  return (
    <div className="mt-24 mx-auto min-h-screen w-full max-w-7xl bg-gradient-to-br from-blue-50 via-white to-green-50 p-1 font-sans sm:p-4">
      <Toaster />

      {/* College Header */}
      <div className="mb-6 flex items-center justify-center rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-100 to-green-100 px-6 py-4 text-xl font-bold text-blue-800 shadow-lg">
        <span className="mr-3 text-2xl">🏫</span>
        <span>{collegeName || 'Loading...'}</span>
      </div>

      {/* Main Title */}
      <h1 className="mb-6 text-center text-xl font-extrabold tracking-tight text-blue-900 sm:text-2xl md:text-4xl">
        📊 Exam Summary Dashboard
      </h1>

      {/* Summary Stats Cards */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-4">
        <div className="min-w-[80px] rounded-xl border-2 border-green-200 bg-green-50 px-3 py-2 text-center shadow-lg sm:min-w-[120px] sm:px-8 sm:py-5">
          <div className="mb-1 text-lg sm:text-3xl">✅</div>
          <div className="text-lg font-bold text-green-700 sm:text-2xl">{passCount}</div>
          <div className="text-xs font-semibold text-green-800 sm:text-sm">Passed</div>
        </div>
        <div className="min-w-[80px] rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-center shadow-lg sm:min-w-[120px] sm:px-8 sm:py-5">
          <div className="mb-1 text-lg sm:text-3xl">❌</div>
          <div className="text-lg font-bold text-red-700 sm:text-2xl">{failCount}</div>
          <div className="text-xs font-semibold text-red-800 sm:text-sm">Failed</div>
        </div>
        <div className="min-w-[80px] rounded-xl border-2 border-blue-200 bg-blue-50 px-3 py-2 text-center shadow-lg sm:min-w-[120px] sm:px-8 sm:py-5">
          <div className="mb-1 text-lg sm:text-3xl">📈</div>
          <div className="text-lg font-bold text-blue-700 sm:text-2xl">{passPercentage}%</div>
          <div className="text-xs font-semibold text-blue-800 sm:text-sm">Pass Rate</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap justify-center gap-2 sm:gap-4">
        <Link href="/student-table">
          <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-cyan-700 sm:px-6 sm:py-3 sm:text-base">
            👥 Student Table
          </button>
        </Link>
        <Link href="/exams-form">
          <button className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-cyan-700 sm:px-6 sm:py-3 sm:text-base">
            📝 Exam Form
          </button>
        </Link>
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-cyan-700 sm:px-6 sm:py-3 sm:text-base"
        >
          🖨️ Print Report
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search Student Name"
          value={filters.studentName}
          onChange={e => setFilters({ ...filters, studentName: e.target.value })}
          className="rounded-xl border-2 border-blue-400 px-2 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 sm:px-4 sm:py-3 sm:text-base"
        />
        <select
          value={filters.stream}
          onChange={e => setFilters({ ...filters, stream: e.target.value })}
          className="rounded-xl border-2 border-blue-400 px-2 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 sm:px-4 sm:py-3 sm:text-base"
        >
          <option value="">All Streams</option>
          {['MPC', 'BIPC', 'CEC', 'HEC', 'M&AT', 'CET', 'MLT'].map(stream => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
        <select
          value={filters.academicYear}
          onChange={e => setFilters({ ...filters, academicYear: e.target.value })}
          className="rounded-xl border-2 border-blue-400 px-2 py-2 text-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 sm:px-4 sm:py-3 sm:text-base"
        >
          <option value="">All Academic Years</option>
          <option value="2025-1">First Year</option>
          <option value="2025-2">Second Year</option>
        </select>
        <select
          value={filters.examType}
          onChange={e => setFilters({ ...filters, examType: e.target.value })}
          className="rounded-xl border-2 border-blue-400 bg-white px-4 py-3 text-base transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">All Exam Types</option>
          {examType.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Grouped Tables by Exam Type and Year */}
      <div className="min-h-screen bg-gray-50 px-2 py-4 sm:px-6" id="print-section">
        {Object.keys(examYearReports).length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <div className="text-xl text-gray-500">No exam reports found</div>
          </div>
        ) : (
          Object.entries(examYearReports).map(([exam, years]) => (
            <section key={exam} className="mb-12">
              {/* Exam Type Header */}
              <div className="mb-6 flex flex-col items-center gap-3 text-2xl font-bold text-indigo-700 sm:flex-row sm:justify-center">
                <span className="inline-block rounded-2xl bg-gradient-to-r from-indigo-100 to-blue-100 px-4 py-2 text-center text-indigo-700 shadow-lg sm:px-6 sm:py-3">
                  📚 {exam}
                </span>
              </div>

              {/* Year-wise grid -- adjust on md screens */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {Object.entries(years).map(([year, rows]) => (
                  <div
                    key={year}
                    className="rounded-3xl border-2 border-blue-100 bg-white p-4 shadow-xl sm:p-6"
                  >
                    <h4 className="mb-4 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 py-2 text-center text-lg font-bold text-blue-800 sm:text-xl">
                      🎓 {year}
                    </h4>
                    {/* Place overflow-x-auto DIV here */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[360px] border-collapse text-xs sm:min-w-[400px] sm:text-sm">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 text-blue-900">
                            <th className="border px-2 py-2 sm:py-3">S.No</th>
                            <th className="border px-3 py-2 text-left sm:py-3">Name</th>
                            {(rows[0]?.stream && ['M&AT', 'CET', 'MLT'].includes(rows[0].stream)
                              ? vocationalColumns
                              : generalColumns
                            ).map((col, i) => (
                              <th
                                key={i}
                                className="border px-2 py-2 text-center text-[11px] sm:py-3 sm:text-xs"
                              >
                                {col}
                              </th>
                            ))}
                            <th className="border px-2 py-2">Total</th>
                            <th className="border px-2 py-2">%</th>
                            <th className="border px-2 py-2">Status</th>
                            <th className="border px-2 py-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-8 text-center text-gray-400 italic">
                                No records for {year} in {exam}
                              </td>
                            </tr>
                          ) : (
                            rows.map((report, idx) => {
                              const subjectMarks =
                                report.generalSubjects || report.vocationalSubjects || {}
                              const isVocational = ['M&AT', 'CET', 'MLT'].includes(report.stream)
                              const columnsToRender = isVocational
                                ? vocationalColumns
                                : generalColumns

                              let isFail = false
                              for (const mark of Object.values(subjectMarks)) {
                                const markStr = String(mark).toUpperCase()
                                if (markStr === 'A' || markStr === 'AB' || Number(mark) === 0) {
                                  isFail = true
                                  break
                                }
                                const numericMark = Number(mark)
                                if (!isNaN(numericMark)) {
                                  if (
                                    ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(
                                      report.examType
                                    ) &&
                                    numericMark < 9
                                  ) {
                                    isFail = true
                                    break
                                  }
                                  if (
                                    ['QUARTERLY', 'HALFYEARLY'].includes(report.examType) &&
                                    numericMark < 18
                                  ) {
                                    isFail = true
                                    break
                                  }
                                  if (
                                    ['PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(report.examType) &&
                                    numericMark < 35
                                  ) {
                                    isFail = true
                                    break
                                  }
                                }
                              }

                              const total = Object.values(subjectMarks).reduce((sum, val) => {
                                if (val === 'A' || val === 'AB') return sum
                                return sum + Number(val || 0)
                              }, 0)

                              const subjectCount = columnsToRender.length
                              let maxMarksPerSubject = 100
                              if (
                                ['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(report.examType)
                              ) {
                                maxMarksPerSubject = 25
                              } else if (['QUARTERLY', 'HALFYEARLY'].includes(report.examType)) {
                                maxMarksPerSubject = 50
                              }

                              const percentage =
                                subjectCount > 0
                                  ? ((total / (subjectCount * maxMarksPerSubject)) * 100).toFixed(2)
                                  : '0.00'

                              const status = isFail ? 'Fail' : 'Pass'
                              const rowClass = status === 'Fail' ? 'bg-red-50' : 'bg-green-50'

                              return (
                                <tr
                                  key={idx}
                                  className={`text-center ${rowClass} border-b transition hover:bg-yellow-50`}
                                >
                                  <td className="border px-2 py-1 font-medium">{idx + 1}</td>
                                  <td className="border px-3 py-1 text-left font-medium">
                                    {report.student?.name || 'N/A'}
                                  </td>
                                  {columnsToRender.map((subject, i) => (
                                    <td key={i} className="border px-2 py-1 text-xs">
                                      {subjectMarks[subject] != undefined &&
                                      subjectMarks[subject] != null
                                        ? subjectMarks[subject]
                                        : '-'}
                                    </td>
                                  ))}
                                  <td className="border px-2 py-1 font-bold">{total}</td>
                                  <td className="border px-2 py-1 font-bold">{percentage}</td>
                                  <td className="border px-2 py-1">
                                    <span
                                      className={`inline-block rounded-full px-2 py-1 text-xs font-bold ${
                                        status === 'Fail'
                                          ? 'bg-red-200 text-red-800'
                                          : 'bg-green-200 text-green-800'
                                      }`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                  <td className="space-x-1 border px-2 py-1">
                                    <button
                                      onClick={() => setEditingExam(report)}
                                      className="rounded bg-indigo-600 px-2 py-1 text-xs text-white transition hover:bg-indigo-700"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDelete(report._id)}
                                      className="rounded bg-rose-600 px-2 py-1 text-xs text-white transition hover:bg-rose-700"
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Edit Form Modal */}
      {editingExam && (
        <EditExamForm
          key={editingExam._id}
          examData={editingExam}
          onClose={() => setEditingExam(null)}
          onUpdated={fetchReports}
        />
      )}

      {/* Failure Summary */}
      <div className="mt-12">
        <ExamFailureTable reports={filteredReports} />
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section,
          #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
