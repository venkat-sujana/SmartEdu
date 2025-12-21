// app/timetable/page.jsx

import EditableTimeTable from "../components/EditableTimeTable";

export default function TimeTablePage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-extrabold text-center text-blue-900 mb-6">
        Academic Year 2025 – 2026
      </h1>

      {/* GENERAL STREAM */}
      <EditableTimeTable
        title="1st SCIENCE - General Stream"
        stream="general"
      />
      <EditableTimeTable
        title="2nd SCIENCE - General Stream"
        stream="general"
      />
      <EditableTimeTable
        title="1st ARTS - General Stream"
        stream="general"
      />
      <EditableTimeTable
        title="2nd ARTS - General Stream"
        stream="general"
      />

      {/* VOCATIONAL STREAM */}
      <EditableTimeTable
        title="1st VOCATIONAL - Vocational Stream"
        stream="vocational"
      />
      <EditableTimeTable
        title="2nd VOCATIONAL - Vocational Stream"
        stream="vocational"
      />
    </div>
  );
}



