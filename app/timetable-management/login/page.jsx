"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function TimetableLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      toast.success("Login successful");
      if (data.user.role === "admin") router.replace("/timetable-management/admin/dashboard");
      else router.replace("/timetable-management/lecturer/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-indigo-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-lg">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Time Table Login</h1>
        <p className="mb-4 text-sm text-slate-600">Admin / Lecturer access</p>

        <label className="mb-1 block text-sm font-medium">Email / Designation</label>
        <input
          required
          className="mb-3 w-full rounded-lg border px-3 py-2"
          value={form.identifier}
          onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))}
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          className="mb-5 w-full rounded-lg border px-3 py-2"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

