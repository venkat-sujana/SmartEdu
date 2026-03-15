//src/services/studentService.js

import mongoose from "mongoose";
import { findStudents, countStudents } from "@/repositories/studentRepository";

function normalizeGroupValue(group) {
  if (!group) return group;

  return group === "BIPC" ? "BiPC" : group;
}

export async function getStudentsService({
  collegeId,
  groupParam,
  yearParam,
  searchParam,
  page,
  limit,
  session
}) {

  const skip = (page - 1) * limit;

  const collegeObjectId = mongoose.Types.ObjectId.isValid(collegeId)
    ? new mongoose.Types.ObjectId(collegeId)
    : collegeId;

  const filter = {
    collegeId: collegeObjectId,
    status: "Active"
  };

  // 🔍 optimized search
  if (searchParam) {
    filter.$text = { $search: searchParam };
  }

  if (yearParam) {
    filter.yearOfStudy = yearParam;
  }

  if (groupParam) {
    const normalizedGroup = normalizeGroupValue(groupParam);
    filter.group =
      normalizedGroup === "BiPC"
        ? { $in: ["BiPC", "BIPC"] }
        : normalizedGroup;
  }
  else if (session?.user?.stream === "Vocational" && session?.user?.group) {
    filter.group = session.user.group;
  }
  else if (session?.user?.stream === "General" && session?.user?.subject) {
    filter.subjects = { $in: [session.user.subject] };
  }

  const [students, totalStudents] = await Promise.all([
    findStudents(filter, skip, limit),
    countStudents(filter)
  ]);

  return {
    students,
    totalStudents,
    totalPages: Math.ceil(totalStudents / limit)
  };
}
