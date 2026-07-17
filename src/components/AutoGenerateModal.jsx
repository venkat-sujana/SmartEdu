//src/components/AutoGenerateModal.jsx
'use client'
import { useState, useMemo } from 'react'
import {
  Zap, X, Plus, Minus, AlertTriangle,
  CheckCircle2, Loader2, RotateCcw,
  BookOpen, FlaskConical, Clock, Info
} from 'lucide-react'
import {
  TIMETABLE_DEFAULT_HOURS as DEFAULT_HOURS,
  TIMETABLE_GENERATOR_SUBJECT_LECTURERS as SUBJECT_LECTURERS,
  TIMETABLE_GENERATOR_SUBJECT_COLORS as SUBJECT_COLORS,
  TIMETABLE_GENERATOR_SUBJECTS as ALL_SUBJECTS,
  TIMETABLE_TOTAL_PERIODS_PER_CLASS as TOTAL_PERIODS_PER_WEEK,
} from '@/lib/timetable-config'


// ── AutoGenerateModal ────────────────────────────────────────────────
export default function AutoGenerateModal({
  classLabel,
  stream = 'general',
  academicYear = '2026-2027',
  onClose,
  onGenerated,  // callback — generate తర్వాత parent refresh
}) {
  // subject config: { subject, hours, lecturerName, enabled }
  const initConfig = () =>
    (ALL_SUBJECTS[stream] || []).map(subject => ({
      subject,
      hours:       DEFAULT_HOURS[stream]?.[subject] ?? 0,
      lecturerName: SUBJECT_LECTURERS[subject] || '',
      enabled:     !!(DEFAULT_HOURS[stream]?.[subject]),
      isPractical: subject.toLowerCase().includes('practical'),
    }))

  const [config,      setConfig]      = useState(initConfig)
  const [generating,  setGenerating]  = useState(false)
  const [result,      setResult]      = useState(null)   // generate result
  const [overwrite,   setOverwrite]   = useState(false)  // locked slots overwrite

  // ── Total hours calculation ──────────────────────────────────────
  const totalHours = useMemo(
    () => config.filter(c => c.enabled).reduce((s, c) => s + (c.hours || 0), 0),
    [config]
  )
  const remaining   = TOTAL_PERIODS_PER_WEEK - totalHours
  const isOverLimit = totalHours > TOTAL_PERIODS_PER_WEEK
  const isEmpty     = totalHours === 0

  // ── Handlers ──────────────────────────────────────────────────────
  const toggle = (i) => {
    setConfig(prev => prev.map((c, idx) =>
      idx === i ? { ...c, enabled: !c.enabled, hours: !c.enabled ? (DEFAULT_HOURS[stream]?.[c.subject] ?? 1) : 0 } : c
    ))
  }

  const setHours = (i, val) => {
    const hours = Math.max(0, Math.min(12, Number(val) || 0))
    setConfig(prev => prev.map((c, idx) => idx === i ? { ...c, hours } : c))
  }

  const setLecturer = (i, val) => {
    setConfig(prev => prev.map((c, idx) => idx === i ? { ...c, lecturerName: val } : c))
  }

  const resetToDefault = () => setConfig(initConfig())

  // ── Auto Generate ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (isOverLimit || isEmpty) return
    setGenerating(true)
    setResult(null)

    const subjectHours = config
      .filter(c => c.enabled && c.hours > 0)
      .map(c => ({
        subject:      c.subject,
        lecturerName: c.lecturerName,
        hoursPerWeek: c.hours,
        isPractical:  c.isPractical,
      }))

    try {
      const res  = await fetch('/api/timetable-builder/auto', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          classLabel,
          stream,
          academicYear,
          subjectHours,
          overwriteLocked: overwrite,
        }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Generation failed')

      setResult({
        success:     true,
        message:     data.message,
        totalSaved:  data.totalSaved,
        workload:    data.workload || [],
        unallocated: data.unallocated || [],
      })

      // Parent callback — timetable refresh చేయాలి
      onGenerated?.({ unallocated: data.unallocated || [] })

    } catch (err) {
      setResult({ success: false, message: err.message || 'Generation failed' })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">

        {/* ── Modal Header ── */}
        <div className="flex items-center gap-3 rounded-t-2xl bg-linear-to-r from-slate-800 to-slate-700 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 shadow">
            <Zap size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-white">Auto Generate Timetable</h2>
            <p className="text-xs text-slate-400 truncate">{classLabel} · {academicYear}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-700 text-slate-400 transition hover:bg-slate-600 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Hours Counter Bar ── */}
        <div className={`flex items-center gap-4 border-b px-5 py-3 ${
          isOverLimit ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
              <span className={isOverLimit ? 'text-red-600' : 'text-slate-600'}>
                {totalHours} / {TOTAL_PERIODS_PER_WEEK} periods assigned
              </span>
              <span className={remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over limit!`}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverLimit ? 'bg-red-500' : totalHours > 40 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min((totalHours / TOTAL_PERIODS_PER_WEEK) * 100, 100)}%` }}
              />
            </div>
          </div>

          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* ── Subject Config List ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">

          {/* Info */}
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-700">
            <Info size={12} className="shrink-0" />
            Subject enable చేసి hours set చేయండి. Total {TOTAL_PERIODS_PER_WEEK} periods available (6 days × 8 periods).
          </div>

          {config.map((item, i) => {
            const colorCls = SUBJECT_COLORS[item.subject] || 'bg-slate-50 border-slate-200 text-slate-600'
            return (
              <div
                key={item.subject}
                className={`rounded-xl border p-3 transition-all ${
                  item.enabled ? colorCls : 'border-slate-100 bg-slate-50 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">

                  {/* Enable toggle */}
                  <button
                    onClick={() => toggle(i)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      item.enabled
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {item.enabled && <CheckCircle2 size={12} />}
                  </button>

                  {/* Subject name */}
                  <div className="flex flex-1 items-center gap-2">
                    {item.isPractical
                      ? <FlaskConical size={13} className="shrink-0 opacity-70" />
                      : <BookOpen size={13} className="shrink-0 opacity-70" />
                    }
                    <span className="text-sm font-bold">{item.subject}</span>
                  </div>

                  {/* Lecturer input */}
                  <input
                    type="text"
                    value={item.lecturerName}
                    onChange={e => setLecturer(i, e.target.value)}
                    disabled={!item.enabled}
                    placeholder="Lecturer name"
                    className="w-36 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none disabled:opacity-40"
                  />

                  {/* Hours counter */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setHours(i, item.hours - 1)}
                      disabled={!item.enabled || item.hours <= 0}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-30"
                    >
                      <Minus size={10} />
                    </button>
                    <input
                      type="number"
                      value={item.hours}
                      onChange={e => setHours(i, e.target.value)}
                      disabled={!item.enabled}
                      min={0}
                      max={12}
                      className="w-10 rounded-lg border border-slate-200 bg-white px-1 py-1 text-center text-xs font-bold text-slate-700 focus:outline-none disabled:opacity-40"
                    />
                    <button
                      onClick={() => setHours(i, item.hours + 1)}
                      disabled={!item.enabled || item.hours >= 12}
                      className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 disabled:opacity-30"
                    >
                      <Plus size={10} />
                    </button>
                    <span className="w-8 text-[10px] text-slate-400 font-medium">hrs/wk</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Result Panel ── */}
        {result && (
          <div className={`mx-5 mb-3 rounded-xl border p-3 ${
            result.success
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              {result.success
                ? <CheckCircle2 size={14} className="text-emerald-600" />
                : <AlertTriangle size={14} className="text-red-600" />
              }
              <span className={`text-xs font-bold ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.success ? `✅ ${result.totalSaved} slots generated!` : `❌ ${result.message}`}
              </span>
            </div>
            {result.success && result.workload?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.workload.map(w => (
                  <span key={w.name} className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {w.name}: {w.total} periods
                  </span>
                ))}
              </div>
            )}
            {result.success && result.unallocated?.length > 0 && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5">
                <p className="text-[10px] font-bold text-amber-700">
                  {result.unallocated.length} period{result.unallocated.length > 1 ? 's' : ''} could not be placed without lecturer conflicts.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3 rounded-b-2xl">

          {/* Overwrite locked toggle */}
          <button
            onClick={() => setOverwrite(p => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              overwrite
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-slate-200 bg-white text-slate-500'
            }`}
          >
            <Clock size={12} />
            {overwrite ? 'Locked slots overwrite ON' : 'Keep locked slots'}
          </button>

          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isOverLimit || isEmpty || generating}
              className={`flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-black text-white shadow-md transition active:scale-95 disabled:opacity-50 ${
                isOverLimit || isEmpty
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {generating
                ? <><Loader2 size={15} className="animate-spin" /> Generating...</>
                : <><Zap size={15} /> Auto Generate</>
              }
            </button>
          </div>
        </div>

        {/* Validation warnings */}
        {isOverLimit && (
          <div className="absolute bottom-16 left-5 right-5 flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 shadow-lg">
            <AlertTriangle size={14} className="text-white shrink-0" />
            <span className="text-xs font-bold text-white">
              Total {totalHours} periods — limit {TOTAL_PERIODS_PER_WEEK} exceed అయింది! {Math.abs(remaining)} periods తగ్గించండి.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
