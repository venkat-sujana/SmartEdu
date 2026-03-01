const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

function slotKey(day, period) {
  return `${day}|${period}`;
}

function pickBestSubject(candidates, day, period, grid, lecturerLoad, subjectRemaining, lecturerMax) {
  const prevSubjectId = period > 1 ? grid[slotKey(day, period - 1)]?.subjectId : null;
  const prevPrevSubjectId = period > 2 ? grid[slotKey(day, period - 2)]?.subjectId : null;

  const scored = candidates
    .map((c) => {
      const remaining = subjectRemaining.get(String(c._id)) || 0;
      const lId = String(c.lecturerId._id || c.lecturerId);
      const load = lecturerLoad.get(lId) || 0;
      const max = lecturerMax.get(lId) || 0;
      let score = remaining * 100 - load * 3;
      if (String(prevSubjectId) === String(c._id)) score -= 30;
      if (String(prevPrevSubjectId) === String(c._id)) score -= 50;
      if (load >= max) score -= 1000;
      return { c, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.c || null;
}

export function generateTimetable({
  subjects,
  existingLecturerBusySlots,
  lecturerMaxHours,
}) {
  const grid = {};
  const subjectRemaining = new Map();
  const lecturerLoad = new Map();
  const lecturerMax = new Map();
  const lecturerBusy = new Map();

  for (const s of subjects) {
    subjectRemaining.set(String(s._id), Number(s.hoursPerWeek || 0));
    const lId = String(s.lecturerId._id || s.lecturerId);
    if (!lecturerLoad.has(lId)) lecturerLoad.set(lId, 0);
    if (!lecturerBusy.has(lId)) lecturerBusy.set(lId, new Set());
  }

  for (const [lecturerId, busySet] of existingLecturerBusySlots.entries()) {
    lecturerBusy.set(String(lecturerId), new Set(busySet));
  }

  for (const [lecturerId, maxHours] of lecturerMaxHours.entries()) {
    lecturerMax.set(String(lecturerId), Number(maxHours || 0));
  }

  const subjectsById = new Map(subjects.map((s) => [String(s._id), s]));

  for (const day of DAYS) {
    for (const period of PERIODS) {
      const key = slotKey(day, period);

      const candidates = subjects.filter((s) => {
        const sId = String(s._id);
        const lId = String(s.lecturerId._id || s.lecturerId);
        if ((subjectRemaining.get(sId) || 0) <= 0) return false;
        if ((lecturerLoad.get(lId) || 0) >= (lecturerMax.get(lId) || 0)) return false;
        if (lecturerBusy.get(lId)?.has(key)) return false;
        return true;
      });

      if (candidates.length === 0) {
        grid[key] = null;
        continue;
      }

      const chosen = pickBestSubject(
        candidates,
        day,
        period,
        grid,
        lecturerLoad,
        subjectRemaining,
        lecturerMax
      );

      if (!chosen) {
        grid[key] = null;
        continue;
      }

      const sId = String(chosen._id);
      const lId = String(chosen.lecturerId._id || chosen.lecturerId);
      grid[key] = {
        day,
        period,
        subjectId: sId,
        lecturerId: lId,
      };
      subjectRemaining.set(sId, (subjectRemaining.get(sId) || 0) - 1);
      lecturerLoad.set(lId, (lecturerLoad.get(lId) || 0) + 1);
      if (!lecturerBusy.has(lId)) lecturerBusy.set(lId, new Set());
      lecturerBusy.get(lId).add(key);
    }
  }

  const assigned = Object.values(grid).filter(Boolean).map((slot) => ({
    ...slot,
    subject: subjectsById.get(slot.subjectId),
  }));

  const remainingHours = Array.from(subjectRemaining.entries()).map(([subjectId, remaining]) => ({
    subjectId,
    remaining,
  }));

  return { assigned, remainingHours, days: DAYS, periods: PERIODS };
}

