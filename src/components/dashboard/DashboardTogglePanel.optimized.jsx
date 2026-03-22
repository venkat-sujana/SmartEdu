'use client'

import { useMemo, memo, useCallback } from 'react'
import {
  CalendarCheck2,
  ChartColumn,
  FilePenLine,
  LayoutGrid,
  TableProperties,
  UsersRound,
} from 'lucide-react'

// Memoized action button component - fixed ESLint warning by destructuring
const ActionButton = memo(function ActionButton({ 
  active, 
  tone, 
  icon, 
  label, 
  onClick, 
  isFirst 
}) {
  const handleClick = useCallback(() => {
    onClick?.()
  }, [onClick])

  return (
    <div className="flex items-center gap-2">
      {!isFirst && (
        <span className="hidden text-slate-300 sm:inline-flex" aria-hidden="true">
          /
        </span>
      )}

      <button
        onClick={handleClick}
        className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
          active
            ? `bg-linear-to-r ${tone} border-transparent text-white shadow-md`
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm'
        }`}
        aria-pressed={active}
      >
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            active ? 'bg-white/15 text-white' : 'bg-white text-slate-600 shadow-sm'
          }`}
        >
          {icon}
        </span>
        <span>{label}</span>
      </button>
    </div>
  )
})

// Memoized panel shell
const PanelShell = memo(function PanelShell({ children }) {
  return (
    <div className="animate-in fade-in slide-in-from-top-2 w-full duration-300">{children}</div>
  )
})

export default memo(function DashboardTogglePanel({
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
  // Memoized actions configuration to prevent recreation
  const actions = useMemo(() => {
    const baseActions = [
      {
        key: 'attendance',
        label: showAttendance ? 'Hide Attendance' : 'Take Attendance',
        active: showAttendance,
        onClick: onToggleAttendance,
        icon: <CalendarCheck2 className="h-3 w-3" />,
        tone: 'from-sky-600 to-blue-700',
      },
      {
        key: 'students',
        label: studentTable ? 'Hide Student Table' : 'Students',
        active: studentTable,
        onClick: onToggleStudentTable,
        icon: <TableProperties className="h-3 w-3" />,
        tone: 'from-violet-600 to-indigo-700',
      },
      {
        key: 'absentees',
        label: showTodayAbsentees ? 'Hide Today Absentees' : "Today's Absentees",
        active: showTodayAbsentees,
        onClick: onToggleTodayAbsentees,
        icon: <UsersRound className="h-3 w-3" />,
        tone: 'from-teal-600 to-emerald-700',
      },
      {
        key: 'monthly',
        label: monthlyAttendance ? 'Hide Monthly Attendance' : 'Monthly Attendance',
        active: monthlyAttendance,
        onClick: onToggleMonthlyAttendance,
        icon: <LayoutGrid className="h-3 w-3" />,
        tone: 'from-amber-500 to-orange-600',
      },
      {
        key: 'exams',
        label: showExamResults ? 'Hide Exam Output' : 'Exam Output',
        active: showExamResults,
        onClick: onToggleExamResults,
        icon: <ChartColumn className="h-3 w-3" />,
        tone: 'from-indigo-600 to-sky-700',
      },
    ]

    if (onToggleEditAttendance && editAttendanceContent) {
      baseActions.push({
        key: 'edit',
        label: editAttendance ? 'Hide Edit Attendance' : 'Edit Attendance',
        active: editAttendance,
        onClick: onToggleEditAttendance,
        icon: <FilePenLine className="h-3 w-3" />,
        tone: 'from-rose-600 to-pink-700',
      })
    }

    return baseActions
  }, [
    showAttendance,
    studentTable,
    showTodayAbsentees,
    monthlyAttendance,
    showExamResults,
    editAttendance,
    onToggleAttendance,
    onToggleStudentTable,
    onToggleTodayAbsentees,
    onToggleMonthlyAttendance,
    onToggleExamResults,
    onToggleEditAttendance,
    editAttendanceContent,
  ])

  // Memoize visible panels to prevent unnecessary rendering
  const visiblePanels = useMemo(
    () => ({
      attendance: showAttendance && attendanceContent,
      studentTable: studentTable && studentTableContent,
      todayAbsentees: showTodayAbsentees && todayAbsenteesContent,
      monthly: monthlyAttendance && groupMonthlyAttendanceContent,
      exams: showExamResults && examResultsContent,
      edit: editAttendance && editAttendanceContent,
    }),
    [
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
    ]
  )

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="w-full rounded-3xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action, index) => (
            <ActionButton 
              key={action.key} 
              active={action.active}
              tone={action.tone}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              isFirst={index === 0} 
            />
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Breadcrumb actions: tap any step to open or hide that section.
        </p>
      </div>

      {visiblePanels.attendance && <PanelShell>{attendanceContent}</PanelShell>}
      {visiblePanels.studentTable && <PanelShell>{studentTableContent}</PanelShell>}
      {visiblePanels.todayAbsentees && <PanelShell>{todayAbsenteesContent}</PanelShell>}
      {visiblePanels.monthly && <PanelShell>{groupMonthlyAttendanceContent}</PanelShell>}
      {visiblePanels.exams && <PanelShell>{examResultsContent}</PanelShell>}
      {visiblePanels.edit && <PanelShell>{editAttendanceContent}</PanelShell>}
    </div>
  )
})
