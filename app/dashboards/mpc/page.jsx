// app/dashboards/mpc/page.jsx
"use client"
import { useState } from 'react';  // Import useState
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";

import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';
import AttendanceForm from '@/app/components/AttendanceForm';
export default function MPCDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  const [showDetails, setShowDetails] = useState(false);  // State to toggle view

  const collegeName = user?.collegeName || 'College'
  const years = ['First Year', 'Second Year']

return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
             {/* Lecturer Info Card */}
             <LecturerInfoCard  user={user}/>
             
      <h2 className="text-2xl font-bold mt-4 text-blue-800">Science Group Dashboard</h2>

      
      
      <GroupAttendanceCard groupName="MPC" />
      <GroupAttendanceCard groupName="BiPC" />
      {/* 👉 Attendance form ఇక్కడే embed అవుతుంది */}
            <AttendanceForm defaultGroup="MPC" returnUrl="/dashboards/mpc" />




      {/* View toggle button */}
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer mb-4"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide' : 'View'} Details
            </button>
      
            {/* Conditionally render these when showDetails is true */}
            {showDetails && (
              <>
                <TodayAbsenteesTable groupFilter="MPC" header={false} />
                <GroupStudentTable groupName="MPC" />

            <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
            <h1 className="text-2xl font-bold text-center mb-4">
              {collegeName} - MPC Attendance
            </h1>
      
            {years.map(year => (
                    <GroupAttendanceSummary
                      key={year}
                      group="MPC"
                      yearOfStudy={year}
                      collegeName={collegeName}
                    />
                  ))}
          </div>


          <TodayAbsenteesTable groupFilter="BiPC" header={false} />
          <GroupStudentTable groupName="BiPC" />

          <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
                <h1 className="text-2xl font-bold text-center mb-4">
                  {collegeName} - BiPC Attendance
                </h1>
          
                {years.map(year => (
                  <GroupAttendanceSummary
                    key={year}
                    group="BiPC"
                    yearOfStudy={year}
                    collegeName={collegeName}
                  />
                ))}
          </div>

              </>
            )}
</div>
  )
}


