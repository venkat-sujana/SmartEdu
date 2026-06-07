"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function InvigilationLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        const role = data?.user?.role;

        if (role === "admin") {
          router.replace("/invigilation/admin/dashboard");
          return;
        }

        if (role === "lecturer") {
          router.replace("/invigilation/lecturer/dashboard");
          return;
        }
      } finally {
        setCheckingSession(false);
      }
    };

    checkLoggedInUser();
  }, [router]);

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
      if (data.user.role === "admin") router.replace("/invigilation/admin/dashboard");
      else router.replace("/invigilation/lecturer/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-blue-100 p-4">
        <div className="rounded-xl border bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-lg">
          Checking session...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-blue-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-lg">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Invigilation Login</h1>
        <p className="mb-4 text-sm text-slate-600">Admin / Lecturer access</p>

        <label className="mb-2 block text-sm font-medium">Designation / Login ID</label>
        <input
          type="text"
          required
          className="mb-4 w-full rounded-lg border px-3 py-2"
          value={form.identifier}
          onChange={(e) => setForm((s) => ({ ...s, identifier: e.target.value }))}
        />

        <label className="mb-2 block text-sm font-medium">Password</label>
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
          className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-3 text-center text-sm text-slate-600">
          First time setup?{" "}
          <Link href="/invigilation/setup" className="font-medium text-indigo-700 hover:underline">
            Create admin
          </Link>
        </p>
      </form>
    </div>
  );
}
