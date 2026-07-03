//src/lib/timetable-config.js


export const TIMETABLE_ACADEMIC_YEAR = '2026-2027'

export const TIMETABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export const TIMETABLE_COLUMNS = [
  { label: '9:10 - 10:00', type: 'period' },
  { label: '10:00 - 10:50', type: 'period' },

  { label: 'BREAK', type: 'break' },

  { label: '11:00 - 11:50', type: 'period' },
  { label: '11:50 - 12:40', type: 'period' },

  { label: 'LUNCH', type: 'lunch' },

  { label: '1:20 - 2:10', type: 'period' },
  { label: '2:10 - 3:00', type: 'period' },

  { label: 'BREAK', type: 'break' },
  
  { label: '3:10 - 4:00', type: 'period' },
  { label: '4:00 - 5:00', type: 'period' },
]

export const TIMETABLE_CLASSES = [
  { title: 'FIRST YEAR SCIENCE - GENERAL', stream: 'general', color: 'blue' },
  { title: 'SECOND YEAR SCIENCE - GENERAL', stream: 'general', color: 'indigo' },
  { title: 'FIRST YEAR ARTS - GENERAL', stream: 'general', color: 'violet' },
  { title: 'SECOND YEAR ARTS - GENERAL', stream: 'general', color: 'purple' },
  { title: 'FIRST YEAR VOCATIONAL', stream: 'vocational', color: 'emerald' },
  { title: 'SECOND YEAR VOCATIONAL', stream: 'vocational', color: 'teal' },
]

export const TIMETABLE_CLASS_LABELS = TIMETABLE_CLASSES.map((cls) => cls.title)

export const TIMETABLE_TOTAL_PERIODS_PER_CLASS =
  TIMETABLE_DAYS.length * TIMETABLE_COLUMNS.filter((col) => col.type === 'period').length

export const TIMETABLE_SUBJECT_OPTIONS = {
  general: [
    '',
    'Maths',
    'Physics',
    'Chemistry',
    'Physics Practicals',
    'Chemistry Practicals',
    'Botany',
    'Botany Practicals',
    'Zoology',
    'Zoology Practicals',
    'Civics',
    'Economics',
    'History',
    'Commerce',
    'English',
    'Telugu',
    'Sanskrit',
    'Hindi',
    'Study Hour',
  ],
  vocational: [
    '',
    'English Vocational',
    'GFC',
    'V1',
    'V1 Practicals',
    'V2',
    'V2 Practicals',
    'V3',
    'V3 Practicals',
    'V4',
    'V4 Practicals',
    'V5',
    'V5 Practicals',
    'V6',
    'V6 Practicals',
    'Study Hour',
    'Bridge Course',
  ],
}

export const TIMETABLE_GENERATOR_SUBJECTS = {
  general: TIMETABLE_SUBJECT_OPTIONS.general.filter(Boolean),
  vocational: [
    'English',
    'GFC',
    'V1',
    'V1 Practicals',
    'V2',
    'V2 Practicals',
    'V3',
    'V3 Practicals',
    'V4',
    'V4 Practicals',
    'V5',
    'V5 Practicals',
    'V6',
    'V6 Practicals',
    'Study Hour',
    'Bridge Course',
  ],
}

export const TIMETABLE_SUBJECT_COLORS = {
  Maths: 'bg-blue-100 text-blue-800',
  Physics: 'bg-yellow-100 text-yellow-800',
  Chemistry: 'bg-emerald-100 text-emerald-800',
  'Physics Practicals': 'bg-yellow-200 text-yellow-900',
  'Chemistry Practicals': 'bg-emerald-200 text-emerald-900',
  Botany: 'bg-green-100 text-green-800',
  'Botany Practicals': 'bg-green-200 text-green-900',
  Zoology: 'bg-teal-100 text-teal-800',
  'Zoology Practicals': 'bg-teal-200 text-teal-900',
  Civics: 'bg-purple-100 text-purple-800',
  Economics: 'bg-rose-100 text-rose-800',
  History: 'bg-orange-100 text-orange-800',
  Commerce: 'bg-amber-100 text-amber-800',
  English: 'bg-sky-100 text-sky-800',
  'English General': 'bg-sky-100 text-sky-800',
  'English Vocational': 'bg-sky-100 text-sky-800',
  Telugu: 'bg-violet-100 text-violet-800',
  Sanskrit: 'bg-pink-100 text-pink-800',
  Hindi: 'bg-fuchsia-100 text-fuchsia-800',
  'Study Hour': 'bg-slate-100 text-slate-600',
  GFC: 'bg-lime-100 text-lime-800',
  'Bridge Course': 'bg-indigo-100 text-indigo-800',
}

