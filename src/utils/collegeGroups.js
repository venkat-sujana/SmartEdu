import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

export const DEFAULT_COLLEGE_GROUPS = [
  "MPC",
  "BiPC",
  "CEC",
  "HEC",
  "CET",
  "M&AT",
  "MLT",
];

export function sanitizeCollegeGroups(input) {
  const values = Array.isArray(input)
    ? input
    : String(input || "")
        .split(",")
        .map((value) => value.trim());

  const normalized = values
    .map((value) => normalizeAttendanceGroup(value))
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(normalized)];
}

export function ensureCollegeGroups(input) {
  const groups = sanitizeCollegeGroups(input);
  return groups.length ? groups : DEFAULT_COLLEGE_GROUPS;
}
