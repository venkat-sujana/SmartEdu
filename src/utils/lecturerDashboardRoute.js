import { getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";

const GROUP_DASHBOARD_ROUTES = {
  MPC: "/dashboards/mpc",
  BiPC: "/dashboards/bipc",
  BIPC: "/dashboards/bipc",
  CEC: "/dashboards/cec",
  HEC: "/dashboards/hec",
  "M&AT": "/dashboards/mandat",
  MLT: "/dashboards/mlt",
  CET: "/dashboards/cet",
  GFC: "/dashboards/gfc",
};

export function getDashboardRouteForGroup(groupName) {
  return GROUP_DASHBOARD_ROUTES[groupName] || "/dashboards";
}

export function getDashboardRouteForLecturerSubject(subject) {
  if (!subject) return "/dashboards";
  const groupName = getLecturerGroupFromSubject(subject);
  return getDashboardRouteForGroup(groupName);
}
