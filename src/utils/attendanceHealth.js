export function getAttendanceHealth(score = 0) {
  if (score >= 95) {
    return {
      label: 'Outstanding',
      color: 'emerald',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
    }
  }

  if (score >= 90) {
    return {
      label: 'Excellent',
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-700',
    }
  }

  if (score >= 80) {
    return {
      label: 'Good',
      color: 'yellow',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
    }
  }

  if (score >= 75) {
    return {
      label: 'Warning',
      color: 'orange',
      bg: 'bg-orange-100',
      text: 'text-orange-700',
    }
  }

  return {
    label: 'Critical',
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-700',
  }
}