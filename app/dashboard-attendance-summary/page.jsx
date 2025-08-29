"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function StudentAttendanceSummary() {
  const { data: session } = useSession();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = session?.user?.id;

  useEffect(() => {
    if (!studentId) return;

    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/api/attendance/student/${studentId}`);
        const data = await res.json();
        setAttendance(data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  if (loading) return <p className="text-center mt-10 animate-pulse">Loading Attendance...</p>;
  if (!attendance) return <p className="text-center mt-10 text-red-500">No Attendance Data Found</p>;

  // Example: data structure from your API
  const { totalClasses, presentClasses, absentClasses, monthlyPercentage } = attendance;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
      <div className="bg-green-100 shadow-md rounded-xl p-6 text-center">
        <p className="text-gray-600 font-semibold">Present</p>
        <p className="text-2xl font-bold text-green-700">{presentClasses}</p>
      </div>
      <div className="bg-red-100 shadow-md rounded-xl p-6 text-center">
        <p className="text-gray-600 font-semibold">Absent</p>
        <p className="text-2xl font-bold text-red-700">{absentClasses}</p>
      </div>
      <div className="bg-blue-100 shadow-md rounded-xl p-6 text-center">
        <p className="text-gray-600 font-semibold">Total Classes</p>
        <p className="text-2xl font-bold text-blue-700">{totalClasses}</p>
      </div>
      <div className="bg-yellow-100 shadow-md rounded-xl p-6 text-center">
        <p className="text-gray-600 font-semibold">Monthly %</p>
        <p className="text-2xl font-bold text-yellow-700">{monthlyPercentage}%</p>
      </div>
    </div>
  );
}
