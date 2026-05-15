// app/timetable/page.jsx
import EditableTimeTable from '@/components/EditableTimeTable'
import {
  TIMETABLE_ACADEMIC_YEAR,
  TIMETABLE_CLASSES,
} from '@/lib/timetable-config'

export default function TimeTablePage() {
  return (
    <div className="p-4 md:p-8">
      
      <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
        S.K.R.GJC,GUDUR
        TIME TABLE FOR THE YEAR {TIMETABLE_ACADEMIC_YEAR}
      </h1>

      {/* GENERAL STREAM */}
      {TIMETABLE_CLASSES.filter((cls) => cls.stream === 'general').map((cls) => (
        <EditableTimeTable
          key={cls.title}
          title={cls.title}
          stream={cls.stream}
          academicYear={TIMETABLE_ACADEMIC_YEAR}
        />
      ))}

      {/* VOCATIONAL STREAM */}
      {TIMETABLE_CLASSES.filter((cls) => cls.stream === 'vocational').map((cls) => (
        <EditableTimeTable
          key={cls.title}
          title={cls.title}
          stream={cls.stream}
          academicYear={TIMETABLE_ACADEMIC_YEAR}
        />
      ))}
    </div>
  )
}
