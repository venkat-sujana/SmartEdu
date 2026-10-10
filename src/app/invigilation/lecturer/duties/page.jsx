"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

function formatDate(date) {
  if (!date) return "";

  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return date;
  }

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function LecturerDutiesPage() {
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDuties = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "/api/invigilation/duties",
        { cache: "no-store" }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load duties"
        );
      }

      setDuties(data.data || []);
    } catch (err) {
      toast.error(
        err.message || "Failed to load duties"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, []);

  const markAvailability = async (
    dutyId,
    availability
  ) => {
    try {
      const res = await fetch(
        `/api/invigilation/duties/${dutyId}/availability`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            availability,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Update failed"
        );
      }

      toast.success(
        "Availability updated"
      );

      fetchDuties();
    } catch (err) {
      toast.error(
        err.message || "Update failed"
      );
    }
  };

  return (
    <InvigilationGuard allowRoles={["lecturer"]}>
      {(user) => (
        <InvigilationShell
          user={user}
          title="Lecturer - Assigned Duties"
        >
          <div className="space-y-5">
            <section className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">
                Assigned Duties
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View your assigned invigilation duties
                and update availability.
              </p>

              <div className="mt-4 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left">
                        Date
                      </th>

                      <th className="px-3 py-2 text-left">
                        Session
                      </th>

                      <th className="px-3 py-2 text-left">
                        Subject
                      </th>

                      <th className="px-3 py-2 text-left">
                        Hall
                      </th>

                      <th className="px-3 py-2 text-left">
                        Availability
                      </th>

                      <th className="px-3 py-2 text-left">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {duties.map((duty) => (
                      <tr
                        key={duty._id}
                        className="border-t"
                      >
                        <td className="px-3 py-2">
                          {duty.examScheduleId?.date
                            ? formatDate(
                                duty.examScheduleId.date
                              )
                            : "-"}
                        </td>

                        <td className="px-3 py-2">
                          {duty.examScheduleId?.session ||
                            "-"}
                        </td>

                        <td className="px-3 py-2">
                          {duty.examScheduleId?.subject ||
                            "-"}
                        </td>

                        <td className="px-3 py-2">
                          {duty.examScheduleId?.hallNo ||
                            "-"}
                        </td>

                        <td className="px-3 py-2">
                          {duty.availability || "-"}
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                markAvailability(
                                  duty._id,
                                  "Available"
                                )
                              }
                              className="rounded bg-emerald-600 px-2 py-1 text-xs text-white"
                            >
                              Available
                            </button>

                            <button
                              onClick={() =>
                                markAvailability(
                                  duty._id,
                                  "Not Available"
                                )
                              }
                              className="rounded bg-rose-600 px-2 py-1 text-xs text-white"
                            >
                              Not Available
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {duties.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center text-slate-500"
                        >
                          {loading
                            ? "Loading..."
                            : "No duties assigned yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  );
}