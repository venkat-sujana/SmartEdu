'use client'

import { useSession } from 'next-auth/react'
import { canLecturerAccessGroup } from '@/lib/lecturerGroupAccess'
import GroupDashboardSectionPage from './GroupDashboardSectionPage'

export default function RestrictedGroupSectionPage(props) {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">Checking dashboard access...</p>
      </div>
    )
  }

  if (session?.user?.role === 'lecturer' && !canLecturerAccessGroup(session, props.groupName)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-900">Access restricted</p>
          <p className="mt-2 text-sm text-slate-600">
            You can only view attendance dashboards for your assigned group.
          </p>
        </div>
      </div>
    )
  }

  return <GroupDashboardSectionPage {...props} />
}
