// app/dashboards/cet/page.jsx
"use client"
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
export default function CETDashboard() {
return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">

      <h2 className="text-2xl font-bold mt-24 mb-4 text-blue-800">CET Group Dashboard</h2>
      <GroupAttendanceCard groupName="CET" />
      <TodayAbsenteesTable groupFilter="CET" header={false} />
           

    </div>
  )
}


