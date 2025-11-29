// app/dashboards/bipc/page.jsx
"use client"
import { useSession } from 'next-auth/react'
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import LecturerInfoCard from "@/app/components/LecturerInfoCard";
import MainLinks from '@/app/components/MainLinks';

export default function BiPCDashboard() {
  const { data: session, status } = useSession()
  const user = session?.user
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


    </div>
  )
}


