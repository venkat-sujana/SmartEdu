"use client";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const GroupwiseChart = () => {
  const [groupStats, setGroupStats] = useState([]);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const res = await fetch("/api/stats/groupwise");
        const data = await res.json();
        setGroupStats(data);
      } catch (error) {
        console.error("Error fetching group-wise stats", error);
      }
    };
    fetchGroupData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold text-center mb-4 text-blue-600">Group-wise Admissions</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={groupStats}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" label={{ value: "Group", position: "insideBottom", offset: -5 }} />
          <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GroupwiseChart;
