"use client";

import { useEffect, useState } from "react";
import { MessageSquareText } from "lucide-react";

export default function AttendanceSmsHistoryCard({
  title = "Attendance SMS History",
  endpoint,
  emptyMessage = "No SMS activity found yet.",
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load SMS logs");
        if (active) {
          setLogs(Array.isArray(data.data) ? data.data : []);
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setLogs([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLogs();
    return () => {
      active = false;
    };
  }, [endpoint]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
          <MessageSquareText className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">Recent low-attendance SMS activity</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading SMS history...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-slate-900">
                  {log.studentId?.name || log.recipientName || "Recipient"}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    log.status === "sent"
                      ? "bg-emerald-100 text-emerald-700"
                      : log.status === "failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {log.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                <div>Mobile: {log.mobile || "-"}</div>
                <div>
                  Group: {log.group || "-"} | Year: {log.yearOfStudy || "-"} | Attendance: {log.percentage ?? "-"}%
                </div>
                <div>
                  Sent by: {log.triggeredByName || "System"} ({log.triggeredByRole || "system"})
                </div>
                <div>{new Date(log.createdAt).toLocaleString("en-IN")}</div>
                {log.error ? <div className="text-rose-600">Reason: {log.error}</div> : null}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
