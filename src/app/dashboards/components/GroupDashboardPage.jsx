"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CalendarCheck2, LayoutDashboard, UserPlus, Users2 } from "lucide-react";
import TodayAbsenteesTable from "@/components/attendance/TodayAbsenteesTable";
import AttendanceForm from "@/components/attendance/AttendanceForm";
import IndividualReport from "@/components/attendance/IndividualReport";
import DashboardTogglePanel from "@/components/dashboard/DashboardTogglePanel";
import ExternalLinks from "@/components/ExternalLinks";
import DashboardFooter from "@/components/layout/Footer";
import GroupAttendanceSummary from "@/components/attendance/GroupAttendanceSummary";
import GroupShortageSummary from "@/components/attendance/GroupShortageSummary";
import LecturerInfoCard from "@/components/dashboard/LecturerInfoCard";
import GroupAttendanceCard from "@/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import GroupStudentTable from "@/components/tables/GroupStudentTable";
import { getGroupTheme } from "@/components/dashboard/groupTheme";

export default function GroupDashboardPage({
  groupName,
  routeSegment,
  returnUrl,
  deskLabel,
  includeExternalLinks = false,
  includeEditAttendance = false,
  statusDescription = "Use quick actions below to mark attendance and open monthly analytics.",
  overviewDescription,
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showAttendance, setShowAttendance] = useState(false);
  const [studentTable, setStudentTable] = useState(false);
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState(false);
  const [editAttendance, setEditAttendance] = useState(false);

  const collegeName = user?.collegeName || "College";
  const years = ["First Year", "Second Year"];
  const theme = getGroupTheme(groupName);
  const defaultOverview =
    overviewDescription ||
    `Monitor attendance, absentees, and shortage analytics for ${groupName} batches.`;
  const addStudentHref = `/register?group=${encodeURIComponent(groupName)}`;

  const editProps = includeEditAttendance
    ? {
        editAttendance,
        onToggleEditAttendance: () => setEditAttendance(v => !v),
        editAttendanceContent: <IndividualReport groupName={groupName} showTitle={false} />,
      }
    : {};

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4">
        <div className={`flex items-center justify-between rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} px-4 py-3 shadow-sm`}>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Lecturer Dashboard</p>
            <h1 className="text-lg font-semibold text-slate-900">{groupName} Group Operations</h1>
            <p className="text-sm text-slate-600">{collegeName}</p>
          </div>
          <span className={`rounded-md px-3 py-1 text-xs font-semibold ${theme.badge}`}>
            Group: {groupName}
          </span>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Campus</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{collegeName}</p>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${theme.pill}`}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              {deskLabel || `${groupName} Desk`}
            </div>
          </div>

          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Group</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{groupName}</p>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${theme.pill}`}>
              <Users2 className="h-3.5 w-3.5" />
              First + Second Year
            </div>
          </div>

          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Workspaces</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Attendance + Reports</p>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${theme.pill}`}>
              <CalendarCheck2 className="h-3.5 w-3.5" />
              Daily Operations
            </div>
          </div>

          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Ready for attendance cycle</p>
            <p className="mt-3 text-xs text-slate-600">{statusDescription}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[480px_1fr] 2xl:grid-cols-[560px_1fr]">
          <div className="space-y-4">
            <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
              <div className={`mb-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${theme.pill}`}>
                Lecturer Panel
              </div>
              <LecturerInfoCard user={user} groupName={groupName} />
            </div>

            <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Group Attendance Snapshot
              </p>
              <GroupAttendanceCard groupName={groupName} />
            </div>

            <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
              <p className="text-sm font-semibold text-slate-900">Dashboard Overview</p>
              <p className="mt-1 text-sm text-slate-600">{defaultOverview}</p>
            </div>
          </div>

          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm md:p-6`}>
            {includeExternalLinks && (
              <div className={`mb-4 rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3`}>
                <ExternalLinks />
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-left sm:text-3xl">
                Attendance Operations Hub
              </h3>
              <Link
                href={addStudentHref}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
              >
                <UserPlus className="h-4 w-4" />
                Add Student
              </Link>
            </div>

            <DashboardTogglePanel
              showAttendance={showAttendance}
              studentTable={studentTable}
              showTodayAbsentees={showTodayAbsentees}
              monthlyAttendance={monthlyAttendance}
              onToggleAttendance={() => setShowAttendance(v => !v)}
              onToggleStudentTable={() => setStudentTable(v => !v)}
              onToggleTodayAbsentees={() => setShowTodayAbsentees(v => !v)}
              onToggleMonthlyAttendance={() => setMonthlyAttendance(v => !v)}
              attendanceContent={
                <AttendanceForm
                  defaultGroup={groupName}
                  returnUrl={returnUrl || `/dashboards/${routeSegment}`}
                />
              }
              studentTableContent={<GroupStudentTable groupName={groupName} />}
              todayAbsenteesContent={<TodayAbsenteesTable groupFilter={groupName} header={false} />}
              groupMonthlyAttendanceContent={
                <div className="mx-auto mt-6 max-w-7xl space-y-8 rounded-2xl bg-white/95 p-4 shadow-sm md:p-6">
                  <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
                    {collegeName} - {groupName} Attendance
                  </h1>
                  {years.map(year => (
                    <GroupAttendanceSummary
                      key={year}
                      group={groupName}
                      yearOfStudy={year}
                      collegeName={collegeName}
                    />
                  ))}
                  {includeEditAttendance ? (
                    <div className="space-y-5 rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 to-white p-4 md:p-6">
                      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Attendance Shortage
                          </p>
                          <h2 className="mt-1 text-lg font-bold text-slate-900">
                            Year-wise Risk Overview
                          </h2>
                        </div>
                        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {groupName} - First Year and Second Year
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <GroupShortageSummary
                            group={groupName}
                            year="First Year"
                            collegeId={session?.user?.collegeId}
                            collegeName={session?.user?.collegeName}
                            className="border-0 p-0 shadow-none"
                          />
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                          <GroupShortageSummary
                            group={groupName}
                            year="Second Year"
                            collegeId={session?.user?.collegeId}
                            collegeName={session?.user?.collegeName}
                            className="border-0 p-0 shadow-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:p-6">
                      <GroupShortageSummary
                        group={groupName}
                        year="First Year"
                        collegeId={session?.user?.collegeId}
                        collegeName={session?.user?.collegeName}
                      />
                      <GroupShortageSummary
                        group={groupName}
                        year="Second Year"
                        collegeId={session?.user?.collegeId}
                        collegeName={session?.user?.collegeName}
                      />
                    </div>
                  )}
                </div>
              }
              {...editProps}
            />
          </div>
        </section>

        <section className={`rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} shadow-sm`}>
          <DashboardFooter
            collegeName={collegeName}
            groupName={groupName}
            facebookUrl="https://facebook.com/yourcollege"
            instagramUrl="https://instagram.com/yourcollege"
            twitterUrl="https://x.com/yourcollege"
            youtubeUrl="https://youtube.com/@yourcollege"
          />
        </section>
      </div>
    </div>
  );
}





