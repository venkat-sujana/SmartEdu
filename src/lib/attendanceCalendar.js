const publicHolidays = [
  { month: 0, day: 26, name: "Republic Day" },
  { month: 5, day: 7, name: "Bakrid" },
  { month: 7, day: 8, name: "Varalakshmi Vratham" },
  { month: 7, day: 15, name: "Independence Day" },
  { month: 7, day: 16, name: "Krishnashtami" },
  { month: 7, day: 27, name: "Vinayaka Chavithi" },
  { month: 8, day: 15, name: "Quarterly Exams" },
  { month: 8, day: 16, name: "Quarterly Exams" },
  { month: 8, day: 17, name: "Quarterly Exams" },
  { month: 8, day: 18, name: "Quarterly Exams" },
  { month: 8, day: 19, name: "Quarterly Exams" },
  { month: 8, day: 20, name: "Quarterly Exams" },
  { month: 8, day: 28, name: "Dussehra Holidays" },
  { month: 8, day: 29, name: "Dussehra Holidays" },
  { month: 8, day: 30, name: "Dussehra Holidays" },
  { month: 9, day: 1, name: "Dussehra Holidays" },
  { month: 9, day: 2, name: "Gandhi Jayanthi" },
  { month: 9, day: 3, name: "Dussehra Holidays" },
  { month: 9, day: 4, name: "Dussehra Holidays" },
  { month: 9, day: 6, name: "Reopen After Dussehra Holidays" },
];

export function getPublicHoliday(dateObj) {
  return publicHolidays.find(
    (holiday) =>
      holiday.month === dateObj.getMonth() &&
      holiday.day === dateObj.getDate()
  );
}

export function isHoliday(dateObj) {
  return Boolean(getPublicHoliday(dateObj));
}

export function isSecondSaturday(dateObj) {
  return (
    dateObj.getDay() === 6 &&
    dateObj.getDate() > 7 &&
    dateObj.getDate() <= 14
  );
}

export function isSunday(dateObj) {
  return dateObj.getDay() === 0;
}

export function isNonWorkingDay(dateObj) {
  return isSunday(dateObj) || isSecondSaturday(dateObj) || isHoliday(dateObj);
}

export { publicHolidays };
