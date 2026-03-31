import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function CECDashboard() {
  return <RestrictedGroupDashboardPage groupName="CEC" routeSegment="cec" includeEditAttendance />;
}
