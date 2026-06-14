//src/components/dashboard/DashboardTogglePanel.jsx
'use client'

import {
  CalendarCheck2,
  ChartColumn,
  FilePenLine,
  LayoutGrid,
  TableProperties,
  UsersRound,
} from 'lucide-react'

export default function DashboardTogglePanel({
  onToggleAttendance,
  onToggleStudentTable,
  onToggleTodayAbsentees,
  onToggleMonthlyAttendance,
  onToggleExamResults,
  onToggleEditAttendance,
  showAttendance,
  studentTable,
  showTodayAbsentees,
  monthlyAttendance,
  showExamResults,
  editAttendance,
  attendanceContent,
  studentTableContent,
  todayAbsenteesContent,
  groupMonthlyAttendanceContent,
  examResultsContent,
  editAttendanceContent,
}) {
  const showEditToggle = Boolean(onToggleEditAttendance && editAttendanceContent)

  const actions = [
    {
      key: 'attendance',
      label: showAttendance ? 'Hide Attendance' : 'Take Attendance',
      description: '',
      active: showAttendance,
      onClick: onToggleAttendance,
      icon: <CalendarCheck2 className="h-3 w-3" />,
      tone: 'from-sky-600 to-blue-700 ',
    },
    {
      key: 'students',
      label: studentTable ? 'Hide Student Table' : 'Students',
      description: '',
      active: studentTable,
      onClick: onToggleStudentTable,
      icon: <TableProperties className="h-3 w-3" />,
      tone: 'from-violet-600 to-indigo-700',
    },
    {
      key: 'absentees',
      label: showTodayAbsentees ? 'Hide Today Absentees' : "Today's Absentees",
      description: '',
      active: showTodayAbsentees,
      onClick: onToggleTodayAbsentees,
      icon: <UsersRound className="h-3 w-3" />,
      tone: 'from-teal-600 to-emerald-700',
    },
    {
      key: 'monthly',
      label: monthlyAttendance ? 'Hide Monthly Attendance' : 'Monthly Attendance',
      description: '',
      active: monthlyAttendance,
      onClick: onToggleMonthlyAttendance,
      icon: <LayoutGrid className="h-3 w-3" />,
      tone: 'from-amber-500 to-orange-600',
    },
    {
      key: 'exams',
      label: showExamResults ? 'Hide Exam Output' : 'Exam Output',
      description: '',
      active: showExamResults,
      onClick: onToggleExamResults,
      icon: <ChartColumn className="h-3 w-3" />,
      tone: 'from-indigo-600 to-sky-700',
    },
  ]

  

  if (showEditToggle) {
    actions.push({
      key: 'edit',
      label: editAttendance ? 'Hide Edit Attendance' : 'Edit Attendance',
      description: '',
      active: editAttendance,
      onClick: onToggleEditAttendance,
      icon: <FilePenLine className="h-3 w-3" />,
      tone: 'from-rose-600 to-pink-700',
    })
  }


  const dailyActions = actions.filter(action =>
  ["attendance", "absentees", "edit"].includes(action.key)
)

const analyticsActions = actions.filter(action =>
  ["students", "monthly", "exams"].includes(action.key)
)

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm">
        
        <div className="space-y-6">

  {/* Daily Operations */}
  <div>
    <h4 className="mb-3 text-sm font-bold tracking-wide text-slate-600 uppercase">
      Daily Operations
    </h4>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {dailyActions.map(action => (
        <button
          key={action.key}
          onClick={action.onClick}
          className={`group flex w-full flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            action.active
              ? `bg-linear-to-r ${action.tone} border-transparent text-white shadow-md`
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
          aria-pressed={action.active}
        >
          <span
            className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
              action.active
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {action.icon}
          </span>

          <p className="font-semibold">
            {action.label}
          </p>

          <p
            className={`mt-1 text-xs ${
              action.active
                ? "text-white/80"
                : "text-slate-500"
            }`}
          >
            {action.key === "attendance" && "Mark today's attendance"}
            {action.key === "absentees" && "View absent students"}
            {action.key === "edit" && "Modify attendance records"}
          </p>
        </button>
      ))}
    </div>
  </div>

  {/* Records & Analytics */}
  <div>
    <h4 className="mb-3 text-sm font-bold tracking-wide text-slate-600 uppercase">
      Records & Analytics
    </h4>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {analyticsActions.map(action => (
        <button
          key={action.key}
          onClick={action.onClick}
          className={`group flex w-full flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
            action.active
              ? `bg-linear-to-r ${action.tone} border-transparent text-white shadow-md`
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
          aria-pressed={action.active}
        >
          <span
            className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
              action.active
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {action.icon}
          </span>

          <p className="font-semibold">
            {action.label}
          </p>

          <p
            className={`mt-1 text-xs ${
              action.active
                ? "text-white/80"
                : "text-slate-500"
            }`}
          >
            {action.key === "students" && "View student records"}
            {action.key === "monthly" && "Attendance analytics"}
            {action.key === "exams" && "View exam reports"}
          </p>
        </button>
      ))}
    </div>
  </div>

</div>

      </div>

      {showAttendance && <PanelShell>{attendanceContent}</PanelShell>}
      {studentTable && <PanelShell>{studentTableContent}</PanelShell>}
      {showTodayAbsentees && <PanelShell>{todayAbsenteesContent}</PanelShell>}
      {monthlyAttendance && <PanelShell>{groupMonthlyAttendanceContent}</PanelShell>}
      {showExamResults && <PanelShell>{examResultsContent}</PanelShell>}
      {showEditToggle && editAttendance && <PanelShell>{editAttendanceContent}</PanelShell>}
    </div>
  )
}

function PanelShell({ children }) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      {children}
    </div>
  )
}
