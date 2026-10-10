"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

export default function LecturerSummaryPage() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "/api/invigilation/duties/monthly-summary",
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load monthly summary"
        );
      }

      setSummary(data.data || []);
    } catch (err) {
      toast.error(
        err.message || "Failed to load monthly summary"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <InvigilationGuard allowRoles={["lecturer"]}>
      {(user) => (
        <InvigilationShell
          user={user}
          title="Lecturer - Monthly Duty Summary"
        >
          <section className="rounded-lg border p-4">
            <h2 className="text-lg font-semibold">
              Monthly Duty Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View your monthly invigilation duty summary.
            </p>

            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      Month
                    </th>

                    <th className="px-3 py-2 text-left">
                      Total
                    </th>

                    <th className="px-3 py-2 text-left">
                      Available
                    </th>

                    <th className="px-3 py-2 text-left">
                      Not Available
                    </th>

                    <th className="px-3 py-2 text-left">
                      Pending
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {summary.map((row) => (
                    <tr
                      key={row.month}
                      className="border-t"
                    >
                      <td className="px-3 py-2">
                        {row.month}
                      </td>

                      <td className="px-3 py-2">
                        {row.total}
                      </td>

                      <td className="px-3 py-2">
                        {row.available}
                      </td>

                      <td className="px-3 py-2">
                        {row.notAvailable}
                      </td>

                      <td className="px-3 py-2">
                        {row.pending}
                      </td>
                    </tr>
                  ))}

                  {summary.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-3 py-6 text-center text-slate-500"
                      >
                        {loading
                          ? "Loading..."
                          : "No monthly summary available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}