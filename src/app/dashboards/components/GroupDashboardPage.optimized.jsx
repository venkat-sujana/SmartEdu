"use client";

import { useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
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
import GroupExamDashboardPanel from "@/components/exams/GroupExamDashboardPanel";
import GroupStudentTable from "@/components/tables/GroupStudentTable";
import { getGroupTheme } from "@/components/dashboard/groupTheme";

// Memoized fetcher with caching
const fetcher = async (url) => {
  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) {
    throw new Error("Failed to fetch data");
  }
  return response.json();
};

// SWR configuration for optimal caching
const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000, // 1 minute
  keepPreviousData: true,
};

// Memoized card component to prevent unnecessary re-renders
const InfoCard = memo(function InfoCard({ label, value, pillContent, theme }) {
  return (
    <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
      <div className={`mt-3 inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs ${theme.pill}`}>
        {pillContent}
      </div>
    </div>
  );
});

// Memoized year list - constant reference
const YEARS_LIST = ["First Year", "Second Year"];

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
  
  // Consolidated state management to reduce re-renders
  const [uiState, setUiState] = useState({
    showAttendance: false,
    studentTable: false,
    showTodayAbsentees: false,
    monthlyAttendance: false,
    showExamResults: false,
    editAttendance: false,
  });

  // Memoized theme to prevent recalculation
  const theme = useMemo(() => getGroupTheme(groupName), [groupName]);

  // Optimized SWR with caching configuration
  const { data: collegeDetails } = useSWR(
    user?.collegeId ? `/api/colleges/${user.collegeId}` : null,
    fetcher,
    swrConfig
  );

  // Memoized computed values
  const collegeName = useMemo(() => user?.collegeName || "College", [user?.collegeName]);
  
  const footerInfo = useMemo(() => ({
    address: [collegeDetails?.address, collegeDetails?.district].filter(Boolean).join(", "),
    phone: collegeDetails?.phone || "",
    email: collegeDetails?.email || "",
  }), [collegeDetails]);

  const defaultOverview = useMemo(() => 
    overviewDescription || `Monitor attendance, absentees, and shortage analytics for ${groupName} batches.`,
    [overviewDescription, groupName]
  );

  const addStudentHref = useMemo(() => 
    `/register?group=${encodeURIComponent(groupName)}`,
    [groupName]
  );

  // Memoized toggle handlers to prevent recreation on every render
  const toggleHandlers = useMemo(() => ({
    onToggleAttendance: () => setUiState(prev => ({ ...prev, showAttendance: !prev.showAttendance })),
    onToggleStudentTable: () => setUiState(prev => ({ ...prev, studentTable: !prev.studentTable })),
    onToggleTodayAbsentees: () => setUiState(prev => ({ ...prev, showTodayAbsentees: !prev.showTodayAbsentees })),
    onToggleMonthlyAttendance: () => setUiState(prev => ({ ...prev, monthlyAttendance: !prev.monthlyAttendance })),
    onToggleExamResults: () => setUiState(prev => ({ ...prev, showExamResults: !prev.showExamResults })),
    onToggleEditAttendance: includeEditAttendance 
      ? () => setUiState(prev => ({ ...prev, editAttendance: !prev.editAttendance }))
      : undefined,
  }), [includeEditAttendance]);

  // Memoized content components to prevent unnecessary re-renders
  const contentComponents = useMemo(() => ({
    attendanceContent: (
      <AttendanceForm
        defaultGroup={groupName}
        returnUrl={returnUrl || `/dashboards/${routeSegment}`}
      />
    ),
    studentTableContent: <GroupStudentTable groupName={groupName} />,
    todayAbsenteesContent: <TodayAbsenteesTable groupFilter={groupName} header={false} />,
    examResultsContent: <GroupExamDashboardPanel groupName={groupName} />,
    editAttendanceContent: includeEditAttendance ? (
      <IndividualReport groupName={groupName} showTitle={false} />
    ) : undefined,
  }), [groupName, routeSegment, returnUrl, includeEditAttendance]);

  // Memoized monthly attendance content
  const groupMonthlyAttendanceContent = useMemo(() => (
    <div className="mx-auto mt-6 max-w-7xl space-y-8 rounded-2xl bg-white/95 p-4 shadow-sm md:p-6">
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
        {collegeName} - {groupName} Attendance
      </h1>
      {YEARS_LIST.map(year => (
        <GroupAttendanceSummary
          key={year}
          group={groupName}
          yearOfStudy={year}
          collegeName={collegeName}
        />
      ))}
      {includeEditAttendance && (
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
                collegeId={user?.collegeId}
                collegeName={user?.collegeName}
                className="border-0 p-0 shadow-none"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <GroupShortageSummary
                group={groupName}
                year="Second Year"
                collegeId={user?.collegeId}
                collegeName={user?.collegeName}
                className="border-0 p-0 shadow-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  ), [collegeName, groupName, includeEditAttendance, user?.collegeId, user?.collegeName]);

  return (
    <div className={`min-h-screen bg-linear-to-br ${theme.shell} p-4 md:p-6`}>
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Header Section */}
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

        {/* Info Cards Grid */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard 
            label="Campus" 
            value={collegeName}
            theme={theme}
            pillContent={<>
              <LayoutDashboard className="h-3.5 w-3.5" />
              {deskLabel || `${groupName} Desk`}
            </>}
          />
          <InfoCard 
            label="Group" 
            value={groupName}
            theme={theme}
            pillContent={<>
              <Users2 className="h-3.5 w-3.5" />
              First + Second Year
            </>}
          />
          <InfoCard 
            label="Workspaces" 
            value="Attendance + Reports"
            theme={theme}
            pillContent={<>
              <CalendarCheck2 className="h-3.5 w-3.5" />
              Daily Operations
            </>}
          />
          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm`}>
            <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">Ready for attendance cycle</p>
            <p className="mt-3 text-xs text-slate-600">{statusDescription}</p>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[480px_1fr] 2xl:grid-cols-[560px_1fr]">
          {/* Left Sidebar */}
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

          {/* Main Panel */}
          <div className={`rounded-xl border ${theme.softBorder} bg-linear-to-br ${theme.soft} p-4 shadow-sm md:p-6`}>
            {includeExternalLinks && (
              <div className={`mb-4 rounded-xl border ${theme.softBorder} bg-linear-to-r ${theme.soft} p-3`}>
                <ExternalLinks />
              </div>
            )}

            <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-left sm:text-3xl">
                Operations Hub
              </h3>
              <div className="flex gap-2">
                <Link
                  href={addStudentHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Link>
                <Link
                  href="/exams-form"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition ${theme.pill}`}
                >
                  <UserPlus className="h-4 w-4" />
                  Add Exam
                </Link>
              </div>
            </div>

            <DashboardTogglePanel
              {...uiState}
              {...toggleHandlers}
              {...contentComponents}
              groupMonthlyAttendanceContent={groupMonthlyAttendanceContent}
            />
          </div>
        </section>
      </div>

      <DashboardFooter
        collegeName={collegeName}
        address={footerInfo.address}
        phone={footerInfo.phone}
        email={footerInfo.email}
      />
    </div>
  );
}
