//src/app/dashboards/page.jsx
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import GroupDashboardPage from "./components/GroupDashboardPage";
import { getDashboardConfigFromSubject } from "./components/groupDashboardConfig";

export default function CommonLecturerDashboardPage() {
  const { data: session } = useSession();

  const config = useMemo(
    () => getDashboardConfigFromSubject(session?.user?.subject),
    [session?.user?.subject]
  );

  return <GroupDashboardPage {...config} returnUrl="/dashboards" />;
}
