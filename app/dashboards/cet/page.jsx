// app/dashboards/cet/page.jsx
"use client"
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import MainLinks from '@/app/components/MainLinks';
import ExternalLinks from "@/app/components/ExternalLinks";
import GroupStudentTable from "../../components/GroupStudentTable";
import GroupAttendanceSummary from '@/app/components/GroupAttendanceSummary';

export default function CETDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user

  const collegeName = user?.collegeName || 'College'
const years = ['First Year', 'Second Year']


return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
             {/* Lecturer Info Card */}
             <LecturerInfoCard  user={user}/>

      <h2 className="text-2xl font-bold mt-4 text-blue-800">CET Group Dashboard</h2>

      <MainLinks/>
      <ExternalLinks />
      
      <GroupAttendanceCard groupName="CET" />
      <TodayAbsenteesTable groupFilter="CET" header={false} />
      <GroupStudentTable groupName="CET" />

      <div className="mx-auto mt-20 max-w-7xl p-4 md:p-6 space-y-8">
            <h1 className="text-2xl font-bold text-center mb-4">
              {collegeName} - CET Attendance
            </h1>
      
            {years.map(year => (
              <GroupAttendanceSummary
                key={year}
                group="CET"
                yearOfStudy={year}
                collegeName={collegeName}
              />
            ))}
          </div>


    </div>
  )
}


