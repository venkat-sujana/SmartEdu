// src/app/timetable/page.jsx
'use client'
import { useState, useCallback } from 'react'
import EditableTimeTable from '@/components/EditableTimeTable'
import { LayoutGrid, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

const ACADEMIC_YEAR = '2026-2027'

const CLASSES = [
  { title: 'FIRST YEAR SCIENCE - GENERAL',  stream: 'general'    },
  { title: 'SECOND YEAR SCIENCE - GENERAL', stream: 'general'    },
  { title: 'FIRST YEAR ARTS - GENERAL',     stream: 'general'    },
  { title: 'SECOND YEAR ARTS - GENERAL',    stream: 'general'    },
  { title: 'FIRST YEAR VOCATIONAL',         stream: 'vocational' },
  { title: 'SECOND YEAR VOCATIONAL',        stream: 'vocational' },
]

export default function TimeTablePage() {
  // ✅ Per-class conflict counts — { classLabel: count }
  const [conflictMap, setConflictMap] = useState({})

  const handleConflictChange = useCallback((classLabel, count) => {
    setConflictMap(prev => ({ ...prev, [classLabel]: count }))
  }, [])

  const totalConflicts = Object.values(conflictMap).reduce((s, c) => s + c, 0)
  const classesWithConflicts = Object.entries(conflictMap).filter(([, c]) => c > 0)

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 shadow-md">
                <LayoutGrid size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800">
                  Academic Year {ACADEMIC_YEAR}
                </h1>
                <p className="text-sm font-medium text-slate-400">
                  Cell click → Subject select → Auto save ✅
                </p>
              </div>
            </div>

            {/* ✅ Global Conflict Summary */}
            <div className="ml-auto flex items-center gap-3">
              {totalConflicts > 0 ? (
                <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 shadow-sm">
                  <ShieldAlert size={18} className="text-red-500" />
                  <div>
                    <p className="text-xs font-black text-red-700">
                      {totalConflicts} Total Conflict{totalConflicts > 1 ? 's' : ''}!
                    </p>
                    <p className="text-[10px] text-red-500">
                      {classesWithConflicts.length} class{classesWithConflicts.length > 1 ? 'es' : ''} affected
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 shadow-sm">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <div>
                    <p className="text-xs font-black text-emerald-700">No Conflicts</p>
                    <p className="text-[10px] text-emerald-500">All classes clear ✅</p>
                  </div>
                </div>
              )}

              <span className="flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700">
                🔵 General
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
                🟢 Vocational
              </span>
            </div>
          </div>

          {/* ✅ Conflict details bar */}
          {classesWithConflicts.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AlertTriangle size={13} className="text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600">Conflicts in:</span>
              {classesWithConflicts.map(([label, count]) => (
                <span key={label} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                  {label} · {count}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Timetables ── */}
      <div className="mx-auto max-w-screen-2xl space-y-2 px-6 py-6">

        {/* General Stream */}
        <div className="mb-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            🔵 General Stream
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          {CLASSES.filter(c => c.stream === 'general').map(cls => (
            <EditableTimeTable
              key={cls.title}
              title={cls.title}
              stream={cls.stream}
              academicYear={ACADEMIC_YEAR}
              onConflictChange={handleConflictChange} // ✅
            />
          ))}
        </div>

        {/* Vocational Stream */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            🟢 Vocational Stream
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          {CLASSES.filter(c => c.stream === 'vocational').map(cls => (
            <EditableTimeTable
              key={cls.title}
              title={cls.title}
              stream={cls.stream}
              academicYear={ACADEMIC_YEAR}
              onConflictChange={handleConflictChange} // ✅
            />
          ))}
        </div>

      </div>
    </div>
  )
}
