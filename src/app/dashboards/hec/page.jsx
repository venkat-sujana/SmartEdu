import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function HECDashboard() {
  return <RestrictedGroupDashboardPage groupName="HEC" routeSegment="hec" includeEditAttendance />;
}
