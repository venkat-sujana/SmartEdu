// app/dashboards/cec/page.jsx
"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from "@/app/components/GroupAttendanceSummary";
import AttendanceForm from "@/app/components/AttendanceForm";
import DashboardTogglePanel from "@/app/components/DashboardTogglePanel";
import GroupShortageSummary from "@/app/components/GroupShortageSummary";
import DashboardFooter from "@/app/components/Footer";

export default function CECDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [showAttendance, setShowAttendance] = useState(false);
  const [studentTable, setStudentTable] = useState(false);
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState(false);

  const collegeName = user?.collegeName || "College";
  const years = ["First Year", "Second Year"];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#dbeafe_0%,#e0e7ff_30%,#f8fafc_60%,#f8fafc_100%)] pb-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/85 p-6 shadow-[0_20px_55px_-30px_rgba(37,99,235,0.55)] backdrop-blur-md sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="relative grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="mb-3 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Lecturer Panel
              </div>
              <LecturerInfoCard user={user} />
            </div>
            <div className="lg:col-span-1 flex items-center justify-center">
              <GroupAttendanceCard groupName="CEC" />
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Arts Stream
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                  CEC Group Dashboard
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Monitor attendance, absentees, and shortage analytics for CEC batches.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    College: {collegeName}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Group: CEC
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mt-8 border-t border-blue-100 pt-6 text-center">
            <h3 className="text-3xl font-extrabold tracking-tight text-blue-900">
              Attendance Operations Hub
            </h3>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-lg backdrop-blur-sm md:p-6">
          <DashboardTogglePanel
            showAttendance={showAttendance}
            studentTable={studentTable}
            showTodayAbsentees={showTodayAbsentees}
            monthlyAttendance={monthlyAttendance}
            onToggleAttendance={() => setShowAttendance((v) => !v)}
            onToggleStudentTable={() => setStudentTable((v) => !v)}
            onToggleTodayAbsentees={() => setShowTodayAbsentees((v) => !v)}
            onToggleMonthlyAttendance={() => setMonthlyAttendance((v) => !v)}
            attendanceContent={<AttendanceForm defaultGroup="CEC" returnUrl="/dashboards/cec" />}
            studentTableContent={<GroupStudentTable groupName="CEC" />}
            todayAbsenteesContent={<TodayAbsenteesTable groupFilter="CEC" header={false} />}
            groupMonthlyAttendanceContent={
              <div className="mx-auto mt-6 max-w-7xl space-y-8 rounded-2xl bg-white/95 p-4 shadow-sm md:p-6">
                <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">
                  {collegeName} - CEC Attendance
                </h1>
                {years.map((year) => (
                  <GroupAttendanceSummary
                    key={year}
                    group="CEC"
                    yearOfStudy={year}
                    collegeName={collegeName}
                  />
                ))}
                <div className="space-y-8 rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:p-6">
                  <GroupShortageSummary
                    group="CEC"
                    year="First Year"
                    collegeId={session?.user?.collegeId}
                    collegeName={session?.user?.collegeName}
                  />
                  <GroupShortageSummary
                    group="CEC"
                    year="Second Year"
                    collegeId={session?.user?.collegeId}
                    collegeName={session?.user?.collegeName}
                  />
                </div>
              </div>
            }
          />
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm">
          <DashboardFooter
            collegeName={collegeName}
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


