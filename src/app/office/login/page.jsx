//src/app/office/login/page.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase } from "lucide-react";

const LOGIN_HIGHLIGHTS = [
  "Secure office-only access",
  "Fast attendance and record workflows",
  "Designed for daily administrative operations",
];

export default function OfficeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/office/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("office-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (res?.error) {
      setError("Invalid office credentials");
      setLoading(false);
      return;
    }

    router.push("/office/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-linear(circle_at_top,rgba(56,189,248,0.16),transparent_28%),linear-linear(135deg,#082f49_0%,#0f172a_42%,#111827_100%)]">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-3xl border border-cyan-300/20 bg-slate-900/90 px-8 py-6 text-center shadow-2xl">
            <p className="text-lg font-semibold text-white">Signing you in...</p>
            <p className="mt-2 text-sm text-slate-300">Preparing your office workspace.</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[10%] top-16 h-48 w-48 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-10 right-[8%] h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="grid w-full overflow-hidden rounded-4xl border border-white/10 bg-white/6 shadow-[0_24px_80px_-36px_rgba(8,145,178,0.55)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          

          <section className="bg-white/92 p-7 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 shadow-sm">
                  <Briefcase className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">OSRA Portal</p>
                  <h2 className="mt-1 text-3xl font-black text-slate-950">Office Login</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Enter your office credentials to continue to the dashboard.
              </p>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Email Address</span>
                  <input
                    type="email"
                    placeholder="office@college.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Password</span>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                    required
                  />
                </label>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-600 to-sky-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-200/70 transition hover:from-cyan-500 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                >
                  {loading ? "Signing in..." : "Login to Dashboard"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Need an office account?{" "}
                <Link href="/office-registration" className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer">
                  Register here
                </Link>
              </div>
            </div>
          </section>
        </div>
      </motion.main>
    </div>
  );
}
