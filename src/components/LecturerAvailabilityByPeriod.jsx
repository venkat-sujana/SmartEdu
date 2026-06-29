'use client'

import { useMemo, useState } from 'react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SUBJECT_SHORT = {
  Mathematics: 'MAT',
  Maths: 'MAT',

  Physics: 'PHY',

  Chemistry: 'CHE',

  Botany: 'BOT',

  Zoology: 'ZOO',

  English: 'ENG',

  Telugu: 'TEL',

  Hindi: 'HIN',

  Civics: 'CIV',

  Economics: 'ECO',

  Commerce: 'COM',

  History: 'HIS',

  ComputerScience: 'CSE',
}

export default function LecturerAvailabilityByPeriod({ table }) {
  const [selectedDay, setSelectedDay] = useState('Monday')

  const dayIndex = DAYS.indexOf(selectedDay)

  const dayTable = dayIndex >= 0 ? table[dayIndex] : []

  const periods = dayTable.filter(cell => cell.periodType === 'period')

  const lecturers = [
    ...new Set(
      table
        .flat()
        .filter(cell => cell?.lecturerName)
        .map(cell => cell.lecturerName)
    ),
  ].sort()

  console.log('Selected Day:', selectedDay)
  console.log('Day Index:', dayIndex)
  console.log('Table:', table)
  console.log('Day Table:', dayTable)
  console.log(periods)
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b bg-slate-50 px-5 py-4">
        <h3 className="text-lg font-bold">🟢 Lecturer Availability by Period</h3>
      </div>

      <div className="p-5">
        <label className="mb-2 block text-sm font-semibold">Select Day</label>

        <select
          value={selectedDay}
          onChange={e => setSelectedDay(e.target.value)}
          className="rounded-lg border px-3 py-2"
        >
          {DAYS.map(day => (
            <option key={day}>{day}</option>
          ))}
        </select>

        

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="border px-4 py-2 text-left">Lecturer</th>

                {periods.map((_, index) => (
                  <th key={index} className="border px-4 py-2">
                    P{index + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lecturers.map(lecturer => (
                <tr key={lecturer} className="border-b hover:bg-slate-50">
                  <td className="border px-4 py-2 font-semibold">{lecturer}</td>

                  {periods.map((cell, index) => {
                    const slot = dayTable.find(
                      c =>
                        c.periodType === 'period' &&
                        c.lecturerName === lecturer &&
                        c.subject &&
                        c.periodType === cell.periodType &&
                        dayTable.indexOf(c) === dayTable.indexOf(cell)
                    )

                    return (
                      <td key={index} className="border px-2 py-2 text-center">
                        {slot ? (
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700">
                            {SUBJECT_SHORT[slot.subject] || slot.subject.slice(0, 3).toUpperCase()}
                          </span>
                        ) : (
                          <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                            FREE
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
