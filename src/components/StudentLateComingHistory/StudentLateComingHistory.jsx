"use client";

import { useEffect, useState } from "react";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-IN", {
        day:   "2-digit",
        month: "short",
        year:  "numeric",
      });
}

export default function StudentLateComingHistory({ studentId }) {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    (async () => {
      try {
        const res  = await fetch(
          `/api/attendance/student-late-coming?studentId=${studentId}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (res.ok) {
          setData(json.data  || []);
          setTotal(json.total || 0);
        } else {
          setError(json.error || "Failed to fetch late coming data");
        }
      } catch {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  if (loading)
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading late coming history...</span>
      </div>
    );

  if (error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-yellow-400 bg-yellow-50 p-4 shadow-md">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-yellow-800">
          🕐 Late Coming History
        </h2>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            total === 0
              ? "bg-green-100 text-green-700"
              : total <= 3
              ? "bg-yellow-200 text-yellow-800"
              : "bg-red-100 text-red-700"
          }`}
        >
          {total === 0 ? "✅ No Late Comings" : `⚠️ ${total} Late Coming${total > 1 ? "s" : ""}`}
        </span>
      </div>

      {total === 0 ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center text-green-700">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 font-semibold">No late comings recorded. Keep it up!</p>
        </div>
      ) : (
        <>
          {/* Warning banner if too many */}
          {total > 5 && (
            <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              🚨 You have been late <strong>{total} times</strong>. Please improve punctuality.
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-yellow-200">
            <table className="w-full text-center text-sm">
              <thead className="bg-yellow-500 text-white">
                <tr>
                  <th className="border border-yellow-600 p-2">#</th>
                  <th className="border border-yellow-600 p-2">📅 Date</th>
                  <th className="border border-yellow-600 p-2">🕐 Session</th>
                  <th className="border border-yellow-600 p-2">⏰ Late By</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={`${row.date}-${row.session}-${i}`}
                    className={i % 2 === 0 ? "bg-white" : "bg-yellow-50"}
                  >
                    <td className="border p-2 text-gray-500">{i + 1}</td>
                    <td className="border p-2 font-semibold">{formatDate(row.date)}</td>
                    <td className="border p-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.session === "FN"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {row.session === "FN" ? "🌅 FN" : "🌇 AN"}
                      </span>
                    </td>
                    <td className="border p-2 font-semibold text-red-600">
                      {row.lateTime !== "—" ? `🕐 ${row.lateTime}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}