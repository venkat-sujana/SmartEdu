//src/components/dashboard/DashboardTogglePanel.jsx
"use client";

import {
  CalendarCheck2,
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
  onToggleEditAttendance,
  showAttendance,
  studentTable,
  showTodayAbsentees,
  monthlyAttendance,
  editAttendance,
  attendanceContent,
  studentTableContent,
  todayAbsenteesContent,
  groupMonthlyAttendanceContent,
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
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {actions.map(action => (
          <button
            key={action.key}
            onClick={action.onClick}
            className={`overflow-hidden rounded-3xl border text-left transition ${
              action.active
                ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                : "border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-0.5 hover:border-slate-300"
            }`}
          >
            <div
              className={`h-1.5 w-full bg-linear-to-r ${action.tone} ${
                action.active ? "opacity-100" : "opacity-80"
              }`}
            />
            <div className="flex items-start gap-3 p-4">
              <div
                className={`rounded-2xl p-3 ${
                  action.active ? "bg-white/10" : "bg-slate-100"
                }`}
              >
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-5">{action.label}</p>
                <p
                  className={`mt-1 text-xs ${
                    action.active ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {showAttendance && <PanelShell>{attendanceContent}</PanelShell>}
      {studentTable && <PanelShell>{studentTableContent}</PanelShell>}
      {showTodayAbsentees && <PanelShell>{todayAbsenteesContent}</PanelShell>}
      {monthlyAttendance && <PanelShell>{groupMonthlyAttendanceContent}</PanelShell>}
      {showEditToggle && editAttendance && <PanelShell>{editAttendanceContent}</PanelShell>}
    </div>
  );
}

function PanelShell({ children }) {
  return <div className="w-full">{children}</div>;
}
