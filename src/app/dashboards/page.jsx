//src/app/dashboards/page.jsx
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import GroupDashboardPage from "./components/GroupDashboardPage";
import { getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";

function getDashboardConfig(subject) {
  const groupName = getLecturerGroupFromSubject(subject);

  switch (groupName) {
    case "M&AT":
      return {
        groupName,
        routeSegment: "mandat",
        deskLabel: "MandAT Desk",
        includeEditAttendance: true,
        statusDescription:
          "Use quick actions below to mark attendance, edit entries, and open monthly analytics.",
        overviewDescription:
          "Monitor attendance, update records, and review shortage summaries for both academic years.",
      };
    case "CET":
      return { groupName, routeSegment: "cet", includeExternalLinks: true, includeEditAttendance: true };
    case "MLT":
      return { groupName, routeSegment: "mlt", includeExternalLinks: true, includeEditAttendance: true };
    case "BiPC":
      return { groupName, routeSegment: "bipc", includeEditAttendance: true };
    case "CEC":
      return { groupName, routeSegment: "cec", includeEditAttendance: true };
    case "HEC":
      return { groupName, routeSegment: "hec", includeEditAttendance: true };
    case "GFC":
      return { groupName, routeSegment: "gfc" };
    case "MPC":
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
