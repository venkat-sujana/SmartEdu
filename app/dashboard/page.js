//app/dashboard/second-year/page.js

'use client'
import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Link from 'next/link'

import { Users, FileDown, FileSpreadsheet, Plus, Pencil, Trash2, Printer } from 'lucide-react'
// import GenderWiseChart from "./components/GenderWiseChart";
// import CasteWiseChart from "./components/CasteWisechart";
// import AdmissionCharts from "./components/AdmissionCharts";

export default function GroupDashboard() {
  const [students, setStudents] = useState([])
  const [groupCounts, setGroupCounts] = useState([])
  const [casteCounts, setCasteCounts] = useState([])
  const [genderCounts, setGenderCounts] = useState([])
  const [admissionYearCounts, setAdmissionYearCounts] = useState([])
  const [dateWiseCounts, setDateWiseCounts] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/students')
      const data = await res.json()
      const studentData = data.data || []

      setStudents(studentData)
      setTotal(studentData.length)

      setGroupCounts(getCounts(studentData, 'group'))
      setCasteCounts(getCounts(studentData, 'caste'))
      setGenderCounts(getCounts(studentData, 'gender'))
      setAdmissionYearCounts(getCounts(studentData, 'admissionYear'))
      setDateWiseCounts(getDateWiseCounts(studentData))
    }

    fetchData()
  }, [])

  const getCounts = (data, field) => {
    const counts = {}
    data.forEach(student => {
      const key = student[field] || 'Unknown'
      counts[key] = (counts[key] || 0) + 1
    })

    return Object.entries(counts).map(([key, count]) => ({
      key,
      count,
    }))
  }

  const getDateWiseCounts = data => {
    const counts = {}

    data.forEach(student => {
      if (student.createdAt && student.group) {
        const dateObj = new Date(student.createdAt)
        if (!isNaN(dateObj.getTime())) {
          const date = dateObj.toLocaleDateString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          const group = student.group
          const key = `${date}__${group}` // Combine with separator
          counts[key] = (counts[key] || 0) + 1
        }
      }
    })

    // Convert counts object to array of objects
    const sortedEntries = Object.entries(counts).sort((a, b) => {
      const dateA = new Date(a[0].split('__')[0])
      const dateB = new Date(b[0].split('__')[0])
      return dateA - dateB
    })

    return sortedEntries.map(([key, count]) => {
      const [date, group] = key.split('__')
      return {
        key: `${date} - ${group}`, // Final display key: Date - Group
        count,
      }
    })
  }

  const exportToPDF = (title, data) => {
    const doc = new jsPDF()
    doc.text(title, 14, 16)
    autoTable(doc, {
      head: [['S.No', title.split(' ')[0], 'Count']],
      body: data.map((item, idx) => [idx + 1, item.key, item.count]),
    })
    doc.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`)
  }

  const exportToExcel = (title, data) => {
    const ws = XLSX.utils.json_to_sheet(
      data.map((item, idx) => ({
        SNo: idx + 1,
        [title.split(' ')[0]]: item.key,
        Count: item.count,
      }))
    )
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, title)
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_').toLowerCase()}.xlsx`)
  }

  const renderTable = (title, data) => {
    const totalCount = data.reduce((sum, item) => sum + item.count, 0)

    return (
      <div className="mb-10 rounded-lg border bg-white p-4 shadow">
        <h3 className="mb-4 text-center text-lg font-semibold">
          🧑‍🎓🧑‍🎓🧑‍🎓
          <Users className="mr-2 inline" />
          {title}
        </h3>

        {data.length === 0 ? (
          <p className="text-center font-medium text-red-500">No data found</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="border px-4 py-2 text-left font-bold">S.No</th>
                    <th className="border px-4 py-2 text-left font-bold">{title.split(' ')[0]}</th>
                    <th className="border px-4 py-2 text-left font-bold">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.key} className="border-t">
                      <td className="border px-4 py-2 font-bold">{idx + 1}</td>
                      <td className="border px-4 py-2 font-bold">{item.key}</td>
                      <td className="border px-4 py-2 font-bold">{item.count}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-blue-100 font-semibold">
                    <td className="border px-4 py-2 text-center font-bold" colSpan={2}>
                      Total
                    </td>
                    <td className="border px-4 py-2 font-bold">{totalCount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex justify-end space-x-2 print:hidden">
              <button
                onClick={() => exportToPDF(title, data)}
                className="cursor-pointer rounded border-b-2 border-b-black bg-red-500 px-3 py-1 font-bold text-white hover:bg-red-600"
              >
                <FileDown className="mr-2 inline" size={16} />
                Export to PDF
              </button>
              <button
                onClick={() => exportToExcel(title, data)}
                className="cursor-pointer rounded border-b-2 border-b-black bg-green-500 px-3 py-1 font-bold text-white hover:bg-green-600"
              >
                <FileSpreadsheet className="mr-2 inline" size={16} />
                Export to Excel
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <a
        href="https://advanced-question-paper-tailwindcss.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Visit Question Paper Generator App
      </a>
      &emsp;&emsp;
      <a
        href="https://skr-learn-portal.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Visit skr learn portal App
      </a>
      &emsp;&emsp;
      <a
        href="https://contract-salary-app.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Visit skr contract salary portal App
      </a>
      &emsp;&emsp;
      <a
        href="https://skr-study-certificate.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:textStrength-blue-800"
      >
        Visit Study Certificate App
      </a>
      {renderTable('Group-Wise Strength-blue-800"', groupCounts)}
      {renderTable('Caste-Wise Strength-blue-800"', casteCounts)}
      {renderTable('Gender-Wise Strength-blue-800"', genderCounts)}
      {renderTable('Year-Wise Strength-blue-800"', admissionYearCounts)}
      <div className="flex justify-end">
        <button
          onClick={() => window.print()}
          className="cursor-pointer rounded border-b-2 border-b-black bg-purple-600 px-4 py-2 font-bold text-white hover:bg-purple-700 print:hidden"
        >
          <Printer className="mr-2 inline" size={16} />
          Print All Tables
        </button>
      </div>
      {/* <AdmissionCharts />
      <GenderWiseChart />
      <CasteWiseChart /> */}
    </div>
  )
}
