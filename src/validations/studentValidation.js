import { z } from "zod";

// ✅ Base schema (no refine here)
const baseStudentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .length(10, "Mobile must be exactly 10 digits")
    .regex(/^[0-9]+$/, "Mobile must contain only numbers"),
  group: z.string().min(1, "Group is required"),
  caste: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  yearOfStudy: z.string().min(1, "Year of Study is required"),
});

// ✅ Create schema (for new student)
export const studentSchema = baseStudentSchema;

// ✅ Update schema (safe alternative to .partial())
export const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  mobile: z
    .string()
    .length(10)
    .regex(/^[0-9]+$/)
    .optional(),
  group: z.string().optional(),
  caste: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  yearOfStudy: z.string().optional(),
});
