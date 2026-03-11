"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function InvigilationSetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    setupKey: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create admin");
      toast.success("Admin account created. Please login.");
      router.replace("/invigilation/login");
    } catch (err) {
      toast.error(err.message || "Setup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 to-indigo-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow-lg">
        <h1 className="mb-1 text-xl font-bold text-slate-900">Invigilation Admin Setup</h1>
        <p className="mb-4 text-sm text-slate-600">
          Create first admin. If admin exists, provide `ADMIN_SETUP_KEY`.
        </p>

        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          required
          className="mb-3 w-full rounded-lg border px-3 py-2"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
        />

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          required
          className="mb-3 w-full rounded-lg border px-3 py-2"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
        />

        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          required
          className="mb-3 w-full rounded-lg border px-3 py-2"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
        />

        <label className="mb-1 block text-sm font-medium">Setup Key (optional)</label>
        <input
          type="password"
          className="mb-5 w-full rounded-lg border px-3 py-2"
          value={form.setupKey}
          onChange={(e) => setForm((s) => ({ ...s, setupKey: e.target.value }))}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}

