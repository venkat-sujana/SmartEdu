//app/principal/dashboard/MetricsCards.jsx
"use client";
import { useEffect, useState } from "react";

import {
  Calendar,
  Users,
  FileText,
  Edit,
  BarChart,
  ClipboardList,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Home,
  CheckCircle, XCircle, BarChart2, Percent
} from 'lucide-react'
import { UsersIcon } from "@heroicons/react/24/solid";

export default function MetricsCards({ onPromoteClick }) {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    terminated: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Stats load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

      {/* Total Students */}
      <div className="bg-white p-5 rounded-xl flex shadow-xl border border-gray-100">
        <h3 className="text-gray-500 text-sm"><Users className="mr-2" color="blue" />Total Students</h3>
        <p className="text-3xl font-bold text-blue-600">
          {loading ? "…" : stats.total}
        </p>
      </div>

      {/* Active Students */}
      <div className="bg-white p-5 flex  rounded-xl shadow-xl border border-gray-100">
        <h3 className="text-gray-500 text-sm"><Users className="mr-2" color="green" />Active Students</h3>
        <p className="text-3xl font-bold text-green-600">
          {loading ? "…" : stats.active}
        </p>
      </div>

      {/* Terminated Students */}
      <div className="bg-white p-5 rounded-xl shadow-xl border  border-gray-100   justify-between">
        
          <h3 className="text-gray-500 text-sm"><Users className="mr-2" color="red" />Terminated Students</h3>
          <p className="text-3xl font-bold text-red-600">
            {loading ? "…" : stats.terminated}
          </p>
        </div>
      <div className="bg-white p-5 rounded-xl shadow-xl border border-gray-100 flex flex-col items-center">
     

        {/* Button inside Card */}
        <button
          onClick={onPromoteClick}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          Run Safe Test  Promotion
        </button>
      </div>

    </div>
  );
}
