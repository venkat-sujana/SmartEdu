//src/app/invigilation/admin/analytics/page.jsx
'use client'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import { useEffect, useState } from 'react'
import AnalyticsDashboard from '@/app/invigilation/components/AnalyticsDashboard'
export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuties: 0,
    totalLecturers: 0,
    roomsUsed: 0,
    availableCount: 0,
    unavailableCount: 0,
    availabilityPercent: 0,
    examSummary: [],
    topLecturers: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/invigilation/reports/exam-analytics', {
        cache: 'no-store',
      })

      const data = await res.json()

      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
  <InvigilationGuard allowRoles={['admin']}>
    {user => {
      console.log('USER:', user)

      return (
        <InvigilationShell
          user={user}
          title="Exam Analytics"
        >
          <div className="bg-red-500 p-4 text-white">
            SHELL TEST
          </div>

          <AnalyticsDashboard
            stats={stats}
          />
        </InvigilationShell>
      )
    }}
  </InvigilationGuard>
)
}
