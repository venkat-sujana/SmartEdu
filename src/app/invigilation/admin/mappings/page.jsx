"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import InvigilationGuard from "@/app/invigilation/components/InvigilationGuard";
import InvigilationShell from "@/app/invigilation/components/InvigilationShell";

const asId = (value) => String(value?._id || value?.id || value || "");

export default function LecturerMappingsPage() {
  const [data, setData] = useState({ lecturers: [], invigilationUsers: [], mappings: [] });
  const [lecturerId, setLecturerId] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMappings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/lecturer-user-mappings", {
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to load lecturer accounts");
      setData(result.data || { lecturers: [], invigilationUsers: [], mappings: [] });
    } catch (error) {
      toast.error(error.message || "Failed to load lecturer accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const mappedLecturerIds = useMemo(
    () => new Set((data.mappings || []).map((mapping) => asId(mapping.lecturerId))),
    [data.mappings]
  );
  const mappedUserIds = useMemo(
    () => new Set((data.mappings || []).map((mapping) => asId(mapping.userId))),
    [data.mappings]
  );
  const lecturersById = useMemo(
    () => new Map((data.lecturers || []).map((lecturer) => [asId(lecturer), lecturer])),
    [data.lecturers]
  );
  const usersById = useMemo(
    () => new Map((data.invigilationUsers || []).map((user) => [asId(user), user])),
    [data.invigilationUsers]
  );

  const submitMapping = async (event) => {
    event.preventDefault();
    if (!lecturerId || !userId) {
      toast.error("Select both lecturer accounts");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/lecturer-user-mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lecturerId, userId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to save mapping");
      toast.success("Lecturer account mapping saved");
      setLecturerId("");
      setUserId("");
      loadMappings();
    } catch (error) {
      toast.error(error.message || "Failed to save mapping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <InvigilationGuard allowRoles={["admin"]}>
      {(user) => (
        <InvigilationShell user={user} title="Lecturer Account Mapping">
          <div className="space-y-5">
            <section className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Link lecturer accounts</h2>
              <p className="mt-1 text-sm text-slate-500">
                Link each OSRA lecturer login to the invigilation lecturer selected while assigning duties.
              </p>

              <form onSubmit={submitMapping} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <select
                  required
                  value={lecturerId}
                  onChange={(event) => setLecturerId(event.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="">Select OSRA lecturer</option>
                  {(data.lecturers || [])
                    .filter((lecturer) => !mappedLecturerIds.has(asId(lecturer)))
                    .map((lecturer) => (
                      <option key={asId(lecturer)} value={asId(lecturer)}>
                        {lecturer.name} {lecturer.email ? `(${lecturer.email})` : ""}
                      </option>
                    ))}
                </select>

                <select
                  required
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                  className="rounded border px-3 py-2 text-sm"
                >
                  <option value="">Select invigilation lecturer</option>
                  {(data.invigilationUsers || [])
                    .filter((invigilationUser) => !mappedUserIds.has(asId(invigilationUser)))
                    .map((invigilationUser) => (
                      <option key={asId(invigilationUser)} value={asId(invigilationUser)}>
                        {invigilationUser.name} {invigilationUser.email ? `(${invigilationUser.email})` : ""}
                      </option>
                    ))}
                </select>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save mapping"}
                </button>
              </form>
            </section>

            <section className="rounded-lg border p-4">
              <h2 className="text-lg font-semibold">Saved mappings</h2>
              <div className="mt-3 overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left">OSRA lecturer login</th>
                      <th className="px-3 py-2 text-left">Invigilation duty account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.mappings || []).map((mapping) => {
                      const lecturer = lecturersById.get(asId(mapping.lecturerId));
                      const invigilationUser = usersById.get(asId(mapping.userId));
                      return (
                        <tr key={asId(mapping._id)} className="border-t">
                          <td className="px-3 py-2">
                            {lecturer?.name || asId(mapping.lecturerId)}
                            {lecturer?.email ? ` (${lecturer.email})` : ""}
                          </td>
                          <td className="px-3 py-2">
                            {invigilationUser?.name || asId(mapping.userId)}
                            {invigilationUser?.email ? ` (${invigilationUser.email})` : ""}
                          </td>
                        </tr>
                      );
                    })}
                    {!loading && (data.mappings || []).length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-5 text-center text-slate-500">
                          No lecturer accounts mapped yet.
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
