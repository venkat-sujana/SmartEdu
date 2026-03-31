import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function MPCDashboard() {
  return <RestrictedGroupDashboardPage groupName="MPC" routeSegment="mpc" includeEditAttendance />;
}
