"use client";
import { useEffect, useState } from "react";

export default function AttendanceSummaryTable({ studentId }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const teluguMonthNames = [
    "జనవరి", "ఫిబ్రవరి", "మార్చి", "ఏప్రిల్", "మే", "జూన్",
    "జులై", "ఆగస్టు", "సెప్టెంబర్", "అక్టోబర్", "నవంబర్", "డిసెంబర్"
  ];

  useEffect(() => {
    if (!studentId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/attendance/student/${studentId}/monthly`);
        const data = await res.json();

        let formattedData = [];
        if (Array.isArray(data)) {
          formattedData = data.map(item => ({
            month: item.month,
            year: item.year,
            present: item.present || 0,
            workingDays: item.workingDays || 0
          }));
        } else if (typeof data === "object" && data !== null) {
          formattedData = Object.entries(data).map(([key, value]) => {
            const [month, year] = key.split("-");
            return {
              month: parseInt(month, 10),
              year: parseInt(year, 10),
              present: value.present || 0,
              workingDays: value.workingDays || value.total || 0
            };
          });
        }

        setSummary(formattedData);
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  if (loading) {
    return <p>లోడ్ అవుతోంది...</p>;
  }

  if (!Array.isArray(summary) || summary.length === 0) {
    return <p>హాజరు డేటా అందుబాటులో లేదు</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg shadow">
      <table className="min-w-full border-collapse bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">నెల</th>
            <th className="border p-2">సంవత్సరం</th>
            <th className="border p-2">హాజరు</th>
            <th className="border p-2">పని దినాలు</th>
            <th className="border p-2">శాతం</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, idx) => {
            const percentage =
              row.workingDays > 0
                ? ((row.present / row.workingDays) * 100).toFixed(2)
                : "0.00";
            return (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border p-2">
                  {Number.isInteger(row.month) && row.month >= 1 && row.month <= 12
                    ? teluguMonthNames[row.month - 1]
                    : String(row.month)}
                </td>
                <td className="border p-2">{row.year}</td>
                <td className="border p-2">{row.present}</td>
                <td className="border p-2">{row.workingDays}</td>
                <td className="border p-2">{percentage}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}