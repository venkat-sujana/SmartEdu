'use client';

export default function DashboardTogglePanel({
  onToggleAttendance,
  onToggleStudentTable,
  onToggleTodayAbsentees,
  onToggleGroupAttendance,
  showAttendance,
  studentTable,
  showTodayAbsentees,
  showDetails,
  attendanceContent,
  studentTableContent,
  todayAbsenteesContent,
  groupAttendanceContent,
}) {
  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Buttons row */}
      <div className="flex flex-wrap justify-center gap-4 mb-2">

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => window.print()}
        >
          Print
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={onToggleAttendance}
        >
          {showAttendance ? 'Hide Attendance' : 'Take Attendance'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={onToggleStudentTable}
        >
          {studentTable ? 'Hide StudentTable' : 'Show StudentTable'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={onToggleTodayAbsentees}
        >
          {showTodayAbsentees ? 'Hide Today Absentees' : 'Show Today Absentees'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={onToggleGroupAttendance}
        >
          {showDetails ? 'Hide Group Attendance' : 'Show Group Attendance'}
        </button>
      </div>

      {/* Panels - same order, each button కింద కంటెంట్ */}
      {showAttendance && (
        <div className="w-full flex justify-center">
          {attendanceContent}
        </div>
      )}

      {studentTable && (
        <div className="w-full max-w-5xl">
          {studentTableContent}
        </div>
      )}

      {showTodayAbsentees && (
        <div className="w-full max-w-5xl">
          {todayAbsenteesContent}
        </div>
      )}

      {showDetails && (
        <div className="w-full">
          {groupAttendanceContent}
        </div>
      )}



    </div>
  );
}
