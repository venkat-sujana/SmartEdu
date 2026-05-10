// app/timetable/page.jsx
import EditableTimeTable from '@/components/EditableTimeTable'
import { LayoutGrid } from 'lucide-react'

const ACADEMIC_YEAR = '2026-2027'

// ── Classes config ───────────────────────────────────────────────────
const CLASSES = [
  // General Stream
  { title: 'FIRST YEAR SCIENCE - GENERAL',  stream: 'general' },
  { title: 'SECOND YEAR SCIENCE - GENERAL', stream: 'general' },
  { title: 'FIRST YEAR ARTS - GENERAL',     stream: 'general' },
  { title: 'SECOND YEAR ARTS - GENERAL',    stream: 'general' },

  // Vocational Stream
  { title: 'FIRST YEAR VOCATIONAL',         stream: 'vocational' },
  { title: 'SECOND YEAR VOCATIONAL',        stream: 'vocational' },
]

export default function TimeTablePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-screen-2xl px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 shadow-md">
              <LayoutGrid size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">
                Academic Year {ACADEMIC_YEAR}
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Cell click → Subject select → Auto save to DB ✅
              </p>
            </div>

            {/* Stream legend */}
            <div className="ml-auto flex gap-3">
              <span className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200">
                🔵 General Stream
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                🟢 Vocational Stream
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timetables ── */}
      <div className="mx-auto max-w-screen-2xl space-y-2 px-6 py-6">

        {/* General Stream Section */}
        <div className="mb-2">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            General Stream
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          {CLASSES.filter(c => c.stream === 'general').map(cls => (
            <EditableTimeTable
              key={cls.title}
              title={cls.title}
              stream={cls.stream}
              academicYear={ACADEMIC_YEAR}
            />
          ))}
        </div>

        {/* Vocational Stream Section */}
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            Vocational Stream
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          {CLASSES.filter(c => c.stream === 'vocational').map(cls => (
            <EditableTimeTable
              key={cls.title}
              title={cls.title}
              stream={cls.stream}
              academicYear={ACADEMIC_YEAR}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
