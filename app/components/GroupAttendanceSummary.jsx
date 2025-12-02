//app/components/GroupAttendanceSummary.jsx

'use client'
import React, { useEffect, useState } from 'react'
import { Printer } from 'lucide-react'
import { useSession } from 'next-auth/react'

const months = [
  { label: 'JUN', year: '2025' },
  { label: 'JUL', year: '2025' },
  { label: 'AUG', year: '2025' },
  { label: 'SEP', year: '2025' },
  { label: 'OCT', year: '2025' },
  { label: 'NOV', year: '2025' },
  { label: 'DEC', year: '2025' },
  { label: 'JAN', year: '2026' },
  { label: 'FEB', year: '2026' },
  { label: 'MAR', year: '2026' },
]

export default function GroupAttendanceSummary({ group, yearOfStudy, collegeName }) {
  const [summaryData, setSummaryData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()

  const filteredData = summaryData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    if (!group || !yearOfStudy || !session?.user?.collegeId) return

    const fetchData = async () => {
      try {
        console.log('Fetching data with:', {
          group: encodeURIComponent(group),
          yearOfStudy: encodeURIComponent(yearOfStudy),
          collegeId: session.user.collegeId,
        })
        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(group)}&yearOfStudy=${encodeURIComponent(yearOfStudy)}&collegeId=${session.user.collegeId}`
        )
        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`)
        const data = await res.json()
        console.log('Received data:', data)
        setSummaryData(data.data || [])
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchData()
  }, [group, yearOfStudy, session?.user?.collegeId])

  const handlePrint = () => {
    const printContent = document.getElementById(`print-area-${group}`).innerHTML
    const printWindow = window.open('', '', 'width=1000,height=700')
    printWindow.document.write(`
      <html>
        <head>
          <title>${collegeName} - ${group} Attendance</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 6px; text-align: center; font-size: 12px; }
            th { background-color: #16a34a; color: white; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  if (!group || !yearOfStudy) return <div>గ్రూప్ మరియు ఇయర్ select చేయండి</div>

  return (
    <div className="mb-8">
      {/* Group Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {group} - {yearOfStudy} Attendance
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Search student by name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-64 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div id={`print-area-${group}`} className="overflow-x-auto rounded-lg bg-white shadow-lg">
        <div className="mb-4 text-center text-xl font-bold text-gray-800 pt-6">
          {collegeName} <br />
          Central Attendance Register – {yearOfStudy} ({group})
        </div>

        {filteredData.length === 0 ? (
          <p className="py-12 text-center text-gray-500">No Data found</p>
        ) : (
          <table className="w-full table-auto border border-gray-400 font-sans text-sm">
            <thead className="bg-green-700 text-sm tracking-wide text-white uppercase">
              <tr>
                <th className="w-14 border border-gray-400 p-2 text-center">S.No</th>
                <th className="border border-gray-400 p-2 text-left">student name</th>
                {months.map(({ label }) => (
                  <th key={label} className="border border-gray-400 p-2 text-center">
                    {label}
                  </th>
                ))}
                <th className="border border-gray-400 p-2 text-center">Total</th>
                <th className="border border-gray-400 p-2 text-center">Shortage</th>
                <th className="border border-gray-400 p-2 text-center">sattus</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((student, idx) => {
                const totalPresent = months.reduce((sum, { label, year }) => {
                  const key = `${label}-${year}`
                  return sum + (student.present?.[key] || 0)
                }, 0)
                const totalWorking = months.reduce((sum, { label, year }) => {
                  const key = `${label}-${year}`
                  return sum + (student.workingDays?.[key] || 0)
                }, 0)
                const overallPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0
                const requiredDays = Math.ceil(totalWorking * 0.75)
                const shortage = requiredDays - totalPresent
                const isEligible = overallPercent >= 75

                return (
                  <React.Fragment key={idx}>
                    {/* Working Days */}
                    <tr className="bg-gray-100 font-semibold text-gray-800">
                      <td className="border border-gray-400 text-center"></td>
                      <td className="border border-gray-400 px-2 py-1">Working days</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        return (
                          <td key={key} className="border border-gray-400 text-center">
                            {student.workingDays?.[key] || 0}
                          </td>
                        )
                      })}
                      <td className="border border-gray-400 text-center font-bold">{totalWorking}</td>
                      <td className="border border-gray-400"></td>
                      <td className="border border-gray-400"></td>
                    </tr>

                    {/* Present Days */}
                    <tr>
                      <td className="border border-gray-400 text-center font-semibold">{idx + 1}</td>
                      <td className="border border-gray-400 px-2 py-1">{student.name}</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        return (
                          <td key={key} className="border border-gray-400 text-center">
                            {student.present?.[key] || 0}
                          </td>
                        )
                      })}
                      <td className="border border-gray-400 text-center font-bold">{totalPresent}</td>
                      <td className="border border-gray-400"></td>
                      <td className="border border-gray-400"></td>
                    </tr>

                    {/* Percent + Shortage + Status */}
                    <tr className="bg-green-50 font-semibold text-gray-800">
                      <td className="border border-gray-400 text-center"></td>
                      <td className="border border-gray-400 px-2 py-1">Percentage</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        const present = student.present?.[key] || 0
                        const total = student.workingDays?.[key] || 0
                        const percent = total > 0 ? ((present / total) * 100).toFixed(0) : '-'
                        const isLow = total > 0 && percent < 75
                        return (
                          <td
                            key={key}
                            className={`border border-gray-400 text-center ${isLow ? 'font-bold text-red-600' : ''}`}
                          >
                            {percent}%
                          </td>
                        )
                      })}
                      <td className="border border-gray-400 text-center font-bold">
                        {overallPercent.toFixed(0)}%
                      </td>
                      <td className="border border-gray-400 text-center">
                        {isEligible ? (
                          <span className="text-green-600">No shortage</span>
                        ) : (
                          <span className="font-bold text-red-600">{shortage}Days</span>
                        )}
                      </td>
                      <td className="border border-gray-400 text-center">
                        {isEligible ? (
                          <span className="font-bold text-green-700">Eligible ✅</span>
                        ) : (
                          <span className="font-bold text-red-700">Not Eligible ❌</span>
                        )}
                      </td>
                    </tr>

                    {/* Spacer */}
                    <tr>
                      <td colSpan={months.length + 6} className="h-3"></td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
