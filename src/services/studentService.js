import mongoose from "mongoose"
import { findStudents, countStudents } from "@/repositories/studentRepository"

export async function getStudentsService({
  collegeId,
  groupParam,
  yearParam,
  searchParam,
  page,
  limit,
  session
}) {

  const skip = (page - 1) * limit

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId)

  let filter = {
    collegeId: collegeObjectId,
    status: "Active",
  }

  if (searchParam) {
    const escapedSearch = searchParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    filter.name = { $regex: escapedSearch, $options: "i" }
  }

  if (yearParam) {
    filter.yearOfStudy = yearParam
  }

  if (groupParam) {
    filter.group = groupParam
  } 
  else if (session.user.stream === "Vocational" && session.user.group) {
    filter.group = session.user.group
  } 
  else if (session.user.stream === "General" && session.user.subject) {
    filter.subjects = { $in: [session.user.subject] }
  }

  const students = await findStudents(filter, skip, limit)
  const totalStudents = await countStudents(filter)

  return {
    students,
    totalStudents,
    totalPages: Math.ceil(totalStudents / limit),
  }
}