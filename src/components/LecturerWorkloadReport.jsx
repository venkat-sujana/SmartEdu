// app/components/LecturerWorkloadReport.jsx
import { CheckCircle2, AlertCircle, BookOpen, User, FlaskConical } from 'lucide-react'

const MIN_PERIODS = 16
const MAX_PERIODS = 24

export default function LecturerWorkloadReport({ data }) {
  if (!data || !data.length) return null

  return (
    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm print:shadow-none print:border-black">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-800 px-5 py-4 rounded-t-2xl print:bg-blue-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500">
          <User size={16} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-black text-white">Lecturer Workload Report</h3>
          <p className="text-xs text-slate-400">Theory + Practical — weekly period count</p>
        </div>
        <div className="ml-auto flex gap-3 text-xs font-semibold print:hidden">
          <span className="flex items-center gap-1 rounded-full bg-emerald-900/40 px-2.5 py-1 text-emerald-400">
            <CheckCircle2 size={11} /> Normal: {data.filter(r => r.total >= MIN_PERIODS && r.total <= MAX_PERIODS).length}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-rose-900/40 px-2.5 py-1 text-rose-400">
            <AlertCircle size={11} /> Issues: {data.filter(r => r.total < MIN_PERIODS || r.total > MAX_PERIODS).length}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm print:border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 print:bg-blue-700 print:text-white">
              {[
                { label: '#',            w: 'w-10'  },
                { label: 'Lecturer Name', w: 'w-48'  },
                { label: 'Subjects',      w: 'w-64'  },
                { label: 'Theory',        w: 'w-20'  },
                { label: 'Practical',     w: 'w-24'  },
                { label: 'Total / Week',  w: 'w-28'  },
                { label: 'Status',        w: 'w-32'  },
              ].map(h => (
                <th
                  key={h.label}
                  className={`${h.w} px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 print:text-white`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {data.map((row, i) => {
              const status =
                row.total < MIN_PERIODS ? 'Underload'
                : row.total > MAX_PERIODS ? 'Overload'
                : 'Normal'

              const rowBg =
                status === 'Normal'    ? (i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60')
                : status === 'Underload' ? 'bg-rose-50'
                : 'bg-red-50'

              // subjects list — row.subjects array లేదా row.subjectList
              const subjects = row.subjects || row.subjectList || []

              return (
                <tr key={row.lecturer || row.name} className={`transition-colors ${rowBg} print:border-b print:border-black`}>

                  {/* S.No */}
                  <td className="px-4 py-3 text-xs font-bold text-slate-400">{i + 1}</td>

                  {/* Lecturer Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-black text-white print:bg-blue-800">
                        {(row.lecturer || row.name || '?')[0].toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-800">
                        {row.lecturer || row.name || '—'}
                      </span>
                    </div>
                  </td>

                  {/* Subjects taught */}
                  <td className="px-4 py-3">
                    {subjects.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((sub, si) => (
                          <span
                            key={si}
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              sub.toLowerCase().includes('practical')
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {sub.toLowerCase().includes('practical')
                              ? <FlaskConical size={9} />
                              : <BookOpen size={9} />
                            }
                            {sub}
                          </span>
                        ))}
                      </div>
                    ) : (
                      // subjects array లేకుండా theory/practical count నుండి guess చేయండి
                      <div className="flex flex-wrap gap-1">
                        {row.theory > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            <BookOpen size={9} /> Theory × {row.theory}
                          </span>
                        )}
                        {row.practical > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            <FlaskConical size={9} /> Practical × {row.practical}
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Theory */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={13} className="text-blue-400" />
                      <span className="font-bold text-slate-700">{row.theory}</span>
                    </div>
                  </td>

                  {/* Practical */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <FlaskConical size={13} className="text-amber-500" />
                      <span className="font-bold text-slate-700">{row.practical}</span>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Mini progress bar */}
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200 print:hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === 'Normal'    ? 'bg-emerald-500'
                            : status === 'Underload' ? 'bg-rose-400'
                            : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min((row.total / MAX_PERIODS) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-base font-black text-slate-800">{row.total}</span>
                      <span className="text-xs text-slate-400">/ {MAX_PERIODS}</span>
                    </div>
                  </td>

                  {/* Status */}
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
              )
            })}
          </tbody>

          {/* ── Summary Footer ── */}
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td colSpan={3} className="px-4 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total ({data.length} lecturers)
              </td>
              <td className="px-4 py-2.5 font-black text-slate-800">
                {data.reduce((s, r) => s + r.theory, 0)}
              </td>
              <td className="px-4 py-2.5 font-black text-slate-800">
                {data.reduce((s, r) => s + r.practical, 0)}
              </td>
              <td className="px-4 py-2.5 font-black text-slate-800">
                {data.reduce((s, r) => s + r.total, 0)}
              </td>
              <td className="px-4 py-2.5 text-xs text-slate-400">
                Avg: {data.length ? Math.round(data.reduce((s, r) => s + r.total, 0) / data.length) : 0} periods
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 bg-slate-50 px-5 py-3 rounded-b-2xl text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <CheckCircle2 size={12} /> {MIN_PERIODS}–{MAX_PERIODS} Periods : Normal
        </span>
        <span className="flex items-center gap-1.5 text-rose-700">
          <AlertCircle size={12} /> &lt;{MIN_PERIODS} Periods : Underload
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <AlertCircle size={12} /> &gt;{MAX_PERIODS} Periods : Overload
        </span>
        <span className="flex items-center gap-1.5 text-blue-600 ml-auto print:hidden">
          <BookOpen size={11} /> Theory &nbsp;
          <FlaskConical size={11} className="text-amber-500" /> Practical
        </span>
      </div>
    </div>
  )
}
