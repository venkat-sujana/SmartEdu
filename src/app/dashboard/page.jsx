'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Users, BookOpen, UserCheck, CalendarDays, Printer } from 'lucide-react'

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
  const { data: session } = useSession()
  const collegeName = session?.user?.collegeName || ''

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

  return (
    <div className="w-full space-y-4 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Student Statistics
          </p>
          <h1 className="text-lg font-bold text-slate-900">{collegeName || 'Loading...'}</h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500"
          >
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-900"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          Loading...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {TABLE_CONFIG.map(({ key, title, icon, accent }) => (
            <StatTable
              key={key}
              title={title}
              icon={icon}
              accent={accent}
              data={counts[key]}
            />
          ))}
        </div>
      )}
    </div>
  )
}