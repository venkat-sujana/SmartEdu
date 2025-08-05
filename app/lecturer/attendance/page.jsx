//app/lecturer/attendance/page.jsx

'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AttendancePage() {
  const { data: session } = useSession();
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("/api/attendance/today-list", {
        params: {
          collegeId: session?.user?.collegeId,
          date,
        },
      });
      setAttendanceData(res.data.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    if (session?.user?.collegeId) {
      fetchAttendance();
    }
  }, [session, date]);

  const years = ["First Year", "Second Year"];

  const getYearStats = (year) => {
    let present = 0;
    let absent = 0;
    Object.values(attendanceData).forEach((groupData) => {
      present += groupData.Present.filter((s) => s.year === year).length;
      absent += groupData.Absent.filter((s) => s.year === year).length;
    });
    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, percent };
  };

  const getCollegeStats = () => {
    let present = 0;
    let absent = 0;
    Object.values(attendanceData).forEach((groupData) => {
      present += groupData.Present.length;
      absent += groupData.Absent.length;
    });
    const total = present + absent;
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, percent };
  };

  const collegeStats = getCollegeStats();

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Attendance Summary</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {years.map((year) => {
          const stats = getYearStats(year);
          return (
            <Card key={year} className="shadow-sm">
              <CardContent className="p-4">
                <h2 className="font-semibold text-lg mb-2">{year} Attendance</h2>
                <p>Present: {stats.present}</p>
                <p>Absent: {stats.absent}</p>
                <p className="font-medium text-blue-600">% Present: {stats.percent}%</p>
              </CardContent>
            </Card>
          );
        })}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-2">College Total</h2>
            <p>Present: {collegeStats.present}</p>
            <p>Absent: {collegeStats.absent}</p>
            <p className="font-medium text-blue-600">% Present: {collegeStats.percent}%</p>
          </CardContent>
        </Card>
      </div>

      {years.map((year) => (
        <div key={year} className="mb-10">
          <h2 className="text-lg font-bold mb-4 border-b pb-1">{year}</h2>

          {Object.entries(attendanceData).map(([group, groupData]) => {
            const presentList = groupData.Present.filter((student) => student.year === year);
            const absentList = groupData.Absent.filter((student) => student.year === year);

            if (presentList.length === 0 && absentList.length === 0) return null;

            return (
              <Card key={`${year}-${group}`} className="mb-6 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold">Group: {group}</h3>
                    <div className="text-sm text-muted-foreground">
                      Present: {presentList.length} | Absent: {absentList.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2 text-green-700">✅ Present Students</h4>
                      <table className="w-full border border-green-200 text-sm">
                        <thead className="bg-green-100">
                          <tr>
                            <th className="border px-3 py-1 text-left">#</th>
                            <th className="border px-3 py-1 text-left">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presentList.map((student, idx) => (
                            <tr key={idx} className="hover:bg-green-50">
                              <td className="border px-3 py-1">{idx + 1}</td>
                              <td className="border px-3 py-1">{student.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2 text-red-700">❌ Absent Students</h4>
                      <table className="w-full border border-red-200 text-sm">
                        <thead className="bg-red-100">
                          <tr>
                            <th className="border px-3 py-1 text-left">#</th>
                            <th className="border px-3 py-1 text-left">Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {absentList.map((student, idx) => (
                            <tr key={idx} className="hover:bg-red-50">
                              <td className="border px-3 py-1">{idx + 1}</td>
                              <td className="border px-3 py-1">{student.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ))}
    </div>
  );
}


