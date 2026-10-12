"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ClipboardList,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

function formatMonth(month) {
  if (!month) return "";
  const [year, monthNum] = month.split("-");
  const date = new Date(year, monthNum - 1);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function StatCard({ icon, label, value, color }) {
  const palette = {
    primary: { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", val: "text-indigo-700" },
    success: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", val: "text-emerald-700" },
    warning: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", val: "text-amber-700" },
    danger: { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", val: "text-rose-700" },
    neutral: { bg: "bg-slate-50", icon: "bg-slate-100 text-slate-600", val: "text-slate-700" },
  };
  const p = palette[color] || palette.primary;
  return (
    <div className={`rounded-2xl border border-slate-100 p-5 ${p.bg}`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${p.icon}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-black ${p.val}`}>{value}</p>
    </div>
  );
}

function Chip({ children, color = "slate" }) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    violet: "bg-violet-100 text-violet-700",
    indigo: "bg-indigo-100 text-indigo-700",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${map[color]}`}>
      {children}
    </span>
  );
}

function StatusChip({ value, label }) {
  if (!value || value === 0) return <Chip color="slate">0</Chip>;
  if (label === "Available") return <Chip color="emerald"><CheckCircle2 size={10} /> {value}</Chip>;
  if (label === "Not Available") return <Chip color="rose"><XCircle size={10} /> {value}</Chip>;
  if (label === "Pending") return <Chip color="amber"><AlertCircle size={10} /> {value}</Chip>;
  return <Chip color="indigo">{value}</Chip>;
}

function Btn({ children, onClick, disabled, variant = "primary", size = "md", className = "", type = "button" }) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
    ghost: "bg-slate-100 hover:bg-slate-200 text-slate-700",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-sm" };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function LecturerSummaryPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invigilation/duties/monthly-summary", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load monthly summary");
      setSummary(data.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load monthly summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const totalDuties = summary.reduce((acc, row) => acc + (row.total || 0), 0);
  const totalAvailable = summary.reduce((acc, row) => acc + (row.available || 0), 0);
  const totalNotAvailable = summary.reduce((acc, row) => acc + (row.notAvailable || 0), 0);
  const totalPending = summary.reduce((acc, row) => acc + (row.pending || 0), 0);

  return (
    <InvigilationGuard allowRoles={["lecturer"]}>
      {(user) => (
        <InvigilationShell user={user} title="Lecturer · Monthly Duty Summary">
          <div className="min-h-screen bg-slate-50">
            {/* ── Page Header ── */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600">
                    <BarChart3 size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg leading-none font-black text-slate-800">Monthly Duty Summary</h1>
                    <p className="mt-1 text-xs text-slate-400">Month-wise breakdown of your invigilation duties</p>
                  </div>
                </div>
                <Btn variant="outline" onClick={fetchSummary} disabled={loading} className="w-full justify-center sm:w-auto">
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Refresh
                </Btn>
              </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6">
              {/* ── Summary Stats ── */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard label="Total Duties" value={totalDuties} icon={<ClipboardList size={16} />} color="primary" />
                <StatCard label="Available" value={totalAvailable} icon={<CheckCircle2 size={16} />} color="success" />
                <StatCard label="Not Available" value={totalNotAvailable} icon={<XCircle size={16} />} color="danger" />
                <StatCard label="Pending" value={totalPending} icon={<AlertCircle size={16} />} color="warning" />
              </div>

              {/* ── Monthly Breakdown Table ── */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h3 className="text-sm font-bold text-slate-800">Month-wise Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm" role="table">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/80">
                        {["Month", "Total", "Available", "Not Available", "Pending"].map((h) => (
                          <th key={h} className="px-5 py-3 text-left text-xs font-bold tracking-wide whitespace-nowrap text-slate-400 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {summary.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                              <ClipboardList size={32} className="opacity-30" />
                              <p className="text-sm font-medium">{loading ? "Loading summary…" : "No monthly summary available"}</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        summary.map((row, i) => (
                          <tr key={row.month} className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                            <td className="px-5 py-3 font-bold text-slate-800 whitespace-nowrap">{formatMonth(row.month)}</td>
                            <td className="px-5 py-3"><Chip color="indigo">{row.total}</Chip></td>
                            <td className="px-5 py-3"><StatusChip value={row.available} label="Available" /></td>
                            <td className="px-5 py-3"><StatusChip value={row.notAvailable} label="Not Available" /></td>
                            <td className="px-5 py-3"><StatusChip value={row.pending} label="Pending" /></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}