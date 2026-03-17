//src/app/principal/dashboard/AttendanceOverviewTable.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-4 py-3">
        <div className="h-4 w-20 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-12 rounded bg-slate-200" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 rounded bg-slate-200" />
      </td>
    </tr>
  );
}

export default function AttendanceOverviewTable({ title, rows = [], loading = false }) {
  return (
    <Card className="rounded-3xl border-slate-200 bg-white/90 shadow-md">
      <CardHeader className="border-b border-slate-100 pb-3">
        <CardTitle className="text-lg font-extrabold tracking-tight text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Total Students</th>
                <th className="px-4 py-3">Present</th>
                <th className="px-4 py-3">Absent</th>
                <th className="px-4 py-3">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => <TableRowSkeleton key={index} />)
              ) : rows.length > 0 ? (
                rows.map((row, index) => (
                  <tr
                    key={`${row.group}-${index}`}
                    className="border-b border-slate-100 transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-blue-50/70"
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.group}</td>
                    <td className="px-4 py-3 text-slate-700">{row.totalStudents}</td>
                    <td className="px-4 py-3 text-emerald-700">{row.present}</td>
                    <td className="px-4 py-3 text-rose-700">{row.absent}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{row.percentage}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No attendance data available for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
