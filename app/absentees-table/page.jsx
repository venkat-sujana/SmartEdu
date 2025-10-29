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
      <h2 className="text-2xl font-extrabold text-blue-900 mb-3">
        Today's Absentees (Session-wise)
      </h2>
      {sessions.map((sessionKey) => (
        <div key={sessionKey} className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-blue-700">
              {sessionLabels[sessionKey] || sessionKey}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 shadow pb-2 mb-2">
            <h3 className="font-bold text-base bg-blue-50 px-4 py-2 mb-2 rounded-t-xl text-blue-700">
              Absentees
            </h3>
            {sessionWiseAbsentees[sessionKey] && sessionWiseAbsentees[sessionKey].length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-200">
                    <th className="px-2 py-1 text-left">Name</th>
                    <th className="px-2 py-1 text-center">Year</th>
                    <th className="px-2 py-1 text-center">Group</th>
                    <th className="px-2 py-1 text-center">Lecturer</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionWiseAbsentees[sessionKey].map((student, idx) => (
                    <tr key={student.name + idx} className={idx % 2 === 0 ? '' : 'bg-blue-50'}>
                      <td className="px-2 py-1">{student.name}</td>
                      <td className="px-2 py-1 text-center">{student.yearOfStudy}</td>
                      <td className="px-2 py-1 text-center">{student.group}</td>
                      <td className="px-2 py-1 text-center">{student.lecturerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-4 py-3 text-green-700 font-bold">
                No absentees in this session.
              </div>
            )}
          </div>
        </div>
      ))}
      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-4 mt-4 text-lg font-bold flex items-center gap-8 justify-center">
        <span>Total: {summary.grandTotal}</span>
        <span>Present: {summary.grandPresent}</span>
        <span>Absent: {summary.grandAbsent}</span>
        <span>Attendance%: {summary.percentage}</span>
      </div>
    </div>
  );
}
