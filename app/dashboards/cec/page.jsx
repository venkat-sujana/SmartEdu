// app/dashboards/cec/page.jsx
"use client"
import { useState } from 'react';  // Import useState
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";

import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';
import AttendanceForm from '@/app/components/AttendanceForm';
export default function CECDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  const [showDetails, setShowDetails] = useState(false);  // State to toggle view
  

  const collegeName = user?.collegeName || 'College'

const years = ['First Year', 'Second Year']

return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
             {/* Lecturer Info Card */}
             <LecturerInfoCard  user={user}/>

      <h2 className="text-xl font-bold mt-4  text-blue-800">Arts Group Dashboard</h2>

    
    
      <GroupAttendanceCard groupName="CEC" />
      <GroupAttendanceCard groupName="HEC" />

      {/* 👉 Attendance form ఇక్కడే embed అవుతుంది */}
                        <AttendanceForm defaultGroup="CEC" returnUrl="/dashboards/cec" />


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
                      <TodayAbsenteesTable groupFilter="CEC" header={false} />
                      <GroupStudentTable groupName="CEC" />
      
                  <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
                  <h1 className="text-2xl font-bold text-center mb-4">
                    {collegeName} - CEC Attendance
                  </h1>
            
                  {years.map(year => (
                          <GroupAttendanceSummary
                            key={year}
                            group="CEC"
                            yearOfStudy={year}
                            collegeName={collegeName}
                          />
                        ))}
                </div>
      
      
                <TodayAbsenteesTable groupFilter="HEC" header={false} />
                <GroupStudentTable groupName="HEC" />
      
                <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
                      <h1 className="text-2xl font-bold text-center mb-4">
                        {collegeName} - HEC Attendance
                      </h1>
                
                      {years.map(year => (
                        <GroupAttendanceSummary
                          key={year}
                          group="HEC"
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


