//app/absentees-table/page.jsx

"use client";
import { useEffect, useState } from "react";

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
  EN: "Evening",
};
import { UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'

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

  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 text-white rounded-xl py-2 shadow-lg tracking-wide flex items-center justify-center gap-2">
        <span>📋</span>
        Today's Absentees{" "}
        <span className="text-base font-normal italic text-white/80">(Session-wise)</span>
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

              {/* First & Second Years */}
              {["First Year", "Second Year"].map((yearKey) => {
                const yearStudents = sessionWiseAbsentees[sessionKey]?.filter(
                  (student) => student.yearOfStudy === yearKey
                );

                const groups = [...new Set(yearStudents?.map((s) => s.group))];

                return (
                  <div key={yearKey} className="mb-3 px-6 py-4 bg-cyan-50 rounded-xl">
                    <div className="font-semibold text-blue-800 text-lg mb-2">
                      🎓 {yearKey}
                    </div>

                    {groups.length > 0 ? (
                      groups.map((grp) => {
                        const groupList = yearStudents.filter((s) => s.group === grp);

                        const lecturerName = groupList[0]?.lecturerName || "-";
                        const markedAt = groupList[0]?.markedAt || null;

                        return (
                          <div
                            key={grp}
                            className="mb-4 border border-cyan-300 rounded-xl bg-white shadow-sm"
                          >
                            <div className="px-4 py-2 bg-cyan-200 rounded-t-xl flex justify-between items-center">
                              <span className="font-bold text-blue-900 flex flex items-center gap-1">
                                 Group:<UserGroupIcon className="h-5 w-5 text-indigo-600" /> {grp}
                              </span>
                              <span className="text-sm text-blue-900">
                                Marked By:
                                <span className="font-bold ml-1">{lecturerName}</span>
                                <span className="ml-4">⏱ {formatTime(markedAt)}</span>
                              </span>
                            </div>

                            {groupList.length > 0 ? (
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-blue-200 text-blue-900">
                                    <th className="px-2 py-1 w-12 text-center rounded-l-xl">
                                      S.No
                                    </th>
                                    <th className="px-2 py-1 text-left">👤 Name</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupList.map((student, idx) => (
                                    <tr
                                      key={student.name + idx}
                                      className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}
                                    >
                                      <td className="px-2 py-1 text-center font-bold">
                                        {idx + 1}
                                      </td>
                                      <td className="px-2 py-1 font-medium text-blue-900">
                                        {student.name}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="py-2 text-green-700 text-center font-semibold">
                                No absentees in this group
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-2 text-green-700 text-center font-semibold">
                        No absentees in {yearKey}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
