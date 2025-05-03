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

const GenderwiseChart = () => {
  const [genderStats, setGenderStats] = useState([]);

  useEffect(() => {
    const fetchGenderData = async () => {
      try {
        const res = await fetch("/api/stats/genderwise");
        const data = await res.json();
        setGenderStats(data);
      } catch (error) {
        console.error("Error fetching gender-wise stats", error);
      }
    };
    fetchGenderData();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold text-center mb-4 text-pink-600">Gender-wise Admissions</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={genderStats}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" label={{ value: "Gender", position: "insideBottom", offset: -5 }} />
          <YAxis domain={[0, 20]} ticks={[0, 5, 10, 15, 20]} />
          <Tooltip />
          <Bar
            dataKey="count"
            fill="#ec4899" // Pink tone
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenderwiseChart;
