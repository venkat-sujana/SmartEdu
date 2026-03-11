//app/principal/dashboard/attendance-overview/page.jsx
"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AttendanceOverview({ collegeId }) {
  const { data, error } = useSWR(`/api/attendance/monthly-summary?collegeId=${collegeId}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;

  const students = data.data || [];

  // 1️⃣ College Average Attendance
  let totalPerc = 0;
  let count = 0;
  students.forEach((s) => {
    Object.values(s.percentage).forEach((p) => {
      totalPerc += parseFloat(p);
      count++;
    });
  });
  const collegeAvg = count > 0 ? (totalPerc / count).toFixed(2) : "0";

  // 2️⃣ Group-wise Attendance
  const groupData = {};
  students.forEach((s) => {
    const grp = s.yearOfStudy || "Unknown";
    if (!groupData[grp]) groupData[grp] = [];
    Object.values(s.percentage).forEach((p) => groupData[grp].push(parseFloat(p)));
  });

  const groupChartData = Object.keys(groupData).map((grp) => ({
    name: grp,
    avg: (groupData[grp].reduce((a, b) => a + b, 0) / groupData[grp].length).toFixed(2),
  }));

  // 3️⃣ RED ALERT Students
  const redAlerts = students.filter((s) =>
    Object.values(s.alerts).some((a) => a === "RED ALERT")
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto my-6">
      {/* College Average */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>College Average Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{collegeAvg}%</p>
        </CardContent>
      </Card>

      {/* Group-wise Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Group-wise / Year-wise Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={groupChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avg" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* RED ALERT Students */}
<Card>
  <CardHeader>
    <CardTitle>RED ALERT Students (Group-wise)</CardTitle>
  </CardHeader>
  <CardContent>
    {redAlerts.length === 0 ? (
      <p className="text-green-600">No Red Alerts 🎉</p>
    ) : (
      Object.entries(
        redAlerts.reduce((acc, s) => {
          const grp = s.yearOfStudy || "Unknown";
          if (!acc[grp]) acc[grp] = [];
          acc[grp].push(s);
          return acc;
        }, {})
      ).map(([grp, students]) => (
        <div key={grp} className="mb-4">
          <h3 className="font-semibold text-lg mb-2">{grp}</h3>
          <ul className="list-disc pl-5">
            {students.map((s, i) => (
              <li key={i} className="text-red-600">
                {s.name}
              </li>
            ))}
          </ul>
        </div>
      ))
    )}
  </CardContent>
</Card>
</div>
  );
}
