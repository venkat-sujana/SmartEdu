export function buildDutyFilter(
  user,
  lecturerId
) {
  const filter = {};

  if (user.role === "lecturer") {
    filter.lecturerId = user._id;
  } else if (lecturerId) {
    filter.lecturerId = lecturerId;
  }

  return filter;
}