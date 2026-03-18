"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldPlus } from "lucide-react";

export default function AdminSetupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", setupKey: "" });
  const [hasAdmins, setHasAdmins] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch("/api/auth/register-admin");
        const data = await res.json();
        setHasAdmins(Boolean(data.hasAdmins));
      } catch (err) {
        setError("Failed to load admin setup status");
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/register-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create admin");
      }
      setMessage("Admin account created successfully. You can login now.");
      setForm({ name: "", email: "", password: "", setupKey: "" });
      setHasAdmins(true);
    } catch (err) {
      setError(err.message || "Failed to create admin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-5 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-8 text-white shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-300/30">
            <ShieldPlus className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-3xl font-black">Admin Setup</h1>
          <p className="mt-2 text-sm text-slate-300">
            {loading
              ? "Checking setup status..."
              : hasAdmins
                ? "An admin already exists. Provide the setup key to create another admin."
                : "No admin found. Create the first platform admin account."}
          </p>
        </div>

        {message && <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}
        {error && <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <input name="name" value={form.name} onChange={handleChange} placeholder="Admin name" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Admin email" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none" required />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none" required />

        {hasAdmins && (
          <input
            name="setupKey"
            type="password"
            value={form.setupKey}
            onChange={handleChange}
            placeholder="Admin setup key"
            className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none"
            required
          />
        )}

        <button type="submit" disabled={submitting || loading} className="w-full rounded-2xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-70">
          {submitting ? "Creating admin..." : "Create Admin Account"}
        </button>

        <div className="text-center text-sm text-slate-300">
          <Link href="/admin/login" className="font-semibold text-cyan-300 hover:underline">
            Back to admin login
          </Link>
        </div>
      </form>
    </div>
  );
}
