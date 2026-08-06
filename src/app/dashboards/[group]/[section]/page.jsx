//src/app/dashboards/%5Bgroup%5D/%5Bsection%5D/page.jsx
import { notFound } from 'next/navigation'
import RestrictedGroupSectionPage from '../../components/RestrictedGroupSectionPage'
import {
  getDashboardConfigBySegment,
  getVisibleSections,
} from '../../components/groupDashboardConfig'

export default async function GroupDashboardSectionRoute({ params }) {
  const resolvedParams = await params
  const config = getDashboardConfigBySegment(resolvedParams.group)

  if (!config || config.routeSegment !== resolvedParams.group) {
    notFound()
  }

  const sectionExists = getVisibleSections(config.includeEditAttendance).some(
    section => section.key === resolvedParams.section
  )

  if (!sectionExists || resolvedParams.section === 'overview') {
    notFound()
  }

  return <RestrictedGroupSectionPage {...config} section={resolvedParams.section} />
}
