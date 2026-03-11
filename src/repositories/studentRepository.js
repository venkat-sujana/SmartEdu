import Student from "@/models/Student"

export async function findStudents(filter, skip, limit) {

  const students = await Student.find(filter)
    .select(
      "name fatherName mobile group caste dob gender admissionNo yearOfStudy admissionYear dateOfJoining address photo subjects role status collegeId createdAt updatedAt"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean()

  return students
}

export async function countStudents(filter) {
  return await Student.countDocuments(filter)
}