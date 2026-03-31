import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function MandATDashboard() {
  return (
    <RestrictedGroupDashboardPage
      groupName="M&AT"
      routeSegment="mandat"
      deskLabel="MandAT Desk"
      includeEditAttendance
      statusDescription="Use quick actions below to mark attendance, edit entries, and open monthly analytics."
      overviewDescription="Monitor attendance, update records, and review shortage summaries for both academic years."
    />
  );
}
