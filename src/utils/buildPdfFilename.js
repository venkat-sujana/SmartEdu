const UNSAFE_FILENAME_CHARS = /[^a-zA-Z0-9._-]+/g;
const EDGE_TRIM_CHARS = /^[-.]+|[-.]+$/g;
const PLACEHOLDER_NAMES = new Set(["undefined", "null", "nan", "na", "n/a"]);

function sanitizeFileNamePart(value, fallback) {
  const raw = value === undefined || value === null ? "" : String(value).trim();

  if (!raw || PLACEHOLDER_NAMES.has(raw.toLowerCase())) {
    return fallback;
  }

  const sanitized = raw
    .replace(UNSAFE_FILENAME_CHARS, "-")
    .replace(/-{2,}/g, "-")
    .replace(EDGE_TRIM_CHARS, "")
    .slice(0, 60)
    .replace(EDGE_TRIM_CHARS, "");

  return sanitized || fallback;
}

export function buildStudentPdfFileName(prefix, student) {
  return `${sanitizeFileNamePart(prefix, "certificate")}-${sanitizeFileNamePart(
    student?.name,
    "student"
  )}.pdf`;
}

export default buildStudentPdfFileName;
