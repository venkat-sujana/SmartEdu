'use client'

import { useEffect, useState } from 'react'
import { Users2, CalendarDays, Printer } from 'lucide-react'

const groupIcons = {
  MPC: <span className="text-xl text-blue-500">M</span>,
  BiPC: <span className="text-xl text-fuchsia-700">B</span>,
  CEC: <span className="text-xl text-amber-800">C</span>,
  HEC: <span className="text-xl text-orange-800">H</span>,
  'M&AT': <span className="text-xl text-indigo-700">M</span>,
  MLT: <span className="text-xl text-emerald-600">L</span>,
  CET: <span className="text-xl text-gray-600">C</span>,
}

const allowedSessions = ['FN', 'AN']

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
      <div className="mb-6 flex w-full flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex w-full flex-col items-center gap-2 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-50 to-green-100 px-3 py-2 text-lg font-bold text-blue-900 shadow sm:flex-row md:w-auto md:text-xl">
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

      {Object.entries(data).map(([group, yearData]) => (
        <div
          key={group}
          className="mb-6 w-full rounded-2xl border-2 border-blue-100 bg-linear-to-r from-blue-50 to-emerald-50 p-1 shadow md:p-3"
        >
          <h2 className="mb-2 flex items-center gap-2 px-2 text-lg font-extrabold text-indigo-800 md:text-xl">
            {groupIcons[group] || <span className="text-xl text-blue-500">G</span>} {group}
          </h2>
          <div className="overflow-x-auto">
            <p className="mb-2 px-1 text-xs font-medium text-slate-600">
              Year shown below is the historical year saved in attendance records.
            </p>
            <table className="w-full min-w-[340px] border-collapse rounded-lg bg-white text-sm">
              <thead>
                <tr className="bg-linear-to-r from-blue-200 via-green-200 to-purple-100 text-gray-900">
                  <th className="border px-2 py-2 text-left">Historical Year</th>
                  <th className="border px-2 py-2 text-center">Session</th>
                  <th className="border px-2 py-2 text-center">Lecturer</th>
                  <th className="border px-2 py-2 text-center">Present</th>
                  <th className="border px-2 py-2 text-center">Absent</th>
                  <th className="border px-2 py-2 text-center">% Attendance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(yearData).map(([year, sessions]) =>
                  sessions
                    .filter(stats => allowedSessions.includes(stats.session || 'FN'))
                    .map((stats, idx) => (
                      <tr
                        key={`${group}-${year}-${stats.session || 'FN'}-${idx}`}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}
                      >
                        <td className="border px-2 py-2 font-semibold text-blue-800">{year}</td>
                        <td className="border px-2 py-2 text-center font-bold text-gray-700">
                          {stats.session || 'FN'}
                        </td>
                        <td className="border px-2 py-2 text-center font-medium text-indigo-700">
                          {stats.lecturerName || '-'}
                        </td>
                        <td className="border px-2 py-2 text-center font-bold text-green-700">
                          {stats.present}
                        </td>
                        <td className="border px-2 py-2 text-center font-bold text-red-700">
                          {stats.absent}
                        </td>
                        <td className="border px-2 py-2 text-center font-bold text-blue-700">
                          {stats.percent}%
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
