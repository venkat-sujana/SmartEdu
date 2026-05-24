export function validateDutyAssignment(data) {
  const { examScheduleId, lecturerId } = data;

  if (!examScheduleId || !lecturerId) {
    return "Exam and lecturer are required";
  }

  return null;
}