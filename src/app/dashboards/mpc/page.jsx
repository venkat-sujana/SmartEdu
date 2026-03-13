import GroupDashboardPage from "../components/GroupDashboardPage";

export default function MPCDashboard() {
  return <GroupDashboardPage groupName="MPC" routeSegment="mpc"
      includeEditAttendance />;
}
