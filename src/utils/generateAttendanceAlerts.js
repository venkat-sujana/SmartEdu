export function generateAttendanceAlerts({
  attendancePercentage,
  totalAbsent,
  atRiskStudents = 0,
  allLecturersSubmitted = true,
}) {
  const alerts = []

  if (attendancePercentage < 75) {
    alerts.push({
      type: 'critical',
      icon: '🔴',
      message: 'Attendance is below 75%',
    })
  }

  if (totalAbsent > 0) {
    alerts.push({
      type: 'warning',
      icon: '🟠',
      message: `${totalAbsent} students were absent today`,
    })
  }

  if (atRiskStudents > 0) {
    alerts.push({
      type: 'info',
      icon: '🟡',
      message: `${atRiskStudents} students are at risk`,
    })
  }

  if (allLecturersSubmitted) {
    alerts.push({
      type: 'success',
      icon: '🟢',
      message: 'All lecturers submitted attendance',
    })
  } else {
    alerts.push({
      type: 'critical',
      icon: '🔴',
      message: 'Some lecturers have not submitted attendance',
    })
  }

  return alerts
}