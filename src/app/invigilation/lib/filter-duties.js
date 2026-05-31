//src/app/invigilation/lib/filter-duties.js

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

export function filterDuties(
  duties,
  { fromDate, toDate, session }
) {
  return duties.filter((duty) => {
    const exam = duty.examScheduleId;

    if (!exam) return false;

    let matches = true;

    if (fromDate || toDate) {
      const examDateKey = toIstDateKey(exam.date);
      if (fromDate && examDateKey < fromDate) matches = false;
      if (toDate && examDateKey > toDate) matches = false;
    }

    if (session) {
      matches =
        matches && exam.session === session;
    }

    return matches;
  });
}
