
const AP_GOVERNMENT_HOLIDAYS_2026 = [
  { date: "2026-06-26", name: "Muharram" },
  { date: "2026-08-15", name: "Independence Day" },
  { date: "2026-10-02", name: "Gandhi Jayanti" },
  { date: "2026-10-20", name: "Vijaya Dasami" },
  { date: "2026-12-25", name: "Christmas" },
];

// 2027 అధికారిక సెలవుల తేదీలను నిర్ధారించిన తర్వాత చేర్చాలి.
const AP_GOVERNMENT_HOLIDAYS_2027 = [];

const HOLIDAY_MAP = new Map(
  [
    ...AP_GOVERNMENT_HOLIDAYS_2026,
    ...AP_GOVERNMENT_HOLIDAYS_2027,
  ].map((holiday) => [holiday.date, holiday.name])
);

export function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isSecondSaturday(date) {
  return (
    date.getDay() === 6 &&
    date.getDate() >= 8 &&
    date.getDate() <= 14
  );
}

export function isPublicHoliday(date) {
  return HOLIDAY_MAP.has(getLocalDateKey(date));
}

export function isExcludedExamDay(date) {
  return (
    date.getDay() === 0 ||
    isSecondSaturday(date) ||
    isPublicHoliday(date)
  );
}

export function getExamHolidayName(date) {
  return HOLIDAY_MAP.get(getLocalDateKey(date)) || null;
}
