import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function CETDashboard() {
  return (
    <RestrictedGroupDashboardPage
      groupName="CET"
      routeSegment="cet"
      includeExternalLinks
    />
  );
}
