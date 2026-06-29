'use client'

import { X, CalendarDays } from 'lucide-react'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function LecturerTimetableModal({
  open,
  onClose,
  lecturer,
  table,
  columns,
}) {
  if (!open || !lecturer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b px-6 py-4">

          <div>

            <h2 className="text-xl font-bold">
              👨‍🏫 {lecturer}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Personal Weekly Timetable
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20}/>
          </button>

        </div>

        {/* Body */}

        <div className="max-h-[70vh] overflow-y-auto p-6">

          {DAYS.map((day, dayIndex) => {

            const periods = table[dayIndex]
              .map((cell, index) => ({
                ...cell,
                period: columns[index]?.label,
              }))
              .filter(
                c =>
                  c.periodType === 'period' &&
                  c.lecturerName === lecturer
              )

            return (

              <div
                key={day}
                className="mb-6"
              >

                <div className="mb-3 flex items-center gap-2">

                  <CalendarDays
                    size={16}
                    className="text-blue-600"
                  />

                  <h3 className="font-bold text-blue-700">
                    {day}
                  </h3>

                </div>

                {periods.length === 0 ? (

                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-400">
                    Free
                  </div>

                ) : (

                  <div className="space-y-2">

                    {periods.map((p, i) => (

                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >

                        <div>

                          <div className="font-semibold">
                            {p.subject}
                          </div>

                          <div className="text-xs text-slate-500">
                            {p.period}
                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )

          })}

        </div>

      </div>

    </div>
  )
}