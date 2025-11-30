// app/dashboards/gfc/page.jsx
"use client"
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import MainLinks from '@/app/components/MainLinks';
import GroupStudentTable from "../../components/GroupStudentTable";

export default function GFCDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user
return (
    <div className=" flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
             {/* Lecturer Info Card */}
             <LecturerInfoCard  user={user}/>

      <h2 className="text-2xl font-bold mt-4  text-blue-800">GFC Dashboard</h2>

      <MainLinks/>
      
      <GroupAttendanceCard groupName="M&AT" />
      <TodayAbsenteesTable groupFilter="M&AT" header={false} />

      <GroupAttendanceCard groupName="CET" />
      <TodayAbsenteesTable groupFilter="CET" header={false} />

      <GroupAttendanceCard groupName="MLT" />
      <TodayAbsenteesTable groupFilter="MLT" header={false} />

      <GroupStudentTable groupName="M&AT" />
      <GroupStudentTable groupName="CET" />
      <GroupStudentTable groupName="MLT" />
           

    </div>
  )
}


