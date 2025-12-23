
//app/dashboard/page.jsx
'use client'
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { Users, FileDown, FileSpreadsheet, Printer } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function GroupDashboard() {
  const [students, setStudents] = useState([])
  const [groupCounts, setGroupCounts] = useState([])
  const [casteCounts, setCasteCounts] = useState([])
  const [genderCounts, setGenderCounts] = useState([])
  const [admissionYearCounts, setAdmissionYearCounts] = useState([])
  const [total, setTotal] = useState(0)
  const [selectedYear, setSelectedYear] = useState('First Year')
  const { data: session } = useSession()
  const [collegeId, setCollegeId] = useState('')
  const [collegeName, setCollegeName] = useState('')

  useEffect(() => {
    if (session?.user?.collegeId) setCollegeId(session.user.collegeId)
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName)
  }, [session])

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.collegeId) return;
      const res = await fetch('/api/students')
      const data = await res.json()
      const studentData = data.data || []

      // Yearwise filter
      const filteredData = studentData.filter(
        student =>
          student.yearOfStudy === selectedYear &&
          student.collegeId === session.user.collegeId
      )
      setStudents(filteredData)
      setTotal(filteredData.length)
      setGroupCounts(getCounts(filteredData, 'group'))
      setCasteCounts(getCounts(filteredData, 'caste'))
      setGenderCounts(getCounts(filteredData, 'gender'))
      setAdmissionYearCounts(getCounts(filteredData, 'admissionYear'))
    }
    fetchData()
  }, [session?.user?.collegeId, selectedYear])

  const getCounts = (data, field) => {
    const counts = {}
    data.forEach(student => {
      const key = student[field] || 'Unknown'
      counts[key] = (counts[key] || 0) + 1
    })
    return Object.entries(counts).map(([key, count]) => ({ key, count }))
  }

  // Helper to render a table for a given title and data
  const renderTable = (title, data) => (
    <div className="mb-6">
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <table className="min-w-full border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2 border-b">Name</th>
            <th className="px-4 py-2 border-b">Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ key, count }) => (
            <tr key={key}>
              <td className="px-4 py-2 border-b">{key}</td>
              <td className="px-4 py-2 border-b">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
<div className="
  min-h-screen w-full
  bg-linear-to-tr from-[#c7d2fe] via-[#f1f5f9] to-[#a5b4fc]
  flex items-center justify-center
">
  <div className="mx-auto max-w-6xl p-6 bg-white/80 rounded-3xl shadow-2xl">
    {/* YEAR SELECTOR */}
    <div className="flex justify-center mb-4">
      <select value={selectedYear}
        onChange={e => setSelectedYear(e.target.value)}
        className="border rounded px-2 py-1 text-lg font-semibold">
        <option value="First Year">First Year</option>
        <option value="Second Year">Second Year</option>
      </select>
    </div>
    <div className="mb-4 flex items-center justify-center rounded border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-800 shadow-sm">
      <span className="font-semibold">🏫</span> {collegeName || 'Loading...'}
    </div>
    {renderTable('Group-Wise Strength', groupCounts)}
    {renderTable('Caste-Wise Strength', casteCounts)}
    {renderTable('Gender-Wise Strength', genderCounts)}
    {renderTable('Year-Wise Strength', admissionYearCounts)}
    <div className="flex justify-end">
      <button onClick={() => window.print()} className="rounded bg-purple-600 px-4 py-2 text-white font-bold">Print All Tables</button>
    </div>
  </div>
</div>

  )
}
