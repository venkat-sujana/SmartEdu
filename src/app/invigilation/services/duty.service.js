
//src/app/invigilation/services/duty.service.js
import DutyAssignment from "@/models/DutyAssignment";
import ExamSchedule from "@/models/ExamSchedule";

import { hasDutyClash } from "../lib/conflict-checker";

export async function getDuties(filter = {}) {
  return DutyAssignment.find(filter)
    .populate("lecturerId", "name email")
    .populate("assignedBy", "name")
    .populate("examScheduleId")
    .sort({ createdAt: -1 })
    .lean();
}

export async function assignDuty({
  examScheduleId,
  lecturerId,
  assignedBy,
  sameDayNoRepeat = true,
}) {
  const exam = await ExamSchedule.findById(
    examScheduleId
  );

  if (!exam) {
    throw new Error("Exam schedule not found");
  }

  const lecturerExisting =
    await DutyAssignment.find({
      lecturerId,
    })
      .populate("examScheduleId", "date session")
      .lean();

  const hasClash = hasDutyClash(
    lecturerExisting,
    exam,
    { sameDayNoRepeat }
  );

  if (hasClash) {
    throw new Error(
      sameDayNoRepeat
        ? "Lecturer already has duty on the same date"
        : "Lecturer already has duty in same date and session"
    );
  }

  return DutyAssignment.create({
    examScheduleId,
    lecturerId,
    assignedBy,
    availability: "Pending",
  });
}
