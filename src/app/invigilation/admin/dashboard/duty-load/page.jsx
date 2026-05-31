//src/app/invigilation/admin/dashboard/duty-load/page.jsx
'use client'

import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'
// import DutyLoadDashboard from '../DutyLoadDashboard'
import dynamic from 'next/dynamic'
const DutyLoadDashboard = dynamic(() => import('../DutyLoadDashboard'), {
  ssr: false,
  loading: () => <div className="p-6 text-sm text-slate-500">Loading dashboard...</div>
})
export default function DutyLoadPage() {
  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell
          user={user}
          title="Duty Load Dashboard"
        >
          <div className="space-y-6 p-6">

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Lecturer Duty Load Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor invigilation duty distribution
              </p>
            </div>

            <DutyLoadDashboard />

          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}