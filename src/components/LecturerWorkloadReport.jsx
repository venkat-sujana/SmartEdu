// app/components/LecturerWorkloadReport.jsx
import { CheckCircle2, AlertCircle, BookOpen, User, FlaskConical } from 'lucide-react'
import React from 'react'

const MIN_PERIODS = 12
const MAX_PERIODS = 24

// ── Mobile Card ──────────────────────────────────────────────────────────────
function LecturerCard({ row, index }) {
  const status =
    row.total < MIN_PERIODS
      ? 'Underload'
      : row.total > MAX_PERIODS
        ? 'Overload'
        : 'Normal'

  const subjects = row.subjects || row.subjectList || []

  const cardBorder =
    status === 'Normal'
      ? 'border-emerald-200'
      : status === 'Underload'
        ? 'border-rose-300'
        : 'border-red-400'

  const progressColor =
    status === 'Normal' ? 'bg-emerald-500' : status === 'Underload' ? 'bg-rose-400' : 'bg-red-600'

  return (
    <div className={`rounded-xl border-2 ${cardBorder} bg-white p-4 shadow-sm`}>
      {/* Card Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-black text-white">
            {(row.lecturer || row.name || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-800">
              {row.lecturer || row.name || '—'}
            </p>
            <p className="text-xs text-slate-400">#{index + 1}</p>
          </div>
        </div>

        {/* Status Badge */}
        {status === 'Normal' && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 size={11} /> Normal
          </span>
        )}
        {status === 'Underload' && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
            <AlertCircle size={11} /> Underload
          </span>
        )}
        {status === 'Overload' && (
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
            <AlertCircle size={11} /> Overload
          </span>
        )}
      </div>

      {/* Stats Row */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <BookOpen size={11} className="text-blue-400" />
            <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">Theory</span>
          </div>
          <p className="text-lg font-black text-blue-700">{row.theory}</p>
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <FlaskConical size={11} className="text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">Practical</span>
          </div>
          <p className="text-lg font-black text-amber-700">{row.practical}</p>
        </div>
        <div className="rounded-lg bg-slate-100 px-3 py-2 text-center">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Total</p>
          <p className="text-lg font-black text-slate-800">{row.total}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-slate-400">
          <span>0</span>
          <span>{MAX_PERIODS} periods/week</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${Math.min((row.total / MAX_PERIODS) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((sub, si) => (
            <span
              key={si}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                sub.toLowerCase().includes('practical')
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {sub.toLowerCase().includes('practical')
                ? <FlaskConical size={9} />
                : <BookOpen size={9} />}
              {sub}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LecturerWorkloadReport({ data }) {
  if (!data || !data.length) return null

  const normalCount = data.filter(r => r.total >= MIN_PERIODS && r.total <= MAX_PERIODS).length
  const issueCount = data.filter(r => r.total < MIN_PERIODS || r.total > MAX_PERIODS).length
  const totalTheory = data.reduce((s, r) => s + r.theory, 0)
  const totalPractical = data.reduce((s, r) => s + r.practical, 0)
  const totalPeriods = data.reduce((s, r) => s + r.total, 0)
  const avgPeriods = data.length ? Math.round(totalPeriods / data.length) : 0

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm print:border-black print:shadow-none">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-t-2xl border-b border-slate-100 bg-slate-800 px-4 py-4 sm:px-5 print:bg-blue-800">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500">
          <User size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black text-white sm:text-base">Lecturer Workload Report</h3>
          <p className="text-xs text-slate-400">Theory + Practical — weekly period count</p>
        </div>
        <div className="flex gap-2 text-xs font-semibold print:hidden">
          <span className="flex items-center gap-1 rounded-full bg-emerald-900/40 px-2.5 py-1 text-emerald-400">
            <CheckCircle2 size={11} />
            <span className="hidden xs:inline">Normal: </span>{normalCount}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-rose-900/40 px-2.5 py-1 text-rose-400">
            <AlertCircle size={11} />
            <span className="hidden xs:inline">Issues: </span>{issueCount}
          </span>
        </div>
      </div>

      {/* ── Mobile Cards (< md) ── */}
      <div className="block p-4 md:hidden">
        <div className="flex flex-col gap-3">
          {data.map((row, i) => (
            <LecturerCard key={row.lecturer || row.name || i} row={row} index={i} />
          ))}
        </div>

        {/* Mobile Summary */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Theory</p>
            <p className="text-base font-black text-slate-800">{totalTheory}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Practical</p>
            <p className="text-base font-black text-slate-800">{totalPractical}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-base font-black text-slate-800">{totalPeriods}</p>
          </div>
          <div className="col-span-3 border-t border-slate-200 pt-2 text-xs text-slate-500">
            {data.length} lecturers · avg {avgPeriods} periods/week
          </div>
        </div>
      </div>

      {/* ── Desktop Table (≥ md) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm print:border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 print:bg-blue-700 print:text-white">
              {[
                { label: '#', w: 'w-10' },
                { label: 'Lecturer Name', w: 'w-48' },
                { label: 'Subjects', w: 'w-64' },
                { label: 'Theory', w: 'w-20' },
                { label: 'Practical', w: 'w-24' },
                { label: 'Total / Week', w: 'w-28' },
                { label: 'Status', w: 'w-32' },
              ].map(h => (
                <th
                  key={h.label}
                  className={`${h.w} px-4 py-3 text-left text-xs font-bold tracking-wide text-slate-500 uppercase print:text-white`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => {
              const status =
                row.total < MIN_PERIODS
                  ? 'Underload'
                  : row.total > MAX_PERIODS
                    ? 'Overload'
                    : 'Normal'

              const rowBg =
                status === 'Normal'
                  ? i % 2 === 0
                    ? 'bg-white'
                    : 'bg-slate-50/60'
                  : status === 'Underload'
                    ? 'bg-rose-50'
                    : 'bg-red-50'

              const subjects = row.subjects || row.subjectList || []
              const mainSubject =
                subjects.find(s => !s.toLowerCase().includes('practical')) ||
                subjects[0] ||
                '—'

              return (
                <React.Fragment key={row.lecturer || row.name}>
                  <tr className={`transition-colors ${rowBg} print:border-b print:border-black`}>
                    <td className="px-4 py-3 text-xs font-bold text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-white print:bg-blue-800">
                          {(row.lecturer || row.name || '?')[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-800">{row.lecturer || row.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {mainSubject}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-blue-400" />
                        <span className="font-bold text-slate-700">{row.theory}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <FlaskConical size={13} className="text-amber-500" />
                        <span className="font-bold text-slate-700">{row.practical}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 print:hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              status === 'Normal'
                                ? 'bg-emerald-500'
                                : status === 'Underload'
                                  ? 'bg-rose-400'
                                  : 'bg-red-600'
                            }`}
                            style={{ width: `${Math.min((row.total / MAX_PERIODS) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-base font-black text-slate-800">{row.total}</span>
                        <span className="text-xs text-slate-400">/ {MAX_PERIODS}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {status === 'Normal' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={12} /> Normal
                        </span>
                      )}
                      {status === 'Underload' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                          <AlertCircle size={12} /> Underload
                        </span>
                      )}
                      {status === 'Overload' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          <AlertCircle size={12} /> Overload
                        </span>
                      )}
                    </td>
                  </tr>

                  {subjects.length > 0 &&
                    subjects.map((sub, si) => (
                      <tr
                        key={`${row.lecturer}-${si}`}
                        className={`${rowBg} bg-opacity-40 border-l-4 border-l-purple-400 print:border-l-0`}
                      >
                        <td className="px-4 py-2 text-xs text-slate-400 italic" />
                        <td className="px-4 py-2 text-xs">
                          <span className="text-slate-500 italic">↳ Subject</span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              sub.toLowerCase().includes('practical')
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {sub.toLowerCase().includes('practical')
                              ? <FlaskConical size={10} />
                              : <BookOpen size={10} />}
                            {sub}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-500">—</td>
                        <td className="px-4 py-2 text-xs text-slate-500">—</td>
                        <td className="px-4 py-2 text-xs text-slate-500">—</td>
                        <td className="px-4 py-2 text-xs text-slate-500">—</td>
                      </tr>
                    ))}
                </React.Fragment>
              )
            })}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={3} className="px-4 py-2.5 text-xs font-bold tracking-wide text-slate-500 uppercase">
                Total ({data.length} lecturers)
              </td>
              <td className="px-4 py-2.5 font-black text-slate-800">{totalTheory}</td>
              <td className="px-4 py-2.5 font-black text-slate-800">{totalPractical}</td>
              <td className="px-4 py-2.5 font-black text-slate-800">{totalPeriods}</td>
              <td className="px-4 py-2.5 text-xs text-slate-400">Avg: {avgPeriods} periods</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 size={12} />
          <span className="hidden sm:inline">12–24 Periods/Week (4/day × 6 days) : </span>Normal
        </span>
        <span className="flex items-center gap-1.5 text-rose-700">
          <AlertCircle size={12} /> &lt;{MIN_PERIODS} : Underload
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <AlertCircle size={12} /> &gt;{MAX_PERIODS} : Overload
        </span>
        <span className="sm:ml-auto flex items-center gap-1.5 text-blue-600 print:hidden">
          <BookOpen size={11} /> Theory &nbsp;
          <FlaskConical size={11} className="text-amber-500" /> Practical
        </span>
      </div>
    </div>
  )
}