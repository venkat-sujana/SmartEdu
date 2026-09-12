import { notFound } from 'next/navigation'
import SubjectWisePassReportPage from '../../components/SubjectWisePassReportPage'
import { getDashboardConfigBySegment } from '../../components/groupDashboardConfig'

export default async function SubjectPassReportRoute({ params }) {
  const { group } = await params
  const config = getDashboardConfigBySegment(group)

  if (!config || config.routeSegment !== group) notFound()

  return <SubjectWisePassReportPage {...config} />
}
