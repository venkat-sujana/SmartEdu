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

export default function MandATDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

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

      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-4"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide' : 'Take'} Attendance 
      </button>

      {showDetails && (
        <>
          {/* 👉 Attendance form ఇక్కడే embed అవుతుంది */}
      <AttendanceForm defaultGroup="M&AT" returnUrl="/dashboards/mandat" />
          
        </>
      )}
      <GroupAttendanceCard groupName="M&AT" />


      


      







      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-4"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? 'Hide' : 'View'} Details
      </button>

      {showDetails && (
        <>
          <TodayAbsenteesTable groupFilter="M&AT" header={false} />
          <GroupStudentTable groupName="M&AT" />
          <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
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
        </>
      )}
    </div>
  );
}
