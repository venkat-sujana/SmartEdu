"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import GroupDashboardPage from "./components/GroupDashboardPage";

function getDashboardConfig(subject) {
  switch (subject) {
    case "MandAT":
      return {
        groupName: "M&AT",
        routeSegment: "mandat",
        deskLabel: "MandAT Desk",
        includeEditAttendance: true,
        statusDescription:
          "Use quick actions below to mark attendance, edit entries, and open monthly analytics.",
        overviewDescription:
          "Monitor attendance, update records, and review shortage summaries for both academic years.",
      };
    case "CET":
      return { groupName: "CET", routeSegment: "cet", includeExternalLinks: true, includeEditAttendance: true };
    case "MLT":
      return { groupName: "MLT", routeSegment: "mlt", includeExternalLinks: true, includeEditAttendance: true };
    case "Botany":
    case "Zoology":
      return { groupName: "BiPC", routeSegment: "bipc", includeEditAttendance: true };
    case "Civics":
    case "Economics":
    case "Commerce":
      return { groupName: "CEC", routeSegment: "cec", includeEditAttendance: true };
    case "History":
      return { groupName: "HEC", routeSegment: "hec", includeEditAttendance: true };
    case "GFC":
      return { groupName: "GFC", routeSegment: "gfc" };
    case "Maths":
    case "Physics":
    case "Chemistry":
    default:
      return { groupName: "MPC", routeSegment: "mpc", includeEditAttendance: true };
  }
}

export default function CommonLecturerDashboardPage() {
  const { data: session } = useSession();

  const config = useMemo(
    () => getDashboardConfig(session?.user?.subject),
    [session?.user?.subject]
  );

  return <GroupDashboardPage {...config} returnUrl="/dashboards" />;
}
