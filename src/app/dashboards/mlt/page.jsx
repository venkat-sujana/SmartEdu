import RestrictedGroupDashboardPage from "../components/RestrictedGroupDashboardPage";

export default function MLTDashboard() {
  return (
    <RestrictedGroupDashboardPage
      groupName="MLT"
      routeSegment="mlt"
      includeExternalLinks
    />
  );
}
