// app/dashboards/mandat/page.jsx
import TodayAbsenteesTable from "@/app/absentees-table/page";
import GroupAttendanceCard from "@/app/components/OverallAttendanceMatrixCard/GroupAttendanceCard";
import Link from 'next/link'
export default function MandATDashboard({collegeName}) {
  return (
    <div className="flex flex-col items-center gap-8 min-h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      {collegeName && (
          <h3 className="text-base font-semibold text-blue-600 mt-2">{collegeName}</h3>
        )}

        <Link href="/attendance-form">
                  <button className="w-full cursor-pointer rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-bold text-white shadow transition hover:scale-105 sm:w-auto">
                    Take attendance
                  </button>
        </Link>
      <h2 className="text-2xl font-bold mt-24 mb-4 text-blue-800">MandAT Group Dashboard</h2>
      <GroupAttendanceCard groupName="M&AT" />
      <TodayAbsenteesTable groupFilter="M&AT" header={false} />
     
    </div>
  )
}
