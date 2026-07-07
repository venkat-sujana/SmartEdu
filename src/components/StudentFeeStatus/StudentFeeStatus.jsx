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

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_CONFIG = {
  Paid:    { bg: "bg-green-50",  border: "border-green-400", badge: "bg-green-100 text-green-700",  icon: "✅", label: "Paid"         },
  Partial: { bg: "bg-yellow-50", border: "border-yellow-400",badge: "bg-yellow-100 text-yellow-700",icon: "⚠️", label: "Partial Paid" },
  Pending: { bg: "bg-red-50",    border: "border-red-400",   badge: "bg-red-100 text-red-700",      icon: "🔴", label: "Pending"      },
};

export default function StudentFeeStatus({ studentId }) {
  const [feeData, setFeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }

    (async () => {
      try {
        const res  = await fetch(
          `/api/fee/student/${studentId}`,
          { cache: "no-store" }
        );
        const json = await res.json();
        if (res.ok) setFeeData(json.data || []);
        else setError(json.error || "Failed to fetch fee details");
      } catch {
        setError("Server error while fetching fee details");
      } finally {
        setLoading(false);
      }
    })();
  }, [studentId]);

  // ── States ───────────────────────────────────────────────
  if (loading)
    return (
      <div className="flex items-center gap-3 py-6">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        <span className="text-sm text-gray-500">Loading fee details...</span>
      </div>
    );

  if (error)
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-600">
        ⚠️ {error}
      </div>
    );

  if (feeData.length === 0)
    return (
      <div className="rounded border border-yellow-300 bg-yellow-50 p-4 text-center text-yellow-700">
        📭 No fee records found.
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h2 className="flex items-center justify-center gap-2 text-xl font-bold text-green-800">
        💰 Fee Payment Status
      </h2>

      {feeData.map((record) => {
        const config     = STATUS_CONFIG[record.status] || STATUS_CONFIG.Pending;
        const paidPct    = record.totalFee > 0
          ? Math.min((record.totalPaid / record.totalFee) * 100, 100).toFixed(1)
          : "0.0";

        return (
          <div
            key={record._id}
            className={`rounded-2xl border-2 ${config.border} ${config.bg} p-5 shadow-md`}
          >
            {/* ── Header ── */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-800">
                🗓️ Academic Year: {record.academicYear}
              </h3>
              <span className={`rounded-full px-3 py-1 text-sm font-bold ${config.badge}`}>
                {config.icon} {config.label}
              </span>
            </div>

            {/* ── Fee Summary Cards ── */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-blue-200 bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Total Fee</p>
                <p className="text-xl font-extrabold text-blue-700">
                  {formatCurrency(record.totalFee)}
                </p>
              </div>
              <div className="rounded-xl border border-green-200 bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Amount Paid</p>
                <p className="text-xl font-extrabold text-green-600">
                  {formatCurrency(record.totalPaid)}
                </p>
              </div>
              <div className="rounded-xl border border-red-200 bg-white p-3 text-center shadow-sm">
                <p className="text-xs text-gray-500">Balance Due</p>
                <p className={`text-xl font-extrabold ${record.balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  {record.balance > 0 ? formatCurrency(record.balance) : "✅ Nil"}
                </p>
              </div>
            </div>

            {/* ── Progress Bar ── */}
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-xs text-gray-500">
                <span>Paid: {paidPct}%</span>
                <span>Remaining: {(100 - parseFloat(paidPct)).toFixed(1)}%</span>
              </div>
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    record.status === "Paid"
                      ? "bg-green-500"
                      : record.status === "Partial"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  style={{ width: `${paidPct}%` }}
                />
              </div>
            </div>

            {/* ── Payment History ── */}
            {record.payments.length > 0 ? (
              <div>
                <h4 className="mb-2 font-semibold text-gray-700">
                  📋 Payment History ({record.payments.length} payment{record.payments.length > 1 ? "s" : ""})
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-green-600 text-white">
                      <tr>
                        <th className="border border-green-700 p-2">#</th>
                        <th className="border border-green-700 p-2">📅 Date</th>
                        <th className="border border-green-700 p-2">💵 Amount</th>
                        <th className="border border-green-700 p-2">📝 Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.payments.map((p, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="border p-2 text-gray-500">{i + 1}</td>
                          <td className="border p-2 font-semibold">
                            {formatDate(p.paidDate)}
                          </td>
                          <td className="border p-2 font-bold text-green-700">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="border p-2 text-gray-500 text-xs">
                            {p.note || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Total row */}
                    <tfoot>
                      <tr className="bg-green-50 font-bold">
                        <td className="border p-2" colSpan={2}>Total Paid</td>
                        <td className="border p-2 text-green-700">
                          {formatCurrency(record.totalPaid)}
                        </td>
                        <td className="border p-2" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-600">
                🔴 No payments recorded yet. Please pay your fee at the college office.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}