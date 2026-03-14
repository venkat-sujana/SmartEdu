// src/repositories/studentRepository.js

import Student from "@/models/Student"

const projection =
  "name mobile group caste gender yearOfStudy admissionYear photo status createdAt"

export async function findStudents(filter, skip, limit) {

  return await Student.find(filter)
    .select(projection)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: false })

}

export async function countStudents(filter) {

  return await Student.countDocuments(filter)

}