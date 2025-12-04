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
      <GroupAttendanceCard groupName="M&AT" />

      {/* 🔹 All buttons in one horizontal row */}
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => setShowAttendance(!showAttendance)}
        >
          {showAttendance ? 'Hide Attendance' : 'Take Attendance'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => setStudentTable(!studentTable)}
        >
          {studentTable ? 'Hide StudentTable' : 'Show StudentTable'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => setShowTodayAbsentees(!showTodayAbsentees)}
        >
          {showTodayAbsentees ? 'Hide Today Absentees' : 'Show Today Absentees'}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Group Attendance' : 'Show Group Attendance'}
        </button>
      </div>

      {/* 🔹 Content blocks – ప్రతి block తన button row కిందనే render అవుతుంది */}

      {showAttendance && (
        <div className="w-full flex justify-center">
          <AttendanceForm defaultGroup="M&AT" returnUrl="/dashboards/mandat" />
        </div>
      )}

      {studentTable && (
        <div className="w-full max-w-5xl">
          <GroupStudentTable groupName="M&AT" />
        </div>
      )}

      {showTodayAbsentees && (
        <div className="w-full max-w-5xl">
          <TodayAbsenteesTable groupFilter="M&AT" header={false} />
        </div>
      )}

      {showDetails && (
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
      )}
    </div>
  );
}
