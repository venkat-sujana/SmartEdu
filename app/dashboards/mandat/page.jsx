'use client';
import Link from 'next/link'
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
import GroupShortageSummary from '@/app/components/GroupShortageSummary';
import DashboardFooter from "@/app/components/Footer";
import IndividualReport from "@/app/components/Attendance/IndividualReport";

export default function MandATDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const [showAttendance, setShowAttendance] = useState(false);
  const [studentTable, setStudentTable] = useState(false);
  const [showTodayAbsentees, setShowTodayAbsentees] = useState(false);
  const [monthlyAttendance, setMonthlyAttendance] = useState(false);
  const [editAttendance, setEditAttendance] = useState(false);

  const collegeName = user?.collegeName || 'College';
  const years = ['First Year', 'Second Year'];

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      
      {/* Combined Responsive Header Section */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* Lecturer Info - Full width on mobile, left column on desktop */}
          <div className="lg:col-span-1">
            <LecturerInfoCard user={user} />
          </div>
          
          {/* Group Attendance Card - Full width on mobile, center column on desktop */}
          <div className="lg:col-span-1 flex justify-center">
            <GroupAttendanceCard groupName="M&AT" />
          </div>
          
          {/* External Links - Full width on mobile, right column on desktop */}
          <div className="lg:col-span-1">
            <ExternalLinks />
          </div>
        </div>
        
        {/* Dashboard Title - Centered below cards */}
        <div className="text-center mt-8 pt-8 border-t border-blue-100">
          <h2 className="text-3xl font-extrabold tracking-tight text-blue-800">
            MandAT Group Dashboard
          </h2>
        </div>
      </section>

      <DashboardTogglePanel
        // state flags
        showAttendance={showAttendance}
        studentTable={studentTable}
        showTodayAbsentees={showTodayAbsentees}
        monthlyAttendance={monthlyAttendance}
        editAttendance={editAttendance}

        // handlers
        onToggleAttendance={() => setShowAttendance((v) => !v)}
        onToggleStudentTable={() => setStudentTable((v) => !v)}
        onToggleTodayAbsentees={() => setShowTodayAbsentees((v) => !v)}
        onToggleMonthlyAttendance={() => setMonthlyAttendance((v) => !v)}
        onToggleEditAttendance={() => setEditAttendance((v) => !v)}

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

        editAttendanceContent={
          <IndividualReport groupName="M&AT" header={false} />
        }

        groupMonthlyAttendanceContent={
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

            <div className="p-6 space-y-8">
              {/* First Year Shortage */}
              <GroupShortageSummary
                group="M&AT"
                year="First Year"
                collegeId={session?.user?.collegeId}
                collegeName={session?.user?.collegeName}
              />

              {/* Second Year Shortage */}
              <GroupShortageSummary
                group="M&AT"
                year="Second Year"
                collegeId={session?.user?.collegeId}
                collegeName={session?.user?.collegeName}
              />
            </div>
          </div>
        }
      />
      
      {/* footer */}
      <DashboardFooter
        collegeName={collegeName}
        facebookUrl="https://facebook.com/yourcollege"
        instagramUrl="https://instagram.com/yourcollege"
        twitterUrl="https://x.com/yourcollege"
        youtubeUrl="https://youtube.com/@yourcollege"
      />
    </div>
  );
}
