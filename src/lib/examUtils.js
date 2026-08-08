// src/lib/examUtils.js

const UNIT_EXAMS = ["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4"];

export function normalizeExamStream(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalized) return "";
  if (normalized === "BIPC") return "BIPC";
  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";

  if (
    normalized === "M&AT" ||
    normalized === "M@AT" ||
    normalized === "MANDAT"
  ) {
    return "M&AT";
  }

  return normalized;
}

export function isVocational(stream) {
  return ["M&AT", "CET", "MLT"].includes(normalizeExamStream(stream));
}

export function isAbsentMark(mark) {
  const value = String(mark || "").trim().toUpperCase();
  return value === "A" || value === "AB";
}

export function getSubjectEntries(report) {
  const source =
    report?.generalSubjects?.length > 0
      ? report.generalSubjects
      : report?.vocationalSubjects || [];

  return source.map((item) => [item.subject, item.marks]);
}

export function isReportAbsent(report) {
  const entries = getSubjectEntries(report);

  if (entries.length === 0) return false;

  // అన్ని subjects A/AB అయితే మాత్రమే Absent
  return entries.every(([, mark]) => isAbsentMark(mark));
}

export function isReportPass(report) {
  const entries = getSubjectEntries(report);

  if (!entries.length) return false;

  if (isReportAbsent(report)) return false;

  for (const [, mark] of entries) {
    const numericMark = Number(mark);

    if (!Number.isFinite(numericMark)) return false;

    // UNIT Exams
    if (UNIT_EXAMS.includes(report.examType)) {
      if (numericMark < 9) return false;
    }

    // Quarterly / Half Yearly
    if (
      ["QUARTERLY", "HALFYEARLY"].includes(report.examType)
    ) {
      if (numericMark < 18) return false;
    }

    // Pre Public
    if (
      ["PRE-PUBLIC-1", "PRE-PUBLIC-2"].includes(report.examType)
    ) {
      if (isVocational(report.stream)) {
        if (numericMark < 18) return false;
      } else {
        if (numericMark < 35) return false;
      }
    }
  }

  return true;
}

export function calculateSummary({
  
  students = [],
  exams = [],


  
}) {
  const strength = students.length;

  const absentRecords = exams.filter(isReportAbsent);

  const passRecords = exams.filter(
    (exam) =>
      !isReportAbsent(exam) &&
      isReportPass(exam)
  );

  const failRecords = exams.filter(
    (exam) =>
      !isReportAbsent(exam) &&
      !isReportPass(exam)
  );

  const absent = absentRecords.length;
  const pass = passRecords.length;
  const fail = failRecords.length;

  // Appeared = Pass + Fail
  const appeared = pass + fail;

  const passPercentage =
    appeared > 0
      ? Number(((pass / appeared) * 100).toFixed(2))
      : 0;

  return {
    strength,
    appeared,
    absent,
    pass,
    fail,
    passPercentage,
  };
  
}