// app/dashboards/cec/page.jsx
"use client"
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import Link from 'next/link'
export default function CECDashboard() {
return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">

      <h2 className="text-xl font-bold mt-24  text-blue-800">Arts Group Dashboard</h2>
    <Link
      href="/attendance-form"
      className="mb-2 px-2 py-2 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-md hover:bg-blue-800 transition tracking-wide"
    >
      Take Attendance
    </Link>
      <GroupAttendanceCard groupName="CEC" />
      <TodayAbsenteesTable groupFilter="CEC" header={false} />
      
      <GroupAttendanceCard groupName="HEC" />
      <TodayAbsenteesTable groupFilter="HEC" header={false} />
      </div>
  )
}


