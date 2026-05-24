export function filterDuties(
  duties,
  { date, session }
) {
  return duties.filter((duty) => {
    const exam = duty.examScheduleId;

    if (!exam) return false;

    let matches = true;

    if (date) {
      const examDate = new Date(exam.date)
        .toISOString()
        .slice(0, 10);

      matches = matches && examDate === date;
    }

    if (session) {
      matches =
        matches && exam.session === session;
    }

    return matches;
  });
}