export const TIMETABLE_SUBJECT_COLORS_WITH_BORDER = {
  Maths: 'bg-blue-100 text-blue-800 border-blue-200',
  Physics: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Chemistry: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Physics Practicals': 'bg-yellow-200 text-yellow-900 border-yellow-300',
  'Chemistry Practicals': 'bg-emerald-200 text-emerald-900 border-emerald-300',
  Botany: 'bg-green-100 text-green-800 border-green-200',
  'Botany Practicals': 'bg-green-200 text-green-900 border-green-300',
  Zoology: 'bg-teal-100 text-teal-800 border-teal-200',
  'Zoology Practicals': 'bg-teal-200 text-teal-900 border-teal-300',
  Civics: 'bg-purple-100 text-purple-800 border-purple-200',
  Economics: 'bg-rose-100 text-rose-800 border-rose-200',
  History: 'bg-orange-100 text-orange-800 border-orange-200',
  Commerce: 'bg-amber-100 text-amber-800 border-amber-200',
  English: 'bg-sky-100 text-sky-800 border-sky-200',
  'English General': 'bg-sky-100 text-sky-800 border-sky-200',
  'English Vocational': 'bg-sky-100 text-sky-800 border-sky-200',
  Telugu: 'bg-violet-100 text-violet-800 border-violet-200',
  Sanskrit: 'bg-pink-100 text-pink-800 border-pink-200',
  Hindi: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
  'Study Hour': 'bg-slate-100 text-slate-600 border-slate-200',
  GFC: 'bg-lime-100 text-lime-800 border-lime-200',
  'Bridge Course': 'bg-indigo-100 text-indigo-800 border-indigo-200',
}

export const TIMETABLE_GENERATOR_SUBJECT_COLORS = {
  Maths: 'bg-blue-50 border-blue-200 text-blue-700',
  Physics: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  Chemistry: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  'Physics Practicals': 'bg-yellow-50 border-yellow-300 text-yellow-800',
  'Chemistry Practicals': 'bg-emerald-50 border-emerald-300 text-emerald-800',
  Botany: 'bg-green-50 border-green-200 text-green-700',
  'Botany Practicals': 'bg-green-50 border-green-300 text-green-800',
  Zoology: 'bg-teal-50 border-teal-200 text-teal-700',
  'Zoology Practicals': 'bg-teal-50 border-teal-300 text-teal-800',
  English: 'bg-sky-50 border-sky-200 text-sky-700',
  Telugu: 'bg-violet-50 border-violet-200 text-violet-700',
  Sanskrit: 'bg-pink-50 border-pink-200 text-pink-700',
  Hindi: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
  Civics: 'bg-purple-50 border-purple-200 text-purple-700',
  Economics: 'bg-rose-50 border-rose-200 text-rose-700',
  History: 'bg-orange-50 border-orange-200 text-orange-700',
  Commerce: 'bg-amber-50 border-amber-200 text-amber-700',
  'Study Hour': 'bg-slate-50 border-slate-200 text-slate-600',
  GFC: 'bg-lime-50 border-lime-200 text-lime-700',
  'Bridge Course': 'bg-indigo-50 border-indigo-200 text-indigo-700',
}

export const TIMETABLE_SUBJECT_PDF_COLORS = {
  Maths: [219, 234, 254],
  Physics: [254, 243, 199],
  Chemistry: [209, 250, 229],
  Botany: [220, 252, 231],
  Zoology: [240, 253, 244],
  Civics: [250, 232, 255],
  Economics: [255, 228, 230],
  History: [255, 247, 237],
  Commerce: [254, 252, 232],
  English: [240, 249, 255],
  'English General': [240, 249, 255],
  'English Vocational': [240, 249, 255],
  Telugu: [253, 244, 255],
  Sanskrit: [254, 249, 195],
  Hindi: [252, 231, 243],
  'Study Hour': [241, 245, 249],
  GFC: [236, 253, 245],
  'Physics Practicals': [253, 230, 138],
  'Chemistry Practicals': [167, 243, 208],
  'Botany Practicals': [110, 231, 183],
  'Zoology Practicals': [134, 239, 172],
}

