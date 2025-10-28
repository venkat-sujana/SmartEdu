//app/components/groupwise-attendance-table/page.jsx
'use client'
import { useEffect, useState } from 'react'
import { Users2, CalendarDays, Printer } from 'lucide-react'

const groupIcons = {
  MPC: <span className="text-xl text-blue-500">📘</span>,
  BiPC: <span className="text-xl text-fuchsia-700">🧬</span>,
  CEC: <span className="text-xl text-amber-800">💼</span>,
  HEC: <span className="text-xl text-orange-800">🍽️</span>,
  'M&AT': <span className="text-xl text-indigo-700">🧮</span>,
  MLT: <span className="text-xl text-emerald-600">🧪</span>,
  CET: <span className="text-xl text-gray-600">⚙️</span>,
}

export default function GroupWiseAttendanceTable({ collegeId, collegeName, initialDate }) {
  const [data, setData] = useState({})
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    if (!collegeId || !selectedDate) return
    async function fetchData() {
      const res = await fetch(
        `/api/attendance/group-wise-today?collegeId=${collegeId}&date=${selectedDate}`
      )
      const result = await res.json()
      setData(result.groupWise || {})
    }
    fetchData()
  }, [collegeId, selectedDate])

  const handlePrint = () => window.print()

  return (
    <div className="p-1 md:p-4 print:bg-white print:p-0">
      {/* Responsive Header & Filter */}
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-green-100 px-3 py-2 text-lg font-bold text-blue-900 shadow sm:flex-row md:w-auto md:text-xl">
          <Users2 className="h-6 w-6 text-cyan-700" />
          <span className="max-w-[120px] truncate sm:max-w-xs">{collegeName}</span>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              className="rounded border border-gray-300 px-2 py-1 text-base font-semibold focus:outline-blue-500"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ minWidth: 0, width: '100%' }}
            />
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-bold text-white shadow hover:bg-blue-700 md:w-auto"
        >
          <Printer className="h-5 w-5" />
          Print
        </button>
      </div>

      {/* Main Group Cards */}
      {Object.entries(data).map(([group, yearData]) => (
        <div className="mb-3 w-full rounded-2xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-emerald-50 p-1 shadow md:mb-6 md:p-3">
          <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-blue-800 md:text-lg">
            {groupIcons[group] || <span className="text-xl text-blue-500">📘</span>} {group}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px] border-collapse rounded-lg bg-white text-xs md:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-200 via-green-200 to-purple-100 text-xs tracking-tight text-gray-900 md:text-sm">
                  <th className="border px-1 py-1 text-left md:px-3 md:py-2">Year</th>
                  <th className="border px-1 py-1 text-center md:px-3 md:py-2">✅</th>
                  <th className="border px-1 py-1 text-center md:px-3 md:py-2">❌</th>
                  <th className="border px-1 py-1 text-center md:px-3 md:py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(yearData).map(([year, stats], idx) => (
                  <tr
                    key={`${group}-${year}`}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                  >
                    <td className="max-w-[90px] truncate border px-1 py-1 font-bold text-blue-800 md:px-3 md:py-2">
                      {year}
                      <div className="mt-0.5 text-xs font-medium text-gray-500">
                        Lecturer: <span className="text-blue-700">{stats.lecturerName || '—'}</span>
                      </div>
                    </td>
                    <td className="border px-1 py-1 text-center font-bold text-green-700 md:px-3 md:py-2">
                      {stats.present}
                    </td>
                    <td className="border px-1 py-1 text-center font-bold text-red-700 md:px-3 md:py-2">
                      {stats.absent}
                    </td>
                    <td className="border px-1 py-1 text-center font-bold text-blue-700 md:px-3 md:py-2">
                      {stats.percent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
