// app/dashboards/bipc/page.jsx
"use client"
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import MainLinks from '@/app/components/MainLinks';
import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';


export default function BiPCDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  console.log('BiPCDashboard - useSession: ', session)
  console.log('BiPCDashboard - user: ', user)

  const collegeName = user?.collegeName || 'College'
  const years = ['First Year', 'Second Year']

  console.log('BiPCDashboard - collegeName: ', collegeName)
  console.log('BiPCDashboard - years: ', years)


  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      {/* Lecturer Info Card */}
      <LecturerInfoCard user={user} />

      <h2 className="text-xl font-extrabold tracking-tight  mt-4 text-blue-800">Science Group Dashboard</h2>

      <MainLinks />

      <GroupAttendanceCard groupName="BiPC" />
      <TodayAbsenteesTable groupFilter="BiPC" header={false} />

      <GroupAttendanceCard groupName="MPC" />
      <TodayAbsenteesTable groupFilter="MPC" header={false} />
      
      <GroupStudentTable groupName="BiPC" />
      <GroupStudentTable groupName="MPC" />

      <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
        <h1 className="text-2xl font-bold text-center mb-4">
          {collegeName} - BiPC Attendance
        </h1>

        {years.map(year => (
          <GroupAttendanceSummary
            key={year}
            group="BiPC"          // exactగా ఇలా ఉండాలి
            yearOfStudy={year}    // "First Year" / "Second Year"
            collegeName={collegeName}
          />
        ))}
      </div>

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


      


    </div>
  )
}


