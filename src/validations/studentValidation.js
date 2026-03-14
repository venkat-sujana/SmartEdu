import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10).max(10),
  group: z.string(),
  caste: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  yearOfStudy: z.string(),
});
