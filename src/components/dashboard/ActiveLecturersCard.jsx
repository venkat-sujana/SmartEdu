"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, CircleAlert, LoaderCircle, UsersRound } from "lucide-react";

export default function ActiveLecturersCard({ title = "Active Lecturers" }) {
  const { data: session } = useSession();
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.user?.collegeId) return;

    const fetchLecturers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `/api/lecturers/active?collegeId=${session.user.collegeId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch active lecturers");
        }

        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setLecturers(list);
      } catch (fetchError) {
        console.error("Active lecturers fetch error:", fetchError);
        setError(fetchError.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchLecturers();
  }, [session]);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-sky-700 via-blue-700 to-indigo-700 px-5 py-5 text-white">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              Faculty Monitor
            </p>
            <h3 className="mt-2 text-xl font-black tracking-tight">{title}</h3>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-center">
            <p className="text-[11px] uppercase tracking-wide text-white/70">Online</p>
            <p className="mt-1 text-2xl font-bold">{lecturers.length}</p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-12 text-sm font-medium text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading active lecturers...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-10 text-center">
            <CircleAlert className="mx-auto h-6 w-6 text-rose-600" />
            <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>
          </div>
        ) : lecturers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <UsersRound className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No lecturers currently logged in
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {lecturers.map((lecturer, index) => (
              <article
                key={`${lecturer._id || lecturer.email || lecturer.name}-${index}`}
                className="rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-4 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <UsersRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <h4 className="truncate text-base font-bold text-slate-900">
                          {lecturer.name}
                        </h4>
                        <p className="truncate text-sm text-slate-500">
                          {lecturer.email || "Active session"}
                        </p>
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                        Active
                      </span>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700">
                      <BookOpen className="h-4 w-4" />
                      {lecturer.subject || "Subject not available"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
