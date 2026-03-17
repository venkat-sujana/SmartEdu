export function normalizeAttendanceGroup(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalized) return "";

  if (normalized === "BIPC") return "BiPC";
  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";
  if (normalized === "M&AT" || normalized === "M@AT" || normalized === "MANDAT") {
    return "M&AT";
  }

  return String(value || "").trim();
}
