// app/dashboards/mandat/page.jsx
import { useSession } from "next-auth/react";
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";

import Link from 'next/link'

export default function MandATDashboard({collegeName,groupFilter}) {

  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      
      <h2 className="text-xl font-bold mt-24   text-blue-800">MandAT Group Dashboard</h2>
      <Link
        href="/attendance-form"
        className="mb-2 px-1 py-1 bg-blue-600 text-white rounded-full text-lg font-semibold shadow-md hover:bg-blue-800 transition tracking-wide"
      >
        👉 Mark Attendance for M&AT
      </Link>
      <GroupAttendanceCard groupName="M&AT" />
      <TodayAbsenteesTable groupFilter="M&AT" header={false} />
     
    </div>
  )
}
