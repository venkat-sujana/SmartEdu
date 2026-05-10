//app/timetable/page.jsx
import EditableTimeTable from '@/components/EditableTimeTable'
export default function TimeTablePage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-2 text-center text-3xl font-extrabold text-blue-900">
        Academic Year 2026 – 2027
      </h1>
      
      {/* GENERAL STREAM */}
      <EditableTimeTable title="FIRST YEAR SCIENCE - GENERAL" stream="general" />
      <EditableTimeTable title="SECOND YEAR SCIENCE - GENERAL" stream="general" />
      <EditableTimeTable title="FIRST YEAR ARTS - GENERAL" stream="general" />
      <EditableTimeTable title="SECOND YEAR ARTS - GENERAL" stream="general" />

      {/* VOCATIONAL STREAM */}
      <EditableTimeTable title="FIRST YEAR VOCATIONAL" stream="vocational" />
      <EditableTimeTable title="SECOND YEAR VOCATIONAL " stream="vocational" />
    </div>
  )
}
