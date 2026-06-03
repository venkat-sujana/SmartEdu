//src/app/invigilation/admin/dashboard/DutyLoadDashboard.jsx
'use client'
import { useEffect, useState } from 'react'
import { Users, Award } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function DutyLoadDashboard() {
  const [records, setRecords] = useState([])
  const [examTypes, setExamTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const res = await fetch('/api/invigilation/reports/duty-load', {
        cache: 'no-store',
      })

      const data = await res.json()

      setRecords(data.data || [])
      setExamTypes(data.examTypes || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalLecturers = records.length

  const totalDuties = records.reduce((sum, r) => sum + r.totalDuties, 0)

  const topLecturer = records.length > 0 ? records[0] : null

  const leastLecturer =
    records.length > 0 ? [...records].sort((a, b) => a.totalDuties - b.totalDuties)[0] : null

  const averageLoad = totalLecturers > 0 ? (totalDuties / totalLecturers).toFixed(2) : 0

  const lowCount = records.filter(r => r.totalDuties <= 2).length

  const mediumCount = records.filter(r => r.totalDuties > 2 && r.totalDuties <= 5).length

  const highCount = records.filter(r => r.totalDuties > 5).length

  const exportPDF = () => {
    const doc = new jsPDF('landscape')

    // Header
    doc.setFontSize(16)
    doc.text('OSRA INVIGILATION SYSTEM', 148, 15, { align: 'center' })

    doc.setFontSize(12)
    doc.text('Lecturer Duty Load Report', 148, 23, { align: 'center' })

    doc.setFontSize(10)

    doc.text(`Total Lecturers : ${totalLecturers}`, 14, 35)

    doc.text(`Total Duties : ${totalDuties}`, 14, 42)

    doc.text(`Generated On : ${new Date().toLocaleDateString()}`, 14, 49)

    // Table Header
    const head = [['Lecturer', ...examTypes, 'Total']]

    // Table Rows
    const body = records.map(row => [
      row.lecturerName,

      ...examTypes.map(type => row[type] || 0),

      row.totalDuties,
    ])

    autoTable(doc, {
      startY: 58,

      head,

      body,

      styles: {
        fontSize: 8,
        halign: 'center',
      },

      headStyles: {
        fillColor: [41, 128, 185],
      },

      columnStyles: {
        0: {
          halign: 'left',
        },
      },
    })

    doc.save(`Duty_Load_Report.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={exportPDF}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Export PDF
        </button>
      </div>

      {/* Summary Cards */}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <Users className="text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Total Lecturers</p>
              <h3 className="text-2xl font-bold">{totalLecturers}</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <Award className="text-green-600" />
            <div>
              <p className="text-sm text-slate-500">Total Duties Assigned</p>
              <h3 className="text-2xl font-bold">{totalDuties}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Highest Load</p>

          <h3 className="mt-2 text-lg font-bold">{topLecturer?.lecturerName || '-'}</h3>

          <p className="text-sm font-semibold text-red-600">
            {topLecturer?.totalDuties || 0} Duties
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Lowest Load</p>

          <h3 className="mt-2 text-lg font-bold">{leastLecturer?.lecturerName || '-'}</h3>

          <p className="text-sm font-semibold text-green-600">
            {leastLecturer?.totalDuties || 0} Duties
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Average Load</p>

          <h3 className="mt-2 text-2xl font-bold text-blue-700">{averageLoad}</h3>

          <p className="text-sm text-slate-500">Duties / Lecturer</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-green-50 p-5">
            <p className="text-sm text-green-700">Low Load</p>

            <h3 className="text-2xl font-bold text-green-800">{lowCount}</h3>

            <p className="text-xs text-green-600">Lecturers</p>
          </div>

          <div className="rounded-xl border bg-yellow-50 p-5">
            <p className="text-sm text-yellow-700">Medium Load</p>

            <h3 className="text-2xl font-bold text-yellow-800">{mediumCount}</h3>

            <p className="text-xs text-yellow-600">Lecturers</p>
          </div>

          <div className="rounded-xl border bg-red-50 p-5">
            <p className="text-sm text-red-700">High Load</p>

            <h3 className="text-2xl font-bold text-red-800">{highCount}</h3>

            <p className="text-xs text-red-600">Lecturers</p>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Lecturer</th>

              {examTypes.map(type => (
                <th key={type} className="px-4 py-3 text-center whitespace-nowrap">
                  {type}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-green-700">Available</th>

              <th className="px-4 py-3 text-center text-red-700">Unavailable</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Load</th>
            </tr>
          </thead>

          <tbody>
            {records.map((row, index) => (
              <tr key={row.lecturerId} className="border-t">
                <td className="px-4 py-3 font-medium">{row.lecturerName}</td>

                {examTypes.map(type => (
                  <td key={type} className="px-4 py-3 text-center">
                    {row[type] || 0}
                  </td>
                ))}

                
                <td className="px-4 py-3 text-center font-bold text-green-700">
                  {row.availableCount}
                </td>

                <td className="px-4 py-3 text-center font-bold text-red-700">
                  {row.unavailableCount}
                </td>
                <td className="px-4 py-3 text-center font-bold text-blue-700">{row.totalDuties}</td>


                <td className="px-4 py-3 text-center">
                  {row.totalDuties <= 2 ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Low
                    </span>
                  ) : row.totalDuties <= 5 ? (
                    <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                      Medium
                    </span>
                  ) : (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      High
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
