import GroupDashboardPage from "../components/GroupDashboardPage";

export default function MandATDashboard() {
  return (
    <GroupDashboardPage
      groupName="M&AT"
      routeSegment="mandat"
      deskLabel="MandAT Desk"
      includeEditAttendance
      statusDescription="Use quick actions below to mark attendance, edit entries, and open monthly analytics."
      overviewDescription="Monitor attendance, update records, and review shortage summaries for both academic years."
    />
  );
}
