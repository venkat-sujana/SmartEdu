// This is a client-side rendered component for entering exam marks, supporting both single and bulk entry modes. --- IGNORE ---
//src/components/exams/ExamsForm.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  FileCheck2,
  CalendarClock,
  ClipboardSignature,
  Users2,
  BookKey,
  FilePenLine,
  School,
  Rows3,
} from 'lucide-react'
import Link from 'next/link'

const generalStreams = ['MPC', 'BIPC', 'CEC', 'HEC']
const vocationalStreams = ['M&AT', 'CET', 'MLT']

function normalizeGroup(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

const examTypes = [
  'UNIT-1',
  'UNIT-2',
  'UNIT-3',
  'UNIT-4',
  'QUARTERLY',
  'HALFYEARLY',
  'PRE-PUBLIC-1',
  'PRE-PUBLIC-2',
]

const modernInputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'

function SectionHeader({ icon: Icon, iconClassName, title, description }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <div className={['rounded-2xl p-2.5 shadow-sm', iconClassName].join(' ')}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function FieldLabel({ icon: Icon, iconClassName, children }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className={['rounded-xl p-2 shadow-sm', iconClassName].join(' ')}>
        <Icon className="h-4 w-4 text-white" />
      </span>
      <span>{children}</span>
    </label>
  )
}

function getSelectedYear(academicYear) {
  if (!academicYear) return ''
  return academicYear.endsWith('-1') ? 'First Year' : 'Second Year'
}

function getExamMaxMarks(examType) {
  if (['UNIT-1', 'UNIT-2', 'UNIT-3', 'UNIT-4'].includes(examType)) return 25
  if (['QUARTERLY', 'HALFYEARLY', 'PRE-PUBLIC-1', 'PRE-PUBLIC-2'].includes(examType)) return 50
  return 100
}

function getSubjectDisplayValue(value) {
  if (value === 0 || value === '0') return '0'
  return value || ''
}

export default function ExamsForm({
  collegeName,
  students,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  onBulkSubmit,
  dashboardReturnUrl = '/dashboards',
}) {
  const [entryMode, setEntryMode] = useState('single')
  const [bulkMarks, setBulkMarks] = useState({})
  const currentYear = new Date().getFullYear()
  const academicYearOptions = [
    { value: `${currentYear}-1`, label: `First Year (${currentYear})` },
    { value: `${currentYear}-2`, label: `Second Year (${currentYear})` },
  ]

  const filteredStudents = formData.stream
    ? students.filter(student => {
        const sameGroup = normalizeGroup(student.group) === normalizeGroup(formData.stream)

        if (!formData.academicYear) return sameGroup

        const selectedYear = getSelectedYear(formData.academicYear)
        return sameGroup && student.yearOfStudy?.toLowerCase() === selectedYear.toLowerCase()
      })
    : []

  const subjectsToRender = useMemo(() => {
    if (!formData.stream) return []
    if (generalStreams.includes(formData.stream)) {
      return [
        'Telugu/Sanskrit/Hindi',
        'English',
        'Maths/Botany/Civics',
        'Maths/Zoology/History',
        'Physics/Economics',
        'Chemistry/Commerce',
      ]
    }
    if (vocationalStreams.includes(formData.stream)) {
      return ['GFC', 'English', 'V1/V4', 'V2/V5', 'V3/V6']
    }
    return []
  }, [formData.stream])

  useEffect(() => {
    setBulkMarks({})
  }, [formData.stream, formData.academicYear, formData.examType, formData.examDate])

  const bulkStudentCount = filteredStudents.length

  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'studentId') {
      const selectedStudent = students.find(student => student._id === value)
      setFormData(prev => ({
        ...prev,
        studentId: value,
        yearOfStudy: selectedStudent?.yearOfStudy || '',
      }))
      return
    }

    if (name.startsWith('subject_')) {
      const subjectKey = name.replace('subject_', '')
      const subjectValue = value.toUpperCase().trim()

      setFormData(prev => {
        const updatedSubjects = {
          ...prev.subjects,
          [subjectKey]:
            subjectValue === 'A' || subjectValue === 'AB'
              ? subjectValue
              : isNaN(Number(subjectValue))
                ? ''
                : Number(subjectValue),
        }

        const subjectMarks = Object.values(updatedSubjects)
        const validMarks = subjectMarks.filter(mark => typeof mark === 'number' && !isNaN(mark))
        const totalMarks = validMarks.reduce((sum, mark) => sum + mark, 0)
        const percent =
          validMarks.length > 0 ? parseFloat((totalMarks / validMarks.length).toFixed(2)) : 0

        return {
          ...prev,
          subjects: updatedSubjects,
          total: totalMarks,
          percentage: percent,
        }
      })
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'stream' || name === 'academicYear' ? { studentId: '', yearOfStudy: '', subjects: {} } : {}),
    }))
  }

  const handleBulkMarkChange = (studentId, subject, value) => {
    const subjectValue = value.toUpperCase().trim()

    setBulkMarks(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subject]:
          subjectValue === 'A' || subjectValue === 'AB'
            ? subjectValue
            : isNaN(Number(subjectValue))
              ? ''
              : Number(subjectValue),
      },
    }))
  }

  const getBulkRowSummary = studentId => {
    const row = bulkMarks[studentId] || {}
    const marks = Object.values(row).filter(value => typeof value === 'number' && !isNaN(value))
    const total = marks.reduce((sum, mark) => sum + mark, 0)
    const maxMarksPerSubject = getExamMaxMarks(formData.examType)
    const maxTotal = marks.length * maxMarksPerSubject
    const percentage = maxTotal > 0 ? parseFloat(((total / maxTotal) * 100).toFixed(2)) : 0
    return { total, percentage }
  }

  const handleBulkSubmit = event => {
    event.preventDefault()
    onBulkSubmit({
      bulkMarks,
      students: filteredStudents,
      subjectsToRender,
      yearOfStudy: getSelectedYear(formData.academicYear),
    })
  }

  const canShowBulkTable =
    entryMode === 'bulk' &&
    formData.stream &&
    formData.academicYear &&
    formData.examType &&
    formData.examDate &&
    subjectsToRender.length > 0

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)] p-4 sm:p-6 lg:p-8">
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/95 px-6 py-5 text-lg font-bold text-blue-700 shadow-2xl">
            <FileCheck2 className="h-7 w-7 animate-spin" />
            Saving Exam Data...
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[28px] border border-white/70 bg-white/90 p-3 shadow-xl ring-1 ring-slate-200/60 backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-3xl bg-linear-to-br from-cyan-500 to-blue-600 p-3 shadow-lg">
                <School className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold tracking-[0.22em] text-slate-500 uppercase">
                  Examination Module
                </p>
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">
                  Subjectwise Marks Entry
                </h1>
                <p className="mt-3 text-sm font-semibold text-cyan-700">{collegeName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-white/70 bg-white/92 p-6 shadow-2xl ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-5">
            <Link
              href={dashboardReturnUrl}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <Link
              href="/exam-report"
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-sm font-semibold text-cyan-700 shadow-sm transition hover:bg-cyan-100"
            >
              <ClipboardSignature className="h-4 w-4" />
              Exam Report
            </Link>
            <Link
              href={`/exams-form?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100"
            >
              <FilePenLine className="h-4 w-4" />
              New Entry
            </Link>
            <Link
              href={`/register?returnUrl=${encodeURIComponent(dashboardReturnUrl)}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            >
              <FilePenLine className="h-4 w-4" />
              Add Student
            </Link>
          </div>

          <div className="mb-6 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
            <SectionHeader
              icon={Rows3}
              iconClassName="bg-gradient-to-r from-slate-700 to-slate-900"
              title="Entry Mode"
              description="Single student entry లో ఒక్కసారికి ఒక స్టూడెంట్ కి మాత్రమే మార్క్స్ ఎంటర్ చేస్తారు . Bulk entry తో ఒకే సారి మొత్తం year marks enter చేయవచ్చు."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  key: 'single',
                  title: 'Single Entry',
                  note: 'Existing workflow',
                },
                {
                  key: 'bulk',
                  title: 'Bulk Entry',
                  note: 'Whole class at once',
                },
              ].map(mode => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setEntryMode(mode.key)}
                  className={[
                    'rounded-2xl border px-4 py-4 text-left transition',
                    entryMode === mode.key
                      ? 'border-cyan-300 bg-cyan-50 shadow-sm ring-2 ring-cyan-100'
                      : 'border-slate-200 bg-white hover:border-slate-300',
                  ].join(' ')}
                >
                  <div className="text-sm font-bold text-slate-900">{mode.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{mode.note}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={entryMode === 'bulk' ? handleBulkSubmit : onSubmit} className="space-y-6">
            <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel
                    icon={BookKey}
                    iconClassName="bg-gradient-to-r from-cyan-500 to-blue-500"
                  >
                    Group / Stream
                  </FieldLabel>
                  <select
                    name="stream"
                    value={formData.stream}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Group</option>
                    {[...generalStreams, ...vocationalStreams].map(stream => (
                      <option key={stream} value={stream}>
                        {stream}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel
                    icon={BookKey}
                    iconClassName="bg-gradient-to-r from-violet-500 to-purple-500"
                  >
                    Academic Year
                  </FieldLabel>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Academic Year</option>
                    {academicYearOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel
                    icon={BookKey}
                    iconClassName="bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    Exam Type
                  </FieldLabel>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    className={modernInputClass}
                  >
                    <option value="">Select Exam Type</option>
                    {examTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel
                    icon={CalendarClock}
                    iconClassName="bg-gradient-to-r from-orange-500 to-rose-500"
                  >
                    Exam Date
                  </FieldLabel>
                  <input
                    type="date"
                    name="examDate"
                    value={formData.examDate}
                    onChange={handleChange}
                    className={modernInputClass}
                  />
                </div>
              </div>
            </section>

            {entryMode === 'single' ? (
              <>
                <section className="rounded-[26px] border border-slate-200 bg-white p-5 md:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <FieldLabel
                        icon={Users2}
                        iconClassName="bg-gradient-to-r from-lime-500 to-emerald-500"
                      >
                        Students
                      </FieldLabel>
                      <select
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleChange}
                        className={modernInputClass}
                        disabled={!formData.stream}
                      >
                        <option value="">
                          {formData.stream ? 'Select Student' : 'Select Stream First'}
                        </option>
                        {filteredStudents.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 shadow-sm">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-cyan-700 uppercase">
                        Year of Study
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formData.yearOfStudy || 'Not selected yet'}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5 md:p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {subjectsToRender.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500 md:col-span-2">
                        Select stream and exam context to load subject fields.
                      </div>
                    ) : (
                      subjectsToRender.map(subject => (
                        <div key={subject}>
                          <FieldLabel
                            icon={FilePenLine}
                            iconClassName="bg-gradient-to-r from-blue-500 to-indigo-500"
                          >
                            {subject}
                          </FieldLabel>
                          <input
                            type="text"
                            name={`subject_${subject}`}
                            placeholder={`Enter ${subject} marks`}
                            value={getSubjectDisplayValue(formData.subjects[subject])}
                            onChange={handleChange}
                            className={modernInputClass}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </>
            ) : (
              <section className="rounded-[26px] border border-slate-200 bg-white p-4 md:p-6">
                <SectionHeader
                  icon={Users2}
                  iconClassName="bg-gradient-to-r from-emerald-500 to-teal-600"
                  title="Bulk Marks Entry"
                  description="S.No, name, subject-wise small boxes తో ఒక్కసారి class మొత్తం marks enter చేయండి."
                />

                {!canShowBulkTable ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Bulk entry table కనిపించాలంటే ముందు `Group`, `Academic Year`, `Exam Type`, `Exam Date` select చేయండి.
                  </div>
                ) : bulkStudentCount === 0 ? (
                  <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-8 text-center text-sm text-amber-700">
                    ఈ selection కి students కనిపించలేదు.
                  </div>
                ) : (
                  <>
                    <div className="mb-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Selected Year
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                          {getSelectedYear(formData.academicYear)}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Students
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                          {bulkStudentCount}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Subjects
                        </div>
                        <div className="mt-1 text-sm font-bold text-slate-900">
                          {subjectsToRender.length}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-xs text-cyan-800 md:hidden">
                      Student card open చేసి subject boxes లో marks enter చేయండి. Desktop/tablet లో full table కనిపిస్తుంది.
                    </div>

                    <div className="space-y-3 md:hidden">
                      {filteredStudents.map((student, index) => {
                        const summary = getBulkRowSummary(student._id)

                        return (
                          <div
                            key={student._id}
                            className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm"
                          >
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                  S.No {index + 1}
                                </div>
                                <div className="truncate text-sm font-bold text-slate-900">
                                  {student.name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {student.admissionNo || student.yearOfStudy || '-'}
                                </div>
                              </div>
                              <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                  Total
                                </div>
                                <div className="text-sm font-bold text-slate-900">{summary.total}</div>
                                <div className="text-xs font-semibold text-cyan-700">
                                  {summary.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {subjectsToRender.map(subject => (
                                <label
                                  key={`${student._id}-${subject}`}
                                  className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm"
                                >
                                  <span className="mb-1.5 line-clamp-2 block min-h-8 text-[11px] font-semibold leading-4 text-slate-600">
                                    {subject}
                                  </span>
                                  <input
                                    type="text"
                                    value={getSubjectDisplayValue(bulkMarks[student._id]?.[subject])}
                                    onChange={event =>
                                      handleBulkMarkChange(student._id, subject, event.target.value)
                                    }
                                    placeholder="--"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-center text-sm font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="-mx-4 hidden overflow-x-auto px-4 md:block">
                      <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                        <thead>
                          <tr className="text-left text-slate-600">
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">S.No</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">Name</th>
                            {subjectsToRender.map(subject => (
                              <th key={subject} className="min-w-[110px] px-2 py-2 font-semibold">
                                {subject}
                              </th>
                            ))}
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">Total</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student, index) => {
                            const summary = getBulkRowSummary(student._id)

                            return (
                              <tr key={student._id} className="rounded-2xl bg-slate-50/90 shadow-sm">
                                <td className="whitespace-nowrap rounded-l-2xl px-2 py-3 font-medium text-slate-700">
                                  {index + 1}
                                </td>
                                <td className="whitespace-nowrap px-2 py-3">
                                  <div className="font-medium text-slate-900">{student.name}</div>
                                  <div className="text-xs text-slate-500">
                                    {student.admissionNo || student.yearOfStudy || '-'}
                                  </div>
                                </td>
                                {subjectsToRender.map(subject => (
                                  <td key={`${student._id}-${subject}`} className="px-2 py-3">
                                    <input
                                      type="text"
                                      value={getSubjectDisplayValue(bulkMarks[student._id]?.[subject])}
                                      onChange={event =>
                                        handleBulkMarkChange(student._id, subject, event.target.value)
                                      }
                                      placeholder="--"
                                      className="w-20 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-center text-xs font-semibold text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                                    />
                                  </td>
                                ))}
                                <td className="whitespace-nowrap px-2 py-3 font-semibold text-slate-800">
                                  {summary.total}
                                </td>
                                <td className="whitespace-nowrap rounded-r-2xl px-2 py-3 font-semibold text-cyan-700">
                                  {summary.percentage.toFixed(1)}%
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-cyan-600 via-blue-600 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl transition hover:from-cyan-700 hover:via-blue-700 hover:to-emerald-700 hover:shadow-2xl active:scale-[0.99] disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
              >
                <FileCheck2 className="h-5 w-5" />
                {isSubmitting
                  ? 'Saving...'
                  : entryMode === 'bulk'
                    ? 'Save All Students Marks'
                    : 'Save Exam Marks'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
