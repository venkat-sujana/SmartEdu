'use client'

import { useMemo, useState } from 'react'
import { Users, CalendarDays, Flame } from 'lucide-react'
import { Eye } from 'lucide-react'
import LecturerTimetableModal from '@/components/LecturerTimetableModal'
import { TIMETABLE_COLUMNS as COLUMNS } from '@/lib/timetable-config'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function LecturerAvailabilityMatrix({ table, columns }) {
  const [selectedLecturer, setSelectedLecturer] = useState(null)
  const data = useMemo(() => {
    const lecturers = {}

    table.forEach((dayRow, dayIndex) => {
      dayRow.forEach(cell => {
        if (!cell?.subject || cell.periodType !== 'period' || !cell.lecturerName) return

        const lecturer = cell.lecturerName

        if (!lecturers[lecturer]) {
          lecturers[lecturer] = {
            lecturer,
            Monday: 0,
            Tuesday: 0,
            Wednesday: 0,
            Thursday: 0,
            Friday: 0,
            Saturday: 0,
            total: 0,
          }
        }

        lecturers[lecturer][DAYS[dayIndex]]++
        lecturers[lecturer].total++
      })
    })

    return Object.values(lecturers).sort((a, b) => b.total - a.total)
  }, [table])

  if (!data.length) return null

  // Statistics
  const busiestDay = DAYS.map(day => ({
    day,
    total: data.reduce((sum, l) => sum + l[day], 0),
  })).sort((a, b) => b.total - a.total)[0]

  const highestLoad = Math.max(...data.flatMap(l => DAYS.map(day => l[day])))

  const totalWeekly = data.reduce((sum, l) => sum + l.total, 0)

  const badgeColor = value => {
    if (value === 0) return 'bg-slate-100 text-slate-400'

    if (value <= 2) return 'bg-emerald-100 text-emerald-700'

    if (value <= 4) return 'bg-amber-100 text-amber-700'

    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="border-b bg-slate-50 px-5 py-4">
        <h3 className="text-lg font-bold text-slate-800">📅 Lecturer Availability Matrix</h3>

        <div className="mt-3 flex flex-wrap gap-5 text-sm">
          <span className="flex items-center gap-2">
            <Users size={16} />
            {data.length} Lecturers
          </span>

          <span className="flex items-center gap-2">
            <CalendarDays size={16} />
            Busiest Day :<strong>{busiestDay.day}</strong>
          </span>

          <span className="flex items-center gap-2">
            <Flame size={16} />
            Highest Daily Load :<strong>{highestLoad}</strong>
          </span>

          <span>
            Weekly Periods :<strong> {totalWeekly}</strong>
          </span>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-4 py-3 text-left">Lecturer</th>

              {DAYS.map(day => (
                <th key={day} className="px-3 py-3 text-center">
                  {day.slice(0, 3)}
                </th>
              ))}

              <th className="px-3 py-3 text-center">Total</th>
              <th className="px-3 py-3">Action</th>
            </tr>
            
          </thead>

          <tbody>
            {data.map(row => (
              <tr key={row.lecturer} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{row.lecturer}</td>

                {DAYS.map(day => (
  <td key={day} className="px-3 py-3 text-center">
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${badgeColor(
        row[day]
      )}`}
    >
      {row[day]}
    </span>
  </td>
))}

                <td className="px-3 py-3 text-center">{row.total}</td>

                {/* NEW */}

                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => setSelectedLecturer(row.lecturer)}
                    className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LecturerTimetableModal
        open={!!selectedLecturer}
        lecturer={selectedLecturer}
        table={table}
        columns={COLUMNS}
        onClose={() => setSelectedLecturer(null)}
      />

      {/* Legend */}

      <div className="border-t bg-slate-50 px-5 py-3 text-xs font-semibold">
        <div className="flex flex-wrap gap-5">
          <span>⚪ 0 Periods</span>

          <span>🟢 1-2 Periods</span>

          <span>🟡 3-4 Periods</span>

          <span>🔴 5+ Periods</span>
        </div>
      </div>
    </div>
  )
}
