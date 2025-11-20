"use client";
import { useEffect, useState } from "react";
import { UserGroupIcon } from '@heroicons/react/24/solid';

const sessionLabels = {
  FN: "Forenoon",
  AN: "Afternoon",
  EN: "Evening",
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

  const { sessionWiseAbsentees, sessionWisePresent, summary, sessions } = absData;

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
    <div className="max-w-5xl mx-auto my-6">
      <h2 className="text-3xl font-extrabold mb-7 text-center bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 text-white rounded-2xl py-4 shadow-xl tracking-wide flex items-center justify-center gap-3 drop-shadow-lg border border-blue-300">
        <span>📋</span>
        Today's Absentees{" "}
        <span className="text-lg font-light italic text-white/80">(Session-wise)</span>
      </h2>

      <div className="space-y-9">
        {sessions.map((sessionKey) => (
          <div key={sessionKey} className="mb-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-2 rounded-xl text-xl font-bold shadow-lg border border-blue-300 drop-shadow">
                {sessionLabels[sessionKey] || sessionKey}
              </span>
            </div>

            <div className="bg-gradient-to-br from-white via-cyan-100 to-blue-50 rounded-3xl border-2 border-cyan-200 shadow-lg pb-2 mb-2">
              <h3 className="font-semibold text-lg bg-gradient-to-r from-cyan-300 to-emerald-100 px-7 py-4 mb-2 rounded-t-3xl text-blue-900 tracking-wide border-b border-blue-200">
                Absentees List
              </h3>

              {["First Year", "Second Year"].map((yearKey) => {
                const yearStudents = sessionWiseAbsentees[sessionKey]?.filter(
                  (student) => student.yearOfStudy === yearKey
                );

                const groups = [...new Set(yearStudents?.map((s) => s.group))];

                // Modern effect for present in FN & absent in AN
                const fnPresentNames = new Set(
                  (sessionWisePresent?.FN || [])
                    .filter(stu => stu.yearOfStudy === yearKey)
                    .map(stu => stu.name)
                );

                return (
                  <div key={yearKey} className="mb-7 px-7 py-5 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 rounded-2xl border border-cyan-200 shadow-sm">
                    <div className="font-semibold text-blue-800 text-xl mb-3 flex items-center gap-2">
                      <span>🎓</span> {yearKey}
                    </div>

                    {groups.length > 0 ? (
                      groups.map((grp) => {
                        const groupList = yearStudents.filter((s) => s.group === grp);

                        const lecturerName = groupList[0]?.lecturerName || "-";
                        const markedAt = groupList[0]?.markedAt || null;

                        return (
                          <div
                            key={grp}
                            className="mb-6 border-2 border-cyan-400 rounded-2xl bg-white shadow-md hover:shadow-2xl transition-shadow duration-300"
                          >
                            <div className="px-4 py-3 bg-gradient-to-r from-cyan-200 to-blue-100 rounded-t-2xl flex justify-between items-center border-b border-cyan-300">
                              <span className="font-bold text-blue-900 flex flex items-center gap-2 text-lg">
                                Group:
                                <UserGroupIcon className="h-6 w-6 text-indigo-600" /> {grp}
                              </span>
                              <span className="text-base text-blue-900">
                                Marked By:
                                <span className="font-bold ml-1">{lecturerName}</span>
                                <span className="ml-4">⏱ {formatTime(markedAt)}</span>
                              </span>
                            </div>

                            {groupList.length > 0 ? (
                              <table className="w-full rounded-b-2xl">
                                <thead>
                                  <tr className="bg-blue-100 text-blue-900">
                                    <th className="px-2 py-2 w-12 text-center rounded-l-xl font-bold">
                                      S.No
                                    </th>
                                    <th className="px-2 py-2 text-left font-bold">👤 Name</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupList.map((student, idx) => {
                                    const highlightRed = sessionKey === "AN" && fnPresentNames.has(student.name);
                                    return (
                                      <tr
                                        key={student.name + idx}
                                        className={idx % 2 === 0 ? "bg-white" : "bg-blue-50 hover:bg-blue-100"}
                                      >
                                        <td className="px-2 py-2 text-center font-bold">
                                          {idx + 1}
                                        </td>
                                        <td className={`px-2 py-2 font-medium transition-colors duration-200 ${
                                          highlightRed
                                            ? "bg-red-100 text-red-600 font-extrabold animate-pulse rounded"
                                            : "text-blue-900"
                                        }`}>
                                          {student.name}
                                          {highlightRed && (
                                            <span className="ml-2 text-xs bg-red-200 px-2 rounded font-semibold text-red-700 shadow-sm">FN Present⮕AN Absent</span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <div className="py-4 text-green-700 text-center font-semibold">
                                No absentees in this group
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 text-green-700 text-center font-semibold">
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
  
<style jsx>{`
  .blink-red {
    animation: blinkRed 1s linear infinite;
  }
  @keyframes blinkRed {
    0%, 100% { color: #dc2626; background-color: #d38e8eff; }
    80% { color: #b91c1c; background-color: #d11e1eff; }
  }
`}</style>

}
