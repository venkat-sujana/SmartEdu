// app/components/EditableTimeTable.jsx
'use client'
import { useState, useRef, useMemo } from 'react'
import { SUBJECT_LECTURERS } from '../../lib/lecturers'



// ---------------- CONSTANTS ----------------
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MIN_PERIODS = 16
const MAX_PERIODS = 18


const SUBJECTS = {
  general: [
    '',
    'Maths',
    'Physics',
    'Chemistry',
    'Physics Practicals',
    'Chemistry Practicals',
    'Botany',
    'Botany Practicals',
    'Zoology',
    'Zoology Practicals',
    'Civics',
    'Economics',
    'History',
    'Commerce',
    'English',
    'Telugu',
    'Sanskrit',
    'Hindi',
    'Study Hour',
  ],
  vocational: [
    '',
    'English',
    'GFC',
    'V1',
    'V1 Practicals',
    'V2',
    'V2 Practicals',
    'V3',
    'V3 Practicals',
    'V4',
    'V4 Practicals',
    'V5',
    'V5 Practicals',
    'V6',
    'V6 Practicals',
    'Study Hour',
    'Bridge Course',
  ],
}

const COLUMNS = [
  { label: '9:10 - 10:00', type: 'period' },
  { label: '10:00 - 10:50', type: 'period' },
  { label: 'BREAK', type: 'break' },
  { label: '11:00 - 11:50', type: 'period' },
  { label: '11:50 - 12:40', type: 'period' },
  { label: 'LUNCH', type: 'lunch' },
  { label: '1:20 - 2:10', type: 'period' },
  { label: '2:10 - 3:00', type: 'period' },
  { label: '3:10 - 4:00', type: 'period' },
  { label: '4:00 - 5:00', type: 'period' },
]

// ---------------- WORKLOAD CALCULATION ----------------
function calculateLecturerWorkload(table) {
  const workload = {}

  table.forEach(dayRow => {
    dayRow.forEach(subject => {
      if (!subject) return

      const lecturer = SUBJECT_LECTURERS[subject]
      if (!lecturer) return

      if (!workload[lecturer]) {
        workload[lecturer] = {
          lecturer,
          theory: 0,
          practical: 0,
          total: 0,
        }
      }

      if (subject.toLowerCase().includes('practical')) {
        workload[lecturer].practical += 1
      } else {
        workload[lecturer].theory += 1
      }

      workload[lecturer].total += 1
    })
  })

  return Object.values(workload)
}

// ---------------- WORKLOAD UI ----------------
function LecturerWorkloadReport({ data }) {
  if (!data.length) return null

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-xl font-bold text-blue-900 text-center">
        Lecturer Workload Report
      </h3>

      <table className="w-full border border-black border-collapse">
        <thead className="bg-blue-700 text-white">
          <tr>
            <th className="border p-2">Lecturer</th>
            <th className="border p-2">Theory</th>
            <th className="border p-2">Practical</th>
            <th className="border p-2">Total / Week</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.lecturer} className="text-center even:bg-blue-50">
              <td className="border p-2 font-semibold">{row.lecturer}</td>
              <td className="border p-2">{row.theory}</td>
              <td className="border p-2">{row.practical}</td>
              <td className="border p-2 font-bold">{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ---------------- MAIN COMPONENT ----------------
export default function EditableTimeTable({ title, stream = 'general' }) {
  const [editing, setEditing] = useState(null)
  const printRef = useRef(null)

  const [table, setTable] = useState(
    DAYS.map(() => COLUMNS.map(c => (c.type === 'period' ? '' : c.label)))
  )

  const workloadData = useMemo(
    () => calculateLecturerWorkload(table),
    [table]
  )

  const updateCell = (d, p, value) => {
    const copy = [...table]
    copy[d][p] = value
    setTable(copy)
  }

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const original = document.body.innerHTML
    document.body.innerHTML = content
    window.print()
    document.body.innerHTML = original
    window.location.reload()
  }

  return (
    <div className="mt-12">
      {/* Print Button */}
      <div className="no-print mb-2 flex justify-end">
        <button
          onClick={handlePrint}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800"
        >
          🖨 Print / PDF
        </button>
      </div>

      <div ref={printRef} className="overflow-x-auto">
        <h2 className="mb-4 text-center text-2xl font-bold text-blue-800">
          {title}
        </h2>

        <table className="w-full min-w-[1100px] border-collapse border border-black">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border p-2">Day</th>
              {COLUMNS.map((c, i) => (
                <th key={i} className="border p-2 text-sm whitespace-pre-line">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map((day, dIndex) => (
              <tr key={day} className="even:bg-blue-50">
                <td className="border p-2 font-semibold">{day}</td>

                {COLUMNS.map((c, pIndex) => (
                  <td
                    key={pIndex}
                    className={`border p-2 text-center ${
                      c.type === 'break'
                        ? 'bg-gray-300 font-bold'
                        : c.type === 'lunch'
                        ? 'bg-gray-400 font-bold'
                        : 'cursor-pointer'
                    }`}
                    onClick={() =>
                      c.type === 'period' && setEditing({ dIndex, pIndex })
                    }
                  >
                    {c.type === 'period' ? (
                      editing?.dIndex === dIndex &&
                      editing?.pIndex === pIndex ? (
                        <select
                          autoFocus
                          value={table[dIndex][pIndex]}
                          onChange={e => {
                            updateCell(dIndex, pIndex, e.target.value)
                            setEditing(null)
                          }}
                          onBlur={() => setEditing(null)}
                          className="w-full rounded border bg-white text-center"
                        >
                          {SUBJECTS[stream].map(sub => (
                            <option key={sub} value={sub}>
                              {sub || 'Select'}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{table[dIndex][pIndex] || 'Select'}</span>
                      )
                    ) : (
                      table[dIndex][pIndex]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 🔽 WORKLOAD REPORT */}
        <LecturerWorkloadReport data={workloadData} />
      </div>
    </div>
  )
}
