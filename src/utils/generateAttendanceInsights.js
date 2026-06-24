export function generateAttendanceInsights({
  attendancePercentage,
  previousAttendancePercentage,
  totalAbsent,
  totalPresent,
  bestGroup,
}) {
  const insights = []

  const change =
    attendancePercentage - previousAttendancePercentage

  if (change > 0) {
    insights.push({
      icon: '📈',
      text: `Attendance improved by ${change}% compared to yesterday.`,
    })
  }

  if (change < 0) {
    insights.push({
      icon: '📉',
      text: `Attendance dropped by ${Math.abs(change)}% compared to yesterday.`,
    })
  }

  if (attendancePercentage < 75) {
    insights.push({
      icon: '⚠️',
      text: 'Attendance is below the recommended threshold of 75%.',
    })
  }

  if (totalAbsent > totalPresent) {
    insights.push({
      icon: '🚨',
      text: 'More students are absent than present today.',
    })
  }

  if (totalAbsent > 0) {
    insights.push({
      icon: '👥',
      text: `${totalAbsent} students were absent today.`,
    })
  }

  if (bestGroup) {
    insights.push({
      icon: '🏆',
      text: `${bestGroup} is currently the best-performing group.`,
    })
  }

  return insights
}