import { z } from "zod";

export const STREAMS = ["MPC", "BIPC", "CEC", "HEC", "M&AT", "CET", "MLT"];
export const YEARS_OF_STUDY = ["First Year", "Second Year"];
export const EXAM_TYPES = [
  "UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", 
  "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"
];

export const subjectSchema = z.object({
  subject: z.string().min(1, "Subject name required").trim(),
  marks: z.number().min(0).max(100, "Marks <= 100"),
  maxMarks: z.number().min(1, "Max marks > 0").default(100),
});

export const generalSubjectSchema = subjectSchema.extend({
  // General stream subjects validation if needed
});

export const vocationalSubjectSchema = subjectSchema.extend({
  // Vocational stream subjects
});

export const createExamSchema = z.object({
  studentId: z.string().min(1, "Student ID required"),
  stream: z.enum(STREAMS),
  yearOfStudy: z.enum(YEARS_OF_STUDY),
  academicYear: z.string().regex(/^\\d{4}-(1|2)$/, "Academic year format: YYYY-1 or YYYY-2"),
  examType: z.enum(EXAM_TYPES),
  examDate: z.coerce.date(),
  generalSubjects: z.array(generalSubjectSchema).optional(),
  vocationalSubjects: z.array(vocationalSubjectSchema).optional(),
  collegeId: z.string().min(1, "College ID required"),
}).refine((data) => {
  if (STREAMS.slice(0,4).includes(data.stream)) {
    return data.generalSubjects && data.generalSubjects.length > 0;
  }
  if (STREAMS.slice(4).includes(data.stream)) {
    return data.vocationalSubjects && data.vocationalSubjects.length > 0;
  }
  return true;
}, { message: "General subjects required for general streams" });

export const updateExamSchema = createExamSchema.partial().extend({
  total: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
});

export const listExamsQuerySchema = z.object({
  studentId: z.string().optional(),
  stream: z.enum(STREAMS).optional(),
  yearOfStudy: z.enum(YEARS_OF_STUDY).optional(),
  examType: z.enum(EXAM_TYPES).optional(),
  collegeId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  academicYear: z.string().optional(),
}).transform((data) => ({
  ...data,
  skip: (data.page - 1) * data.limit,
}));

export const examScheduleSchema = z.object({
  date: z.coerce.date(),
  session: z.enum(["FN", "AN", "EN"]),
  subject: z.string().min(1).trim(),
  hallNo: z.string().min(1).trim(),
  collegeId: z.string().min(1), // Added
});

export function computePercentage(subjects) {
  if (!subjects || subjects.length === 0) return 0;
  const totalMarks = subjects.reduce((sum, s) => sum + s.marks, 0);
  const maxTotal = subjects.reduce((sum, s) => sum + s.maxMarks, 0);
  return maxTotal > 0 ? Math.round((totalMarks / maxTotal) * 100) : 0;
}

