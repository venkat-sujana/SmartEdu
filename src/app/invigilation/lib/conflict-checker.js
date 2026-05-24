export function hasDutyClash(existingDuties, exam, options = {}) {
  const { sameDayNoRepeat = false } = options;
  const examDate = new Date(exam.date)
    .toISOString()
    .slice(0, 10);

  return existingDuties.some((duty) => {
    const assignedExam = duty.examScheduleId;

    if (!assignedExam?.date) return false;

    const assignedDate = new Date(assignedExam.date)
      .toISOString()
      .slice(0, 10);

    if (assignedDate !== examDate) return false;

    if (sameDayNoRepeat) {
      return true;
    }

    return assignedExam.session === exam.session;
  });
}
