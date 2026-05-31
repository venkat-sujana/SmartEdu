//src/app/invigilation/lecturer/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

function formatDate(date) {
  if (!date) return "";
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function LecturerInvigilationDashboardPage() {

const [availabilityDate,
  setAvailabilityDate] =
  useState("")

const [availabilitySession,
  setAvailabilitySession] =
  useState("FN")

const [availabilityReason,
  setAvailabilityReason] =
  useState("")

  const [duties, setDuties] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, sRes] = await Promise.all([
        fetch("/api/invigilation/duties", { cache: "no-store" }),
        fetch("/api/invigilation/duties/monthly-summary", { cache: "no-store" }),
      ]);
      const [dData, sData] = await Promise.all([dRes.json(), sRes.json()]);
      if (!dRes.ok || !sRes.ok) {
        throw new Error(dData.message || sData.message || "Failed to load");
      }
      setDuties(dData.data || []);
      setSummary(sData.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const markAvailability = async (dutyId, availability) => {
    try {
      const res = await fetch(`/api/invigilation/duties/${dutyId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      toast.success("Availability updated");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Update failed");
    }
  };


  const saveAvailability =
  async () => {

    try {

      if (!availabilityDate) {
        toast.error(
          "Select date"
        )
        return
      }

      const res =
        await fetch(
          "/api/invigilation/availability",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              date:
                availabilityDate,

              session:
                availabilitySession,

              status:
                "NOT_AVAILABLE",

              reason:
                availabilityReason,
            }),
          }
        )

      const data =
        await res.json()

      if (!res.ok) {
        throw new Error(
          data.message ||
          "Failed"
        )
      }

      toast.success(
        "Availability saved"
      )

      setAvailabilityDate("")
      setAvailabilitySession(
        "FN"
      )
      setAvailabilityReason("")

    } catch (err) {

      toast.error(
        err.message ||
        "Failed"
      )
    }
  }

  return (
    <InvigilationGuard allowRoles={["lecturer"]}>
      {(user) => (
        <InvigilationShell user={user} title="Lecturer - Invigilation Duties">
          <div className="space-y-5">
          <section className="rounded-lg border p-4">

  <h3 className="mb-4 text-sm font-semibold">
    Manage Availability
  </h3>

  <div className="grid gap-3 md:grid-cols-4">

    <div>
      <label className="mb-1 block text-xs font-medium">
        Date
      </label>

      <input
        type="date"
        value={availabilityDate}
        onChange={(e) =>
          setAvailabilityDate(
            e.target.value
          )
        }
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>


    <div>
      <label className="mb-1 block text-xs font-medium">
        Session
      </label>

      <select
        value={availabilitySession}
        onChange={(e) =>
          setAvailabilitySession(
            e.target.value
          )
        }
        className="w-full rounded border px-3 py-2 text-sm"
      >
        <option value="FN">
          FN
        </option>

        <option value="AN">
          AN
        </option>

        <option value="EN">
          EN
        </option>

        <option value="FULLDAY">
          FULLDAY
        </option>
      </select>
    </div>


    <div>
      <label className="mb-1 block text-xs font-medium">
        Reason
      </label>

      <input
        type="text"
        placeholder="Optional"

        value={availabilityReason}

        onChange={(e) =>
          setAvailabilityReason(
            e.target.value
          )
        }

        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>


    <div className="flex items-end">

      <button
        onClick={saveAvailability}

        className="w-full rounded bg-rose-600 px-3 py-2 text-sm text-white"
      >
        Mark Not Available
      </button>

    </div>
  </div>
</section>
            <section className="rounded-lg border p-3">
              <h3 className="mb-3 text-sm font-semibold">Assigned Duties</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-left">Session</th>
                      <th className="px-2 py-2 text-left">Subject</th>
                      <th className="px-2 py-2 text-left">Hall</th>
                      <th className="px-2 py-2 text-left">Availability</th>
                      <th className="px-2 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duties.map((d) => (
                      <tr key={d._id} className="border-t">
                        <td className="px-2 py-2">{d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.session || "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.subject || "-"}</td>
                        <td className="px-2 py-2">{d.examScheduleId?.hallNo || "-"}</td>
                        <td className="px-2 py-2">{d.availability}</td>
                        <td className="px-2 py-2 space-x-2">
                          <button onClick={() => markAvailability(d._id, "Available")} className="rounded bg-emerald-600 px-2 py-1 text-xs text-white">Available</button>
                          <button onClick={() => markAvailability(d._id, "Not Available")} className="rounded bg-rose-600 px-2 py-1 text-xs text-white">Not Available</button>
                        </td>
                      </tr>
                    ))}
                    {duties.length === 0 && (
                      <tr><td colSpan={6} className="px-2 py-4 text-center text-slate-500">{loading ? "Loading..." : "No duties assigned yet"}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border p-3">
              <h3 className="mb-3 text-sm font-semibold">Monthly Duty Summary</h3>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Month</th>
                      <th className="px-2 py-2 text-left">Total</th>
                      <th className="px-2 py-2 text-left">Available</th>
                      <th className="px-2 py-2 text-left">Not Available</th>
                      <th className="px-2 py-2 text-left">Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map((row) => (
                      <tr key={row.month} className="border-t">
                        <td className="px-2 py-2">{row.month}</td>
                        <td className="px-2 py-2">{row.total}</td>
                        <td className="px-2 py-2">{row.available}</td>
                        <td className="px-2 py-2">{row.notAvailable}</td>
                        <td className="px-2 py-2">{row.pending}</td>
                      </tr>
                    ))}
                    {summary.length === 0 && (
                      <tr><td colSpan={5} className="px-2 py-4 text-center text-slate-500">{loading ? "Loading..." : "No monthly summary available"}</td></tr>
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
