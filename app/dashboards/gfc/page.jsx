// app/dashboards/gfc/page.jsx
"use client"
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import Link from 'next/link'
export default function GFCDashboard() {
return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">

      <h2 className="text-2xl font-bold mt-24  text-blue-800">GFC Dashboard</h2>
      <Link
      href="/attendance-form"
      className=" px-4 py-1 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-md hover:bg-blue-800 transition tracking-wide"
    >
      Take Attendance
    </Link>
      <GroupAttendanceCard groupName="M&AT" />
      <TodayAbsenteesTable groupFilter="M&AT" header={false} />

      <GroupAttendanceCard groupName="CET" />
      <TodayAbsenteesTable groupFilter="CET" header={false} />

      <GroupAttendanceCard groupName="MLT" />
      <TodayAbsenteesTable groupFilter="MLT" header={false} />
           

    </div>
  )
}


