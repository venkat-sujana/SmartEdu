// app/dashboards/mandat/page.jsx
'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import ExternalLinks from "@/app/components/ExternalLinks";
import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';
import AttendanceForm from '@/app/components/AttendanceForm';
import DashboardTogglePanel from '@/app/components/DashboardTogglePanel';


export default function MandATDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [showAttendance, setShowAttendance] = useState(false);
  const [studentTable, setStudentTable] = useState(false);
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const collegeName = user?.collegeName || 'College';
  const years = ['First Year', 'Second Year'];

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      <LecturerInfoCard user={user} />

      <h2 className="text-2xl font-extrabold tracking-tight mt-2 text-blue-800">
        MandAT Group Dashboard
      </h2>

      <ExternalLinks />

          <DashboardTogglePanel
       // state flags
        showAttendance={showAttendance}
        studentTable={studentTable}
        showTodayAbsentees={showTodayAbsentees}
        showDetails={showDetails}
        // handlers
        onToggleAttendance={() => setShowAttendance((v) => !v)}
        onToggleStudentTable={() => setStudentTable((v) => !v)}
        onToggleTodayAbsentees={() => setShowTodayAbsentees((v) => !v)}
        onToggleGroupAttendance={() => setShowDetails((v) => !v)}
        // content (JSX)
        attendanceContent={
          <AttendanceForm defaultGroup="M&AT" returnUrl="/dashboards/mandat" />
        }
        studentTableContent={
          <GroupStudentTable groupName="M&AT" />
        }
        todayAbsenteesContent={
          <TodayAbsenteesTable groupFilter="M&AT" header={false} />
        }
        groupAttendanceContent={
          <div className="mx-auto mt-10 max-w-7xl p-4 md:p-6 space-y-8">
            <h1 className="text-2xl font-bold text-center mb-4">
              {collegeName} - M&AT Attendance
            </h1>
            {years.map((year) => (
              <GroupAttendanceSummary
                key={year}
                group="M&AT"
                yearOfStudy={year}
                collegeName={collegeName}
              />
            ))}
          </div>
        }
       />


      <GroupAttendanceCard groupName="M&AT" />





    </div>
  );
}
