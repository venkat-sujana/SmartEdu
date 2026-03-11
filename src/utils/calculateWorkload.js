//app/utils/calculateWorkload.js
import { SUBJECT_LECTURERS } from "@/app/lib/lecturers"

function calculateLecturerWorkload(table) {
  const workload = {}

  table.forEach(dayRow => {
    dayRow.forEach(subject => {
      if (!subject) return

      const lecturer = SUBJECT_LECTURERS[subject]
      if (!lecturer) return

      if (!workload[lecturer]) {
        workload[lecturer] = {
          lecturer,
          theory: 0,
          practical: 0,
          total: 0,
        }
      }

      // ✅ FIXED PRACTICAL CHECK
      if (subject.toLowerCase().includes('practic')) {
        workload[lecturer].practical += 1
      } else {
        workload[lecturer].theory += 1
      }

      workload[lecturer].total += 1
    })
  })

  return Object.values(workload)
}
