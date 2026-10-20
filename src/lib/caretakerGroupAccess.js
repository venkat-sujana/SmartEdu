//src/lib/caretakerGroupAccess.js
import mongoose from "mongoose";
import Lecturer from "@/models/Lecturer";
import CaretakerGroupMapping from "@/models/CaretakerGroupMapping";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

export async function getCaretakerLecturerGroupAccess(session) {
  if (
    session?.user?.role !== "lecturer" ||
    !session?.user?.id ||
    !session?.user?.collegeId ||
    !mongoose.Types.ObjectId.isValid(session.user.id) ||
    !mongoose.Types.ObjectId.isValid(session.user.collegeId)
  ) {
    return {
      authorized: false,
      collegeId: null,
      lecturerId: null,
      groups: [],
    };
  }

  const collegeId = new mongoose.Types.ObjectId(
    session.user.collegeId
  );

  const lecturerId = new mongoose.Types.ObjectId(
    session.user.id
  );

  const lecturer = await Lecturer.findOne({
    _id: lecturerId,
    collegeId,
  })
    .select("_id collegeId")
    .lean();

  if (!lecturer) {
    return {
      authorized: false,
      collegeId: null,
      lecturerId: null,
      groups: [],
    };
  }

  const mapping = await CaretakerGroupMapping.findOne({
    collegeId,
    lecturerId: lecturer._id,
  })
    .select("groups")
    .lean();

  const groups = [
    ...new Set(
      (Array.isArray(mapping?.groups) ? mapping.groups : [])
        .map((group) => normalizeAttendanceGroup(group))
        .filter(Boolean)
    ),
  ];

  if (!groups.length) {
    return {
      authorized: false,
      collegeId: lecturer.collegeId.toString(),
      lecturerId: lecturer._id.toString(),
      groups: [],
    };
  }

  return {
    authorized: true,
    collegeId: lecturer.collegeId.toString(),
    lecturerId: lecturer._id.toString(),
    groups,
  };
}