export const TIMETABLE_SUBJECT_HEX_COLORS = {
  Maths: '#dbeafe',
  Physics: '#fef3c7',
  Chemistry: '#d1fae5',
  Botany: '#dcfce7',
  Zoology: '#f0fdf4',
  Civics: '#fae8ff',
  Economics: '#ffe4e6',
  History: '#fff7ed',
  Commerce: '#fefce8',
  English: '#f0f9ff',
  'English General': '#f0f9ff',
  'English Vocational': '#f0f9ff',
  Telugu: '#fdf4ff',
  Sanskrit: '#fef9c3',
  Hindi: '#fce7f3',
  'Study Hour': '#f1f5f9',
  GFC: '#ecfdf5',
  'Physics Practicals': '#fde68a',
  'Chemistry Practicals': '#a7f3d0',
  'Botany Practicals': '#6ee7b7',
  'Zoology Practicals': '#86efac',
}

export const TIMETABLE_SUBJECT_LECTURERS = {
  Maths: 'K.Seenaiah',
  Physics: 'G.Sujatha',
  Chemistry: 'K.Sailaja',
  'Physics Practicals': 'G.Sujatha',
  'Chemistry Practicals': 'K.Sailaja',
  Botany: 'A.Munikrishnaiah',
  'Botany Practicals': 'A.Munikrishnaiah',
  Zoology: 'A.Sujathamma',
  'Zoology Practicals': 'A.Sujathamma',
  English: 'A.V.Ramanaiah/K.Sudheer',
  'English General': 'A.Venkata Ramanaiah',
  'English Vocational': 'K.Sudheer',
  Telugu: 'R.B.Penchal Singh',
  Sanskrit: 'No lecturer found',
  Hindi: 'K.Salakumari',
  Civics: 'S.Sudhakar Rao',
  Economics: 'Balli.Venkataiah',
  History: 'Bandi Venkataiah',
  Commerce: 'M.Sumalatha',
  'Study Hour General': '',
  GFC: 'P.Ramesh',
  'Bridge Course': 'Bridge Course Lecturer',
  V1: 'E.V/K.B.R/R.G',
  'V1 Practicals': 'E.V/K.B.R/R.G',
  V2: 'G.K/K.S.R/B.V',
  'V2 Practicals': 'G.K/K.S.R/B.V',
  V3: 'G.K/K.S.R/R.G',
  'V3 Practicals': 'G.K/K.S.R/R.G',
  V4: 'E.V/K.B.R/R.G',
  'V4 Practicals': 'E.V/K.B.R/R.G',
  V5: 'G.K/K.B.R/B.V',
  'V5 Practicals': 'G.K/K.B.R/B.V',
  V6: 'E.V/K.B.R/B.V',
  'V6 Practicals': 'E.V/K.B.R/B.V',
  'Study Hour Vocational': '',
}

export const TIMETABLE_GENERATOR_SUBJECT_LECTURERS = {
  ...TIMETABLE_SUBJECT_LECTURERS,
  English: '',
}

export const TIMETABLE_DEFAULT_HOURS = {
  general: {
    Maths: 5,
    Physics: 4,
    Chemistry: 4,
    'Physics Practicals': 2,
    'Chemistry Practicals': 2,
    Botany: 4,
    'Botany Practicals': 2,
    Zoology: 4,
    'Zoology Practicals': 2,
    English: 4,
    Telugu: 3,
    'Study Hour': 2,
  },
  vocational: {
    English: 4,
    GFC: 4,
    V1: 4,
    'V1 Practicals': 2,
    V2: 4,
    'V2 Practicals': 2,
    'Study Hour': 2,
    'Bridge Course': 2,
  },
}

export const TIMETABLE_SUBJECT_TARGETS = {
  Maths: 12,
  Physics: 9,
  Chemistry: 9,
  'Physics Practicals': 2,
  'Chemistry Practicals': 2,
  Botany: 6,
  'Botany Practicals': 2,
  Zoology: 6,
  'Zoology Practicals': 2,
  History: 11,
  Commerce: 11,
  Economics: 11,
  Civics: 11,
  English: 14,
  Hindi: 11,
  Telugu: 11,
  Sanskrit: 11,
  GFC: 6,
  'Study Hour': 6,
  'Bridge Course': 2,
  'English Vocational': 6,
  V1: 12,
  'V1 Practicals': 2,
  V2: 12,
  'V2 Practicals': 2,
  V3: 12,
  'V3 Practicals': 2,
  V4: 12,
  'V4 Practicals': 2,
  V5: 12,
  'V5 Practicals': 2,
  V6: 12,
  'V6 Practicals': 2,
}

export const TIMETABLE_CLASS_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-violet-100 text-violet-800 border-violet-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-teal-100 text-teal-800 border-teal-200',
]

export const TIMETABLE_CLASS_PDF_COLORS = [
  [219, 234, 254],
  [224, 231, 255],
  [237, 233, 254],
  [243, 232, 255],
  [209, 250, 229],
  [204, 251, 241],
]

export const TIMETABLE_TODAY =
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ]
