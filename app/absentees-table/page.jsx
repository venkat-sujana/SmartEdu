"use client";
import { useEffect, useState } from "react";

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
  EN: "Evening"
};

export default function TodayAbsenteesTable({ collegeId }) {
  const [loading, setLoading] = useState(true);
  const [absData, setAbsData] = useState(null);

  useEffect(() => {
    const fetchAbsentees = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/attendance/today-absentees`);
        const json = await res.json();
        setAbsData(json);
      } catch (err) {
        setAbsData(null);
      }
      setLoading(false);
    };
    fetchAbsentees();
  }, [collegeId]);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!absData || absData.status !== "success") {
    return (
      <div className="w-full p-8 text-xl text-center text-red-600 font-bold">
        No attendance recorded today.
      </div>
    );
  }

  const { sessionWiseAbsentees, summary, sessions } = absData;

  return (
   <div className="max-w-4xl mx-auto">
  <h2
    className="text-2xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 text-white rounded-xl py-2 shadow-lg tracking-wide flex items-center justify-center gap-2"
  >
    <span>📋</span>
    Today's Absentees <span className="text-base font-normal italic text-white/80">(Session-wise)</span>
  </h2>
  <div className="space-y-6">
    {sessions.map((sessionKey) => (
      <div key={sessionKey} className="mb-3">
        <div className="flex items-center gap-2 mb-2 ml-2">
          <span className="inline-flex bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-5 py-1 rounded-full text-lg font-bold shadow">
            {sessionLabels[sessionKey] || sessionKey}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-cyan-100 shadow-lg pb-2 mb-2">
          <h3 className="font-semibold text-base bg-gradient-to-r from-cyan-100 to-emerald-50 px-6 py-2 mb-2 rounded-t-2xl text-blue-900 tracking-wide">
            Absentees List
          </h3>
          {/* First Year & Second Year split */}
          {["First Year", "Second Year"].map((yearKey) => {
            // Filter absentees by year
            const absList = sessionWiseAbsentees[sessionKey]?.filter(
              (student) => student.yearOfStudy === yearKey
            );
            // Find Lecturer name
            const lecturerName =
              absList && absList.length > 0
                ? absList[0]?.lecturerName || "-"
                : "-";
            return (
              <div key={yearKey} className="mb-3 px-6 py-4 bg-cyan-50 rounded-xl">
                <div className="flex flex-row gap-6 items-center mb-2">
                  <div className="font-semibold text-blue-800 flex flex-row gap-2 items-center">
                    🎓 {yearKey}
                    <span className="text-gray-500 text-base font-normal ml-2">
                      Attendance Marked By: <span className="text-blue-700 font-bold">{lecturerName}</span>
                    </span>
                  </div>
                </div>
                {absList && absList.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-200">
                        <th className="px-2 py-1 rounded-l-xl w-12 text-center">S.No</th>
                        <th className="px-2 py-1 text-left">👤 Name</th>
                        <th className="px-2 py-1 text-center">📚 Group</th>
                      </tr>
                    </thead>
                    <tbody>
                      {absList.map((student, idx) => (
                        <tr key={student.name + idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                          <td className="px-2 py-1 text-center font-bold">{idx + 1}</td>
                          <td className="px-2 py-1 font-medium text-blue-900">{student.name}</td>
                          <td className="px-2 py-1 text-center">{student.group}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-2 text-green-700 text-center font-semibold">No absentees in {yearKey}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    ))}
  </div>
  {/* Summary */}
  <div className="bg-gradient-to-r from-blue-100 via-cyan-100 to-emerald-100 rounded-2xl p-4 mt-6 text-lg font-bold flex items-center gap-10 justify-center shadow">
    <span>👥 Total: <span className="text-blue-700">{summary.grandTotal}</span></span>
    <span>🟢 Present: <span className="text-emerald-600">{summary.grandPresent}</span></span>
    <span>🔴 Absent: <span className="text-red-600">{summary.grandAbsent}</span></span>
    <span>📈 Attendance%: <span className="text-purple-600">{summary.percentage}</span></span>
  </div>
</div>

  );
}
