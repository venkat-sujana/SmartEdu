"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("admin-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      callbackUrl: "/admin-panel",
    });

    if (res?.error) {
      setError("Invalid admin credentials");
      setLoading(false);
      return;
    }

    router.push("/admin-panel");
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-4 py-12">
      <form
        className="mt-8 w-full max-w-md space-y-5 rounded-3xl border border-cyan-400/20 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/30"
        onSubmit={handleLogin}
      >
        <div className="flex flex-col items-center space-y-3 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-300/30">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-2xl font-black text-white">Admin Login</h2>
            <p className="mt-1 text-sm text-slate-300">Full platform access for students, lecturers, principals, and colleges.</p>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">{error}</div>}

        <input
          type="email"
          placeholder="Admin email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Login as Admin"}
        </button>

        <div className="text-center text-sm text-slate-300">
          Need to create the first admin?{" "}
          <Link href="/admin/setup" className="font-semibold text-cyan-300 hover:underline">
            Open setup
          </Link>
        </div>
      </form>
    </div>
  );
}
