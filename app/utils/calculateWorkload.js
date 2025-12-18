//app/utils/calculateWorkload.js
import { SUBJECT_LECTURERS } from "@/lib/lecturers";

export function calculateWorkload(timetableData) {
  const report = {};

  timetableData.forEach(day =>
    day.forEach(subject => {
      if (!subject) return;

      const lecturer = SUBJECT_LECTURERS[subject];
      if (!lecturer) return;

      if (!report[lecturer]) {
        report[lecturer] = {
          lecturer,
          theory: 0,
          practical: 0,
          total: 0,
        };
      }

      if (subject.toLowerCase().includes("practical")) {
        report[lecturer].practical += 1;
      } else {
        report[lecturer].theory += 1;
      }

      report[lecturer].total += 1;
    })
  );

  return Object.values(report);
}
