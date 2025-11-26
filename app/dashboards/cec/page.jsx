// app/dashboards/cec/page.jsx
"use client"
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
export default function CECDashboard() {
return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">

      <h2 className="text-2xl font-bold mt-24 mb-4 text-blue-800">CEC Group Dashboard</h2>
      <GroupAttendanceCard groupName="CEC" />
      <TodayAbsenteesTable groupFilter="CEC" header={false} />

    </div>
  )
}


