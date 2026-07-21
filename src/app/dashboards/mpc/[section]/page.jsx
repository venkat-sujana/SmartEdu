import { notFound } from 'next/navigation'
import RestrictedGroupSectionPage from '../../components/RestrictedGroupSectionPage'
import { getVisibleSections } from '../../components/groupDashboardConfig'

const config = {
  groupName: 'MPC',
  routeSegment: 'mpc',
  includeEditAttendance: true,
}

export default async function MPCSectionPage({ params }) {
  const resolvedParams = await params
  const sectionExists = getVisibleSections(config.includeEditAttendance).some(
    section => section.key === resolvedParams.section
  )

  if (!sectionExists || resolvedParams.section === 'overview') {
    notFound()
  }

  return <RestrictedGroupSectionPage {...config} section={resolvedParams.section} />
}
