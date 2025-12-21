//app/timetable/page.jsx

import EditableTimeTable from '../components/EditableTimeTable'
// import LecturerWorkloadReport from '../components/LecturerWorkloadReport'

export default function TimeTablePage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-center text-3xl font-extrabold text-blue-900">
        Academic Year 2025 – 2026
      </h1>

      {/* GENERAL STREAM */}
      <EditableTimeTable title="1st SCIENCE - General Stream" stream="general" />
      <EditableTimeTable title="2nd SCIENCE - General Stream" stream="general" />
      <EditableTimeTable title="1st ARTS - General Stream" stream="general" />
      <EditableTimeTable title="2nd ARTS - General Stream" stream="general" />

      {/* VOCATIONAL STREAM */}
      <EditableTimeTable title="1st VOCATIONAL - Vocational Stream" stream="vocational" />
      <EditableTimeTable title="2nd VOCATIONAL - Vocational Stream" stream="vocational" />

      
{/* <LecturerWorkloadReport /> */}


    </div>
  )
}
