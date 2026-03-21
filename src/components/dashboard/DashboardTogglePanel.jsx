//src/components/dashboard/DashboardTogglePanel.jsx
"use client";

import {
  CalendarCheck2,
  ChartColumn,
  FilePenLine,
  LayoutGrid,
  TableProperties,
  UsersRound,
} from "lucide-react";

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
  const showEditToggle = Boolean(onToggleEditAttendance && editAttendanceContent);

  const actions = [
    {
      key: "attendance",
      label: showAttendance ? "Hide Attendance" : "Take Attendance",
      description: "",
      active: showAttendance,
      onClick: onToggleAttendance,
      icon: <CalendarCheck2 className="h-3 w-3" />,
      tone: "from-sky-600 to-blue-700",
    },
    {
      key: "students",
      label: studentTable ? "Hide Student Table" : "Students",
      description: "",
      active: studentTable,
      onClick: onToggleStudentTable,
      icon: <TableProperties className="h-3 w-3" />,
      tone: "from-violet-600 to-indigo-700",
    },
    {
      key: "absentees",
      label: showTodayAbsentees ? "Hide Today Absentees" : "Today's Absentees",
      description: "",
      active: showTodayAbsentees,
      onClick: onToggleTodayAbsentees,
      icon: <UsersRound className="h-3 w-3" />,
      tone: "from-teal-600 to-emerald-700",
    },
    {
      key: "monthly",
      label: monthlyAttendance ? "Hide Monthly Attendance" : "Monthly Attendance",
      description: "",
      active: monthlyAttendance,
      onClick: onToggleMonthlyAttendance,
      icon: <LayoutGrid className="h-3 w-3" />,
      tone: "from-amber-500 to-orange-600",
    },
    {
      key: "exams",
      label: showExamResults ? "Hide Exam Output" : "Exam Output",
      description: "",
      active: showExamResults,
      onClick: onToggleExamResults,
      icon: <ChartColumn className="h-3 w-3" />,
      tone: "from-indigo-600 to-sky-700",
    },
  ];

  if (showEditToggle) {
    actions.push({
      key: "edit",
      label: editAttendance ? "Hide Edit Attendance" : "Edit Attendance",
      description: "",
      active: editAttendance,
      onClick: onToggleEditAttendance,
      icon: <FilePenLine className="h-3 w-3" />,
      tone: "from-rose-600 to-pink-700",
    });
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action, index) => (
            <div key={action.key} className="flex items-center gap-2">
              {index > 0 ? (
                <span className="hidden text-slate-300 sm:inline-flex" aria-hidden="true">
                  /
                </span>
              ) : null}

              <button
                onClick={action.onClick}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  action.active
                    ? `bg-linear-to-r ${action.tone} border-transparent text-white shadow-md`
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
                aria-pressed={action.active}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${
                    action.active ? "bg-white/15 text-white" : "bg-white text-slate-600 shadow-sm"
                  }`}
                >
                  {action.icon}
                </span>
                <span>{action.label}</span>
              </button>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Breadcrumb actions: tap any step to open or hide that section.
        </p>
      </div>

      {showAttendance && <PanelShell>{attendanceContent}</PanelShell>}
      {studentTable && <PanelShell>{studentTableContent}</PanelShell>}
      {showTodayAbsentees && <PanelShell>{todayAbsenteesContent}</PanelShell>}
      {monthlyAttendance && <PanelShell>{groupMonthlyAttendanceContent}</PanelShell>}
      {showExamResults && <PanelShell>{examResultsContent}</PanelShell>}
      {showEditToggle && editAttendance && <PanelShell>{editAttendanceContent}</PanelShell>}
    </div>
  );
}

function PanelShell({ children }) {
  return <div className="w-full">{children}</div>;
}
