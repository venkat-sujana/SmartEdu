'use client'

import { useMemo, useState } from 'react'

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function SubstituteRecommendation({ table }) {
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [selectedPeriod, setSelectedPeriod] = useState(1)
  const [absentLecturer, setAbsentLecturer] = useState('')

  // All lecturers
  const lecturers = useMemo(() => {
    return [
      ...new Set(
        table
          .flat()
          .filter(cell => cell?.lecturerName)
          .map(cell => cell.lecturerName)
      ),
    ].sort()
  }, [table])

  // Weekly workload
  const workloads = useMemo(() => {
    const load = {}

    table.flat().forEach(cell => {
      if (
        cell?.periodType === 'period' &&
        cell.lecturerName
      ) {
        load[cell.lecturerName] =
          (load[cell.lecturerName] || 0) + 1
      }
    })

    return load
  }, [table])

  const todayLoads = useMemo(() => {
  const load = {}

  const dayIndex = DAYS.indexOf(selectedDay)

  if (dayIndex === -1) return load

  table[dayIndex].forEach(cell => {
    if (
      cell?.periodType === 'period' &&
      cell.lecturerName
    ) {
      load[cell.lecturerName] =
        (load[cell.lecturerName] || 0) + 1
    }
  })

  return load
}, [table, selectedDay])

  // Recommendations
  const recommendations = useMemo(() => {
    const dayIndex = DAYS.indexOf(selectedDay)

    if (dayIndex === -1) return []

    const dayTable = table[dayIndex]

    const busyLecturers = dayTable
      .filter(
        (cell, index) =>
          cell.periodType === 'period' &&
          index + 1 === selectedPeriod &&
          cell.lecturerName
      )
      .map(cell => cell.lecturerName)

    return lecturers
      .filter(
        lecturer =>
          lecturer !== absentLecturer &&
          !busyLecturers.includes(lecturer)
      )
      .sort((a, b) => {

  const todayDiff =
    (todayLoads[a] || 0) -
    (todayLoads[b] || 0)

  if (todayDiff !== 0) return todayDiff

  const weeklyDiff =
    (workloads[a] || 0) -
    (workloads[b] || 0)

  if (weeklyDiff !== 0) return weeklyDiff

  return a.localeCompare(b)

})
  }, [
    table,
    lecturers,
    selectedDay,
    selectedPeriod,
    absentLecturer,
    workloads,
    todayLoads,
  ])

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b bg-slate-50 px-5 py-4">

        <h3 className="text-lg font-bold">
          🔍 Substitute Recommendation
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Find the best substitute lecturer.
        </p>

      </div>

      {/* Filters */}

      <div className="grid gap-4 p-5 md:grid-cols-3">

        <div>

          <label className="mb-2 block text-sm font-semibold">
            Day
          </label>

          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            {DAYS.map(day => (
              <option key={day}>
                {day}
              </option>
            ))}
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-semibold">
            Period
          </label>

          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(Number(e.target.value))}
            className="w-full rounded-lg border px-3 py-2"
          >
            {[1,2,3,4,5,6,7,8].map(period => (
              <option
                key={period}
                value={period}
              >
                Period {period}
              </option>
            ))}
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm font-semibold">
            Absent Lecturer
          </label>

          <select
            value={absentLecturer}
            onChange={e => setAbsentLecturer(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">
              Select Lecturer
            </option>

            {lecturers.map(name => (
              <option key={name}>
                {name}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* Recommendations */}

      <div className="border-t p-5">

        <h4 className="mb-4 text-lg font-bold">
          Recommended Substitute Lecturers
        </h4>

        {recommendations.map((name, index) => {

  const today = todayLoads[name] || 0
  const weekly = workloads[name] || 0

  let badge = '🟢 Excellent Choice'

  if (today >= 3)
    badge = '🟡 Moderate Load'

  if (today >= 5)
    badge = '🔴 Heavy Today'

  return (

    <div
      key={name}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >

      <div className="flex items-center justify-between">

        <span className="text-3xl">

          {index === 0
            ? '🥇'
            : index === 1
              ? '🥈'
              : index === 2
                ? '🥉'
                : '🏅'}

        </span>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          {badge}
        </span>

      </div>

      <h4 className="mt-4 text-lg font-bold text-slate-800">
        {name}
      </h4>

      <div className="mt-4 space-y-2 text-sm">

        <div className="flex justify-between">
          <span>🟢 Status</span>
          <strong>Available</strong>
        </div>

        <div className="flex justify-between">
          <span>📅 Today Load</span>
          <strong>{today}</strong>
        </div>

        <div className="flex justify-between">
          <span>📚 Weekly Load</span>
          <strong>{weekly}</strong>
        </div>

      </div>

    </div>

  )

})}

      </div>

    </div>
  )
}