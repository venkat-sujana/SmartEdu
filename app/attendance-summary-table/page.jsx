"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const monthsOrder = [
  "June", "July", "August", "September", "October",
  "November", "December", "January", "February", "March"
];

export default function AttendanceSummaryTable({ studentId: propStudentId }) {
  const params = useParams();
  const studentId = propStudentId || params?.id; // ✅ fallback to route param if prop is missing
  const [summary, setSummary] = useState(null);

useEffect(() => {
  if (!studentId) {
    console.error("studentId not available!");
    return;
  }

  let isMounted = true;
  const fetchData = async () => {
    try {
      console.log("Calling API with ID:", studentId);
      const res = await fetch(`/api/attendance/monthly-summary/${studentId}`);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      const data = await res.json();
      if (isMounted) setSummary(data);
    } catch (error) {
      console.error("Error fetching attendance summary:", error);
      if (isMounted) setSummary({});
    }
  };

  fetchData();
  return () => {
    isMounted = false;
  };
}, [studentId]);


  if (!summary) return <p>Loading...</p>;

  return (
    <div className="overflow-x-auto border rounded-lg p-4 mt-4">
      
      <table className="min-w-full table-auto border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Month</th>
            <th className="border px-4 py-2">Working Days</th>
            <th className="border px-4 py-2">Present Days</th>
            <th className="border px-4 py-2">Attendance %</th>
          </tr>
        </thead>
<tbody>
  {monthsOrder.map(month => {
    const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
    const key = `${month}-${year}`;
    const data = summary[key] || { present: 0, total: 0 };
    const percentage = data.total ? ((data.present / data.total) * 100).toFixed(2) : "0.00";

    return (
      <tr key={key}>
        <td className="border px-4 py-2">{key}</td>
        <td className="border px-4 py-2">{data.total}</td>
        <td className="border px-4 py-2">{data.present}</td>
        <td className="border px-4 py-2">{percentage}%</td>
      </tr>
    );
  })}
</tbody>
{/* 👉 Total Summary Row */}
<tfoot>
  {(() => {
    const totals = monthsOrder.reduce(
      (acc, month) => {
        const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
        const key = `${month}-${year}`;
        const data = summary[key] || { present: 0, total: 0 };
        acc.total += data.total;
        acc.present += data.present;
        return acc;
      },
      { total: 0, present: 0 }
    );
    const overallPercentage = totals.total ? ((totals.present / totals.total) * 100).toFixed(2) : "0.00";

    return (
      <tr className="font-bold bg-gray-100">
        <td className="border px-4 py-2">Total</td>
        <td className="border px-4 py-2">{totals.total}</td>
        <td className="border px-4 py-2">{totals.present}</td>
        <td className="border px-4 py-2">{overallPercentage}%</td>
      </tr>
    );
  })()}
</tfoot>
      </table>
    </div>
  );
}
