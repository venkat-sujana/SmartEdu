//src/app/dashboard/page.jsx

'use client'
import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Users, BookOpen, UserCheck, CalendarDays, Printer, FileText } from 'lucide-react'

const TABLE_CONFIG = [
  {
    key: 'group',
    title: 'Group-Wise Strength',
    icon: BookOpen,
    accent: 'blue',
  },
  {
    key: 'caste',
    title: 'Caste-Wise Strength',
    icon: Users,
    accent: 'violet',
  },
  {
    key: 'gender',
    title: 'Gender-Wise Strength',
    icon: UserCheck,
    accent: 'emerald',
  },
  {
    key: 'admissionYear',
    title: 'Admission Year-Wise Strength',
    icon: CalendarDays,
    accent: 'amber',
  },
]

const ACCENT = {
  blue:    { header: 'bg-blue-700',   badge: 'bg-blue-50 text-blue-700 border-blue-200',   icon: 'bg-blue-100 text-blue-700' },
  violet:  { header: 'bg-violet-700', badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'bg-violet-100 text-violet-700' },
  emerald: { header: 'bg-emerald-700',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bg-emerald-100 text-emerald-700' },
  amber:   { header: 'bg-amber-600',  badge: 'bg-amber-50 text-amber-700 border-amber-200', icon: 'bg-amber-100 text-amber-700' },
}

function StatTable({ title, icon: Icon, accent, data }) {
  const total = data.reduce((sum, { count }) => sum + count, 0)
  const { header, badge, icon } = ACCENT[accent]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Table Header */}
      <div className={`${header} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Icon className="h-4 w-4 text-white" />
          </span>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        </div>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
          Total: {total}
        </span>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                S.No
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Category
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Count
              </th>
              <th className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No data available
                </td>
              </tr>
            ) : (
              data.map(({ key, count }, idx) => {
                const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
                return (
                  <tr
                    key={key}
                    className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{key}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
                        {count}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${header}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{percent}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function GroupDashboard() {
  const [counts, setCounts] = useState({ group: [], caste: [], gender: [], admissionYear: [] })
  const [selectedYear, setSelectedYear] = useState('First Year')
  const [loading, setLoading] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const { data: session } = useSession()
  const collegeName = session?.user?.collegeName || ''
  const reportRef = useRef(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.collegeId) return
      setLoading(true)
      try {
        const res = await fetch(
          `/api/students?collegeId=${session.user.collegeId}&status=all&limit=500`
        )
        const data = await res.json()
        const filtered = (data.data || []).filter(s => s.yearOfStudy === selectedYear)

        const getCounts = field => {
          const map = {}
          filtered.forEach(s => {
            const k = s[field] || 'Unknown'
            map[k] = (map[k] || 0) + 1
          })
          return Object.entries(map).map(([key, count]) => ({ key, count }))
        }

        setCounts({
          group: getCounts('group'),
          caste: getCounts('caste'),
          gender: getCounts('gender'),
          admissionYear: getCounts('admissionYear'),
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [session?.user?.collegeId, selectedYear])

  const handlePrint = () => {
    if (!reportRef.current) return

    const printWindow = window.open('', '', 'width=1200,height=900')
    if (!printWindow) return

    const reportTitle = `${collegeName || 'Student Statistics'} - ${selectedYear}`

    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
            }
            .report-shell {
              width: 100%;
            }
            .report-heading {
              margin-bottom: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 16px 20px;
            }
            .report-heading p {
              margin: 0 0 6px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #64748b;
            }
            .report-heading h1 {
              margin: 0;
              font-size: 22px;
            }
            .report-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 16px;
            }
            .report-card {
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .report-card-header {
              padding: 12px 16px;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-weight: 700;
            }
            .report-card-header.blue { background: #1d4ed8; }
            .report-card-header.violet { background: #6d28d9; }
            .report-card-header.emerald { background: #047857; }
            .report-card-header.amber { background: #d97706; }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border-bottom: 1px solid #e2e8f0;
              padding: 10px 12px;
              font-size: 13px;
              text-align: left;
            }
            th {
              background: #f8fafc;
              color: #475569;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.04em;
            }
            td.center, th.center { text-align: center; }
            .empty-state {
              padding: 24px;
              text-align: center;
              color: #94a3b8;
            }
            @media print {
              body { padding: 12px; }
              .report-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
          </style>
        </head>
        <body>${reportRef.current.innerHTML}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  const handleExportPDF = async () => {
    if (exportingPdf) return

    setExportingPdf(true)

    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const usableWidth = pageWidth - 20
      const reportTitle = collegeName || 'Student Statistics'

      pdf.setFontSize(16)
      pdf.text(reportTitle, 10, 14)
      pdf.setFontSize(11)
      pdf.text(`Student Statistics Report - ${selectedYear}`, 10, 21)

      let cursorY = 28

      TABLE_CONFIG.forEach(({ key, title, accent }, index) => {
        const accentMap = {
          blue: [29, 78, 216],
          violet: [109, 40, 217],
          emerald: [4, 120, 87],
          amber: [217, 119, 6],
        }
        const rows = counts[key] || []
        const total = rows.reduce((sum, item) => sum + item.count, 0)

        if (index > 0) {
          cursorY = (pdf.lastAutoTable?.finalY || cursorY) + 12
        }

        if (cursorY > 250) {
          pdf.addPage()
          cursorY = 16
        }

        pdf.setFillColor(...accentMap[accent])
        pdf.roundedRect(10, cursorY - 6, usableWidth, 8, 2, 2, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(12)
        pdf.text(`${title}  |  Total: ${total}`, 14, cursorY)
        pdf.setTextColor(15, 23, 42)

        autoTable(pdf, {
          startY: cursorY + 4,
          head: [['S.No', 'Category', 'Count', 'Share']],
          body:
            rows.length > 0
              ? rows.map(({ key: category, count }, rowIndex) => {
                  const percent = total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0.0%'
                  return [rowIndex + 1, category, count, percent]
                })
              : [['', 'No data available', '', '']],
          theme: 'grid',
          headStyles: {
            fillColor: [241, 245, 249],
            textColor: [71, 85, 105],
          },
          styles: {
            fontSize: 10,
            cellPadding: 2.5,
            textColor: [15, 23, 42],
            overflow: 'linebreak',
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 18 },
            1: { cellWidth: 90 },
            2: { halign: 'center', cellWidth: 28 },
            3: { halign: 'center', cellWidth: 28 },
          },
          margin: { left: 10, right: 10 },
        })
      })

      const safeCollegeName = (collegeName || 'student-statistics')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/(^-|-$)/g, '')
        .toLowerCase()

      pdf.save(`${safeCollegeName}-${selectedYear.replace(/\s+/g, '-').toLowerCase()}-dashboard.pdf`)
    } finally {
      setExportingPdf(false)
    }
  }

  return (
    <div className="w-full space-y-4 bg-white p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Student Statistics
          </p>
          <h1 className="text-lg font-bold text-slate-900">{collegeName || 'Loading...'}</h1>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>

          <button
            onClick={handleExportPDF}
            disabled={exportingPdf}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileText className="h-4 w-4" />
            {exportingPdf ? 'Exporting...' : 'Export PDF'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      <div ref={reportRef} className="report-shell">
        <div className="report-heading hidden print:block">
          <p>Student Statistics</p>
          <h1>{collegeName || 'Loading...'}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            Loading...
          </div>
        ) : (
          <div className="report-grid grid grid-cols-1 gap-4 md:grid-cols-2">
            {TABLE_CONFIG.map(({ key, title, icon, accent }) => (
              <div key={key} className="report-card">
                <div className={`report-card-header ${accent} hidden print:flex`}>
                  <span>{title}</span>
                  <span>Total: {counts[key].reduce((sum, item) => sum + item.count, 0)}</span>
                </div>
                <div className="print:hidden">
                  <StatTable
                    title={title}
                    icon={icon}
                    accent={accent}
                    data={counts[key]}
                  />
                </div>
                <div className="hidden print:block">
                  <table>
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Category</th>
                        <th className="center">Count</th>
                        <th className="center">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {counts[key].length === 0 ? (
                        <tr>
                          <td colSpan={4} className="empty-state">No data available</td>
                        </tr>
                      ) : (
                        counts[key].map(({ key: category, count }, idx) => {
                          const total = counts[key].reduce((sum, item) => sum + item.count, 0)
                          const percent =
                            total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0.0%'

                          return (
                            <tr key={category}>
                              <td>{idx + 1}</td>
                              <td>{category}</td>
                              <td className="center">{count}</td>
                              <td className="center">{percent}</td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
