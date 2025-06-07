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
<div className="overflow-x-auto border rounded-lg mt-4">
  <table className="min-w-full table-fixed border-collapse border">
    <thead>
      <tr className="bg-teal-500 text-white">
        <th className="border px-2 py-1 w-32">Month</th>
        {["JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC", "JAN", "FEB", "MAR", "TOTAL"].map((mon) => (
          <th key={mon} className="border px-2 py-1">{mon}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td className="border px-2 py-1 font-medium">Working Days</td>
        {monthsOrder.map((month) => {
          const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
          const key = `${month}-${year}`;
          const data = summary[key] || { total: 0 };
          return <td key={key} className="border px-2 py-1 text-center">{data.total}</td>;
        })}
        <td className="border px-2 py-1 text-center font-bold">
          {monthsOrder.reduce((acc, month) => {
            const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
            const key = `${month}-${year}`;
            return acc + (summary[key]?.total || 0);
          }, 0)}
        </td>
      </tr>

      <tr>
        <td className="border px-2 py-1 font-medium">Present</td>
        {monthsOrder.map((month) => {
          const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
          const key = `${month}-${year}`;
          const data = summary[key] || { present: 0 };
          return <td key={key} className="border px-2 py-1 text-center">{data.present}</td>;
        })}
        <td className="border px-2 py-1 text-center font-bold">
          {monthsOrder.reduce((acc, month) => {
            const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
            const key = `${month}-${year}`;
            return acc + (summary[key]?.present || 0);
          }, 0)}
        </td>
      </tr>

      <tr>
        <td className="border px-2 py-1 font-medium">Percent</td>
        {monthsOrder.map((month) => {
          const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
          const key = `${month}-${year}`;
          const data = summary[key] || { present: 0, total: 0 };
          const percentage = data.total ? ((data.present / data.total) * 100).toFixed(2) : "0.00";
          return <td key={key} className="border px-2 py-1 text-center">{percentage}%</td>;
        })}
        <td className="border px-2 py-1 text-center font-bold">
          {(() => {
            const totals = monthsOrder.reduce(
              (acc, month) => {
                const year = ["January", "February", "March"].includes(month) ? "2026" : "2025";
                const key = `${month}-${year}`;
                const data = summary[key] || { present: 0, total: 0 };
                acc.present += data.present;
                acc.total += data.total;
                return acc;
              },
              { present: 0, total: 0 }
            );
            return totals.total ? ((totals.present / totals.total) * 100).toFixed(2) + "%" : "0.00%";
          })()}
        </td>
      </tr>
    </tbody>
  </table>
</div>

  );
}
