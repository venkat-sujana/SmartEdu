//app/attendance-records
'use client'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Link from 'next/link'

import { useSession } from 'next-auth/react'
import {
  FileDown, FileSpreadsheet, Printer, Table2, School, Gauge, Users2
} from 'lucide-react'

export default function AttendanceRecords() {
  const [records, setRecords] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [group, setGroup] = useState('')

  const { data: session } = useSession()
  console.log('SESSION: ', session)

  const [collegeId, setCollegeId] = useState('')
  const [collegeName, setCollegeName] = useState('')

  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId)
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName)
    }
  }, [session])

  const [attendanceData, setAttendanceData] = useState({
    'First Year': [],
    'Second Year': [],
  })

  const [yearOfStudy, setYearOfStudy] = useState('')

  const groups = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']

  const firstYearData = attendanceData['First Year'] || []
  const secondYearData = attendanceData['Second Year'] || []

  const combinedData = [...firstYearData, ...secondYearData]

  const totalPresent = combinedData.reduce((acc, item) => acc + (item.present || 0), 0)
  const totalAbsent = combinedData.reduce((acc, item) => acc + (item.absent || 0), 0)
  const totalAll = totalPresent + totalAbsent

  const collegePercentage = totalAll > 0 ? ((totalPresent / totalAll) * 100).toFixed(2) : 0

  const fetchAttendanceRecords = async () => {
    const query = `start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}&group=${encodeURIComponent(group)}&year=${encodeURIComponent(yearOfStudy)}`

    try {
      const url = `/api/attendance/summary/daily-group?${query}`
      console.log('Requesting:', url) // ✅ Debug
      const res = await fetch(url)
      const json = await res.json()
      console.log('Response JSON:', json) // ✅ Debug

      setAttendanceData({
        'First Year': json.data?.['First Year'] || [],
        'Second Year': json.data?.['Second Year'] || [],
      })
      console.log('Attendance Data:', json.data) // ✅ Debug
    } catch (error) {
      console.error('Error fetching attendance records:', error) // ✅ Check here
    }
  }

  // Encode before fetch
  const query = new URLSearchParams({
    startDate,
    endDate,
    group,
    yearOfStudy,
  }).toString()

  const res = fetch(`/api/attendance/summary/daily-group?${query}`)

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-6xl p-4">
    <div className="mb-4 flex items-center gap-3 justify-center rounded border border-blue-200 bg-blue-50 px-4 py-2 font-bold text-blue-800 shadow-sm text-2xl">
      <School className="w-8 h-8 mr-1 text-indigo-500" /> {collegeName || 'Loading...'}
    </div>
    <p className="mb-2 text-sm flex items-center gap-2">
      <Gauge className="inline w-4 h-4 text-green-700" />
      <span className="font-semibold">Generated:</span>
      {today} &nbsp; | &nbsp; {new Date().toLocaleTimeString()}
    </p>
    {/* Filters */}
    <div className="mb-6 flex flex-wrap gap-4">
      {/* ...Date, Group, Year select [same as before] */}
      <div className="flex items-end">
        <button
          onClick={fetchAttendanceRecords}
          className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-white flex items-center gap-2 font-semibold"
        >
          <FileSpreadsheet className="w-5 h-5" /> Apply Filters
        </button>
      </div>
    </div>
    {/* Export/Print Buttons */}
    <div className="mb-4 flex flex-wrap gap-2">
      <button
        onClick={() => window.print()}
        className="cursor-pointer rounded bg-green-600 px-4 py-2 text-white flex items-center gap-2"
      >
        <Printer className="inline w-5 h-5" /> Print Table
      </button>
      {/* FileDown can be used for future Excel/PDF export */}
    </div>
    {/* Print Style and main data */}
    <style jsx global>{`
      @media print { /* ...print styles same as before */ }
    `}</style>
    <div className="print-area">
      <div className="mb-6 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Table2 className="w-6 h-6 text-blue-700" />
          <span className="text-lg font-bold">Attendance as on {today}</span>
        </div>
      </div>
      {/* All tables/attendanceData as before */}
      <div className="space-y-8">
        {/* First Year Table */}
        <div>
          <h2 className="mb-2 flex items-center text-lg font-semibold text-blue-700 gap-2">
            <Users2 className="w-5 h-5 text-blue-500" /> 📘 First Year Attendance
          </h2>
          {/* ...table as before */}
        </div>
        {/* Second Year Table */}
        <div>
          <h2 className="mb-2 flex items-center text-lg font-semibold text-green-700 gap-2">
            <Users2 className="w-5 h-5 text-green-500" /> 📗 Second Year Attendance
          </h2>
          {/* ...table as before */}
        </div>
      </div>
      {/* College Total Attendance Row */}
      <table className="mt-4 w-full table-auto border">
        <tbody>
          <tr className="bg-green-100 font-semibold">
            <td colSpan={2} className="border px-4 py-2 text-right flex items-center gap-2 justify-end">
              <Gauge className="w-5 h-5 text-lime-700" /> College Total Attendance
            </td>
            <td className="border px-4 py-2">{totalPresent}</td>
            <td className="border px-4 py-2">{totalAbsent}</td>
            <td className="border px-4 py-2">{totalAll}</td>
            <td className="border px-4 py-2">{collegePercentage}%</td>
          </tr>
        </tbody>
      </table>
    </div>
    {/* Footer/Notes */}
    <div className="text-center mt-5">
      <p className="text-xs font-semibold text-gray-500">
        Note: This is a computer-generated report and does not require a signature.<br />
        For any discrepancies, please contact the administration.
      </p>
    </div>
  </div>
  )
}
