//app/attendance-records/monthly-summary/page.jsx
'use client'
import { useEffect, useState } from 'react'
import React from 'react'
import Link from 'next/link'
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

const groups = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']
const years = ['First Year', 'Second Year']

export default function MonthlySummary() {
  const [summaryData, setSummaryData] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { data: session } = useSession()

  const collegeName = session?.user?.collegeName || 'College'

  const filteredData = summaryData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const shortageFilteredData = filteredData.filter(student => {
    const totalPresent = months.reduce((sum, { label, year }) => {
      const key = `${label}-${year}`
      return sum + (student.present?.[key] || 0)
    }, 0)
    const totalWorking = months.reduce((sum, { label, year }) => {
      const key = `${label}-${year}`
      return sum + (student.workingDays?.[key] || 0)
    }, 0)
    const overallPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0
    return overallPercent < 75
  })

  useEffect(() => {
    if (!selectedGroup || !selectedYear) return

    const fetchData = async () => {
      console.log('Fetching data with:', {
        group: selectedGroup,
        yearOfStudy: selectedYear,
      })

      try {
        console.log(
          'Requesting:',
          `/api/attendance/monthly-summary?group=${encodeURIComponent(selectedGroup)}
        &yearOfStudy=${encodeURIComponent(selectedYear)}&collegeId=${session.user.collegeId}`
        )

        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(
            selectedGroup
          )}&yearOfStudy=${encodeURIComponent(selectedYear)}&collegeId=${session.user.collegeId}`
        )

        console.log('Response:', res)

        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status}`)
        }

        const data = await res.json()
        console.log('Data:', data)
        setSummaryData(data.data || [])
      } catch (error) {
        console.error('Fetch error:', error)
      }
    }

    fetchData()
  }, [selectedGroup, selectedYear])

  const handlePrint = () => {
    console.log('Printing...')
    const printContent = document.getElementById('print-area').innerHTML
    const printWindow = window.open('', '', 'width=1000,height=700')
    console.log('Print window:', printWindow)
    printWindow.document.write(`
      <html>
        <head>
          <title>Monthly Attendance</title>
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
    console.log('Print window document:', printWindow.document)
    printWindow.document.close()
    printWindow.print()
    console.log('Printed')
  }

  return (
    <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-white p-5 shadow-md">
        <select
          value={selectedGroup}
          onChange={e => setSelectedGroup(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Group</option>
          {groups.map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Year</option>
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 Search Student"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="min-w-[200px] flex-grow rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
        >
          {/* Assuming Printer is a valid React icon component */}
          <Printer size={18} />
          Print
        </button>
      </div>

      <h2 className="mb-6 text-center text-xl font-bold text-gray-800 md:text-2xl">
        {collegeName} 🧾 Central Attendance Register - 2025
      </h2>

      {/* Attendance Table */}
      <div id="print-area" className="overflow-x-auto rounded-lg bg-white shadow-lg">
        {filteredData.length === 0 ? (
          <p className="mt-4 py-6 text-center text-gray-500">No data available.</p>
        ) : (
          <table className="w-full table-auto border border-gray-400 font-sans text-sm">
            <thead className="bg-green-700 text-sm tracking-wide text-white uppercase">
              <tr>
                <th className="w-14 border border-gray-400 p-2 text-center">S.No</th>
                <th className="border border-gray-400 p-2 text-left">Name of Student</th>
                {months.map(({ label }) => (
                  <th key={label} className="border border-gray-400 p-2 text-center">
                    {label}
                  </th>
                ))}
                <th className="border border-gray-400 p-2 text-center">Total</th>
                <th className="border border-gray-400 p-2 text-center">Shortage (Days)</th>
                <th className="border border-gray-400 p-2 text-center">Status</th>
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
                    {/* 1️⃣ Working Days */}
                    <tr className="bg-gray-100 font-semibold text-gray-800">
                      <td className="border border-gray-400 text-center"></td>
                      <td className="border border-gray-400 px-2 py-1">Working Days</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        return (
                          <td key={key} className="border border-gray-400 text-center">
                            {student.workingDays?.[key] || 0}
                          </td>
                        )
                      })}
                      <td className="border border-gray-400 text-center font-bold">
                        {totalWorking}
                      </td>
                      <td className="border border-gray-400"></td>
                      <td className="border border-gray-400"></td>
                    </tr>

                    {/* 2️⃣ Present Days */}
                    <tr>
                      <td className="border border-gray-400 text-center font-semibold">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-400 px-2 py-1">{student.name}</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        return (
                          <td key={key} className="border border-gray-400 text-center">
                            {student.present?.[key] || 0}
                          </td>
                        )
                      })}
                      <td className="border border-gray-400 text-center font-bold">
                        {totalPresent}
                      </td>
                      <td className="border border-gray-400"></td>
                      <td className="border border-gray-400"></td>
                    </tr>

                    {/* 3️⃣ Percent + Shortage + Status */}
                    <tr className="bg-green-50 font-semibold text-gray-800">
                      <td className="border border-gray-400 text-center"></td>
                      <td className="border border-gray-400 px-2 py-1">Percent</td>
                      {months.map(({ label, year }) => {
                        const key = `${label}-${year}`
                        const present = student.present?.[key] || 0
                        const total = student.workingDays?.[key] || 0
                        const percent = total > 0 ? ((present / total) * 100).toFixed(0) : '-'
                        const isLow = total > 0 && percent < 75

                        return (
                          <td
                            key={key}
                            className={`border border-gray-400 text-center ${
                              isLow ? 'font-bold text-red-600' : ''
                            }`}
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
                          <span className="font-bold text-red-600">{shortage} days</span>
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

                    {/* Spacer Row */}
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
