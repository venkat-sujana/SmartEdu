
//src/components/attendance/GroupShortageSummary.jsx
"use client";
import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

const months = [
  { label: "JUN", year: "2025" },
  { label: "JUL", year: "2025" },
  { label: "AUG", year: "2025" },
  { label: "SEP", year: "2025" },
  { label: "OCT", year: "2025" },
  { label: "NOV", year: "2025" },
  { label: "DEC", year: "2025" },
  { label: "JAN", year: "2026" },
  { label: "FEB", year: "2026" },
  { label: "MAR", year: "2026" },
];

export default function GroupShortageSummary({
  group,
  year,
  collegeId,
  collegeName = "College",
  className = "",
}) {
  const [summaryData, setSummaryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const printAreaId = `print-area-${String(group || "group").replace(/\W+/g, "-")}-${String(year || "year").replace(/\W+/g, "-")}`;

  useEffect(() => {
    if (!group || !year || !collegeId) return;

    const fetchData = async () => {
      try {
        setSummaryData([]);
        const res = await fetch(
          `/api/attendance/monthly-summary?group=${encodeURIComponent(group)}&yearOfStudy=${encodeURIComponent(year)}&collegeId=${collegeId}`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
        const data = await res.json();
        setSummaryData(data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [group, year, collegeId]);

  const filteredData = summaryData.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const shortageFilteredData = filteredData.filter(student => {
    const totalPresent = months.reduce((sum, { label, year: monthYear }) => {
      const key = `${label}-${monthYear}`;
      return sum + (student.present?.[key] || 0);
    }, 0);
    const totalWorking = months.reduce((sum, { label, year: monthYear }) => {
      const key = `${label}-${monthYear}`;
      return sum + (student.workingDays?.[key] || 0);
    }, 0);
    const overallPercent = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;
    return overallPercent < 75;
  });

  const handlePrint = () => {
    const printContent = document.getElementById(printAreaId)?.innerHTML || "";
    const printWindow = window.open("", "", "width=1000,height=700");
    printWindow.document.write(`
      <html>
        <head>
          <title>${group} ${year} - Shortage Students</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid black; padding: 6px; text-align: center; font-size: 13px; }
            th { background-color: #0f172a; color: white; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!group || !year) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        Select group and year to view shortage summary.
      </div>
    );
  }

  return (
    <div className={`mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{group} - {year}</h2>
          <p className="text-sm text-slate-600">{collegeName}</p>
        </div>
        <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
          Attendance below 75%
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <input
          type="text"
          placeholder="Search student"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="min-w-[180px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500"
        />
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Printer size={18} />
          Print
        </button>
      </div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Shortage Students
      </h3>

      <div id={printAreaId} className="overflow-x-auto rounded-xl border border-slate-200">
        {shortageFilteredData.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No students with attendance below 75%
          </p>
        ) : (
          <table className="w-full table-auto text-sm">
            <thead className="bg-slate-800 text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="w-14 border border-slate-700 p-2 text-center">S.No</th>
                <th className="border border-slate-700 p-2 text-left">Student</th>
                <th className="border border-slate-700 p-2 text-center">Working Days</th>
                <th className="border border-slate-700 p-2 text-center">Present Days</th>
                <th className="border border-slate-700 p-2 text-center">% Attendance</th>
                <th className="border border-slate-700 p-2 text-center">Shortage</th>
                <th className="w-28 border border-slate-700 p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {shortageFilteredData.map((student, idx) => {
                const totalPresent = months.reduce((sum, { label, year: monthYear }) => {
                  const key = `${label}-${monthYear}`;
                  return sum + (student.present?.[key] || 0);
                }, 0);
                const totalWorking = months.reduce((sum, { label, year: monthYear }) => {
                  const key = `${label}-${monthYear}`;
                  return sum + (student.workingDays?.[key] || 0);
                }, 0);
                const percent = totalWorking > 0 ? ((totalPresent / totalWorking) * 100).toFixed(2) : "0.00";
                const requiredDays = Math.ceil(totalWorking * 0.75);
                const shortage = requiredDays - totalPresent;

                return (
                  <tr key={idx} className="transition odd:bg-white even:bg-slate-50 hover:bg-blue-50">
                    <td className="border border-slate-200 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-200 p-2 font-medium text-slate-900">{student.name}</td>
                    <td className="border border-slate-200 p-2 text-center">{totalWorking}</td>
                    <td className="border border-slate-200 p-2 text-center">{totalPresent}</td>
                    <td className="border border-slate-200 p-2 text-center">{percent}%</td>
                    <td className="border border-slate-200 p-2 text-center">
                      <span className="font-semibold text-rose-700">{shortage}</span>
                    </td>
                    <td className="border border-slate-200 p-2 text-center">
                      <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                        Below 75%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
