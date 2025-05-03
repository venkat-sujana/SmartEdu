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
  Legend,
} from "recharts";

const COLORS = ["#ffa07a", "#20b2aa", "#9370db", "#f4a460", "#4682b4"];

const CastewiseChart = () => {
  const [casteStats, setCasteStats] = useState([]);

  useEffect(() => {
    const fetchCasteData = async () => {
      try {
        const res = await fetch("/api/stats/castewise");
        const data = await res.json();
        setCasteStats(data);
      } catch (error) {
        console.error("Error fetching caste-wise stats", error);
      }
    };

    fetchCasteData();
  }, []);

  return (
    <div className="p-4 shadow rounded-xl bg-white">
      <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">Caste-wise Admissions</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={casteStats}
          margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="_id" />
          <YAxis ticks={[0, 5, 10, 15, 20]} domain={[0, 20]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#20b2aa" barSize={40}>
            {casteStats.map((entry, index) => (
              <cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CastewiseChart;
