function toIstDateKey(value) {
  if (!value) return ''
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function hasDutyClash(existingDuties, exam, options = {}) {
  const { sameDayNoRepeat = false } = options;
  const examDate = toIstDateKey(exam.date);

  return existingDuties.some((duty) => {
    const assignedExam = duty.examScheduleId;

    if (!assignedExam?.date) return false;

    const assignedDate = toIstDateKey(assignedExam.date);

    if (assignedDate !== examDate) return false;

    if (sameDayNoRepeat) {
      return true;
    }

    return assignedExam.session === exam.session;
  });
}
