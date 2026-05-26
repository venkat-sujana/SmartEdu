//src/app/invigilation/admin/exams/page.jsx

'use client'

import { useCallback, useEffect, useState } from 'react'

import toast from 'react-hot-toast'

import { CalendarDays, ClipboardList, Plus, School } from 'lucide-react'

import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'

import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className} `}>
      {children}
    </div>
  )
}

function CardHeader({ icon, title, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',

    emerald: 'bg-emerald-100 text-emerald-600',

    violet: 'bg-violet-100 text-violet-600',

    amber: 'bg-amber-100 text-amber-600',
  }

  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-5">
      <div className={`rounded-xl p-2 ${colors[color]} `}>{icon}</div>

      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <label className="text-xs font-semibold text-slate-500">{label}</label> : null}

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-2.5 left-3 text-slate-400">{icon}</span>
        ) : null}

        <input
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none ${icon ? 'pl-9' : 'pl-3'} `}
          {...props}
        />
      </div>
    </div>
  )
}

function SubmitBtn({ children, loading }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export default function ExamsPage() {
  const [loading, setLoading] = useState(false)

  const [exams, setExams] = useState([])

  const [examForm, setExamForm] = useState({
    date: '',
    session: 'FN',
    examType: '',
    subject: '',
    hallNo: '',
  })
const loadExams =
  useCallback(async () => {

    setLoading(true)

    try {

      const res =
        await fetch(
          '/api/invigilation/exams',
          {
            cache: 'no-store',
          }
        )

      const data =
        await res.json()

      if (!res.ok) {

        throw new Error(
          data.message
        )
      }

      setExams(
        data.data || []
      )

    } catch (err) {

      toast.error(
        err.message ||
        'Failed to load exams'
      )

    } finally {

      setLoading(false)
    }

  }, [])

  useEffect(() => {

  loadExams()

}, [loadExams])


const onCreateExam =
  async (e) => {

    e.preventDefault()

    setLoading(true)

    try {

      const res =
        await fetch(
          '/api/invigilation/exams',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              examForm
            ),
          }
        )

      const data =
        await res.json()

      if (!res.ok) {

        throw new Error(
          data.message
        )
      }

      toast.success(
        'Exam created'
      )

      setExamForm({
        date: '',
        session: 'FN',
        examType: '',
        subject: '',
        hallNo: '',
      })

      loadExams()

    } catch (err) {

      toast.error(
        err.message ||
        'Failed to create exam'
      )

    } finally {

      setLoading(false)
    }
  }
  


  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Exam Schedule">
          <div className="p-6">
            <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
              <Card>
                <CardHeader
                  icon={<ClipboardList size={16} />}
                  title="Create Exam"
                  subtitle="
                    Create exam schedule
                  "
                  color="blue"
                />

                <form onSubmit={onCreateExam} className="space-y-3 p-5">
                  <FormInput
                    label="Exam Date"
                    type="date"
                    required
                    value={examForm.date}
                    onChange={e =>
                      setExamForm(s => ({
                        ...s,
                        date: e.target.value,
                      }))
                    }
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">Session</label>

                    <select
                      value={examForm.session}
                      onChange={e =>
                        setExamForm(s => ({
                          ...s,
                          session: e.target.value,
                        }))
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                    >
                      <option value="FN">FN</option>

                      <option value="AN">AN</option>

                      <option value="EN">EN</option>
                    </select>
                  </div>

                  <FormInput
                    label="Exam Type"
                    placeholder="
                      e.g. UNIT-1
                    "
                    required
                    value={examForm.examType}
                    onChange={e =>
                      setExamForm(s => ({
                        ...s,
                        examType: e.target.value,
                      }))
                    }
                  />

                  <FormInput
                    label="Subject"
                    placeholder="
                      Subject name
                    "
                    required
                    value={examForm.subject}
                    onChange={e =>
                      setExamForm(s => ({
                        ...s,
                        subject: e.target.value,
                      }))
                    }
                  />

                  <FormInput
                    label="Hall Number"
                    placeholder="
                      e.g. A-101
                    "
                    required
                    value={examForm.hallNo}
                    onChange={e =>
                      setExamForm(s => ({
                        ...s,
                        hallNo: e.target.value,
                      }))
                    }
                  />

                  <SubmitBtn loading={loading}>
                    <Plus size={15} />
                    Create Exam
                  </SubmitBtn>
                </form>
              </Card>

              <Card>
                <CardHeader
                  icon={<CalendarDays size={16} />}
                  title="Exam Schedule"
                  subtitle="
                    Upcoming exams
                  "
                  color="emerald"
                />

                <div className="p-5">
                  <div className="rounded-xl border border-dashed p-10 text-center text-sm text-slate-500">
                    No exams loaded
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
