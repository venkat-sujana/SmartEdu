import { z } from "zod";

export const ALLOWED_ATTENDANCE_SESSIONS = ["FN", "AN"];

export function normalizeAttendanceSession(session, fallback = "FN") {
  if (session == null || session === "") {
    return fallback;
  }

  return String(session).trim().toUpperCase();
}

export function isAllowedAttendanceSession(session) {
  return ALLOWED_ATTENDANCE_SESSIONS.includes(
    normalizeAttendanceSession(session, "")
  );
}

export function buildAttendanceSessionReadFilter(field = "session") {
  return {
    $or: [
      { [field]: { $in: ALLOWED_ATTENDANCE_SESSIONS } },
      { [field]: { $exists: false } },
      { [field]: null },
      { [field]: "" },
    ],
  };
}

export const attendanceRecordSchema = z.object({
  studentId: z.any().refine(
    (value) => value != null && String(value).trim() !== "",
    { message: "studentId is required" }
  ),
  date: z.coerce.date(),
  yearOfStudy: z.string().min(1),
  group: z.string().min(1),
  status: z.enum(["Present", "Absent"]).optional(),
  session: z
    .string()
    .optional()
    .transform((value) => normalizeAttendanceSession(value))
    .refine(isAllowedAttendanceSession, {
      message: "Session must be FN or AN",
    }),
});

export const attendanceRecordUpdateSchema = z.object({
  date: z.coerce.date().optional(),
  yearOfStudy: z.string().min(1).optional(),
  group: z.string().min(1).optional(),
  status: z.enum(["Present", "Absent"]).optional(),
  session: z
    .string()
    .optional()
    .transform((value) =>
      value == null ? undefined : normalizeAttendanceSession(value, "")
    )
    .refine(
      (value) => value === undefined || isAllowedAttendanceSession(value),
      { message: "Session must be FN or AN" }
    ),
});

export const attendanceSessionParamSchema = z
  .string()
  .transform((value) => normalizeAttendanceSession(value, ""))
  .refine(isAllowedAttendanceSession, {
    message: "Session must be FN or AN",
  });
