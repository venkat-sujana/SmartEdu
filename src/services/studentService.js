
import mongoose from "mongoose";
import { findStudents, countStudents } from "@/repositories/studentRepository";
import { getLecturerGroupFromSubject } from "@/lib/lecturerGroupAccess";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

function normalizeGroupValue(group) {
  return normalizeAttendanceGroup(group);
}

export async function getStudentsService({
  collegeId,
  groupParam,
  yearParam,
  searchParam,
  statusParam,
  page,
  limit,
  session,
}) {
  const skip = (page - 1) * limit

  const collegeObjectId = mongoose.Types.ObjectId.isValid(collegeId)
    ? new mongoose.Types.ObjectId(collegeId)
    : collegeId

  const filter = {
    collegeId: collegeObjectId,
  }

  if (statusParam === 'Active' || statusParam === 'Terminated') {
    filter.status = statusParam
  } else if (!statusParam) {
    filter.status = 'Active'
  }

  if (session?.user?.role === 'lecturer') {
    const access = await getCaretakerLecturerGroupAccess(session)

    if (!access.authorized || !access.groups.length) {
      const error = new Error('No authorized group mapping found.')
      error.statusCode = 403
      throw error
    }

    if (String(access.collegeId) !== String(collegeId)) {
      const error = new Error('College access denied.')
      error.statusCode = 403
      throw error
    }

    let allowedGroups = access.groups

    if (groupParam) {
      const requestedGroup = normalizeGroupValue(groupParam)

      allowedGroups = allowedGroups.filter(group => normalizeGroupValue(group) === requestedGroup)

      if (!allowedGroups.length) {
        const error = new Error('You do not have access to this group.')
        error.statusCode = 403
        throw error
      }
    }

    const groupAliases = allowedGroups.flatMap(group => {
      const normalized = normalizeGroupValue(group)

      return normalized === 'BiPC' ? ['BiPC', 'BIPC'] : [normalized]
    })

    filter.group = {
      $in: [...new Set(groupAliases)],
    }
  }

  if (searchParam) {
    filter.$text = { $search: searchParam }
  }

  if (yearParam) {
    filter.yearOfStudy = yearParam
  }

  if (groupParam && session?.user?.role !== 'lecturer') {
    const normalizedGroup = normalizeGroupValue(groupParam)

    filter.group = normalizedGroup === 'BiPC' ? { $in: ['BiPC', 'BIPC'] } : normalizedGroup
  } else if (
    session?.user?.role !== 'lecturer' &&
    session?.user?.stream === 'Vocational' &&
    session?.user?.group
  ) {
    filter.group = session.user.group
  } else if (
    session?.user?.role !== 'lecturer' &&
    session?.user?.stream === 'General' &&
    session?.user?.subject
  ) {
    // Preserve existing subject-based behavior for non-lecturer users.
    filter.subjects = { $in: [session.user.subject] }
  }

  const [students, totalStudents] = await Promise.all([
    findStudents(filter, skip, limit),
    countStudents(filter),
  ])

  return {
    students,
    totalStudents,
    totalPages: Math.ceil(totalStudents / limit),
  }
}
