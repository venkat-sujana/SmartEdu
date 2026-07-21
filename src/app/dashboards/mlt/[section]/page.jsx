import { notFound } from 'next/navigation'
import RestrictedGroupSectionPage from '../../components/RestrictedGroupSectionPage'
import { getVisibleSections } from '../../components/groupDashboardConfig'

const config = {
  groupName: 'MLT',
  routeSegment: 'mlt',
  includeExternalLinks: true,
  includeEditAttendance: true,
}

export default async function MLTSectionPage({ params }) {
  const resolvedParams = await params
  const sectionExists = getVisibleSections(config.includeEditAttendance).some(
    section => section.key === resolvedParams.section
  )

  if (!sectionExists || resolvedParams.section === 'overview') {
    notFound()
  }

  return <RestrictedGroupSectionPage {...config} section={resolvedParams.section} />
}
