//src/app/student/login/page.jsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookMarked, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";

const LOGIN_HIGHLIGHTS = [
  "Quick access to your student dashboard",
  "Track attendance and academic progress",
  "Simple, secure sign-in experience",
];

export default function StudentLoginPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("student-login", {
      redirect: false,
      admissionNo: admissionNo.trim(),
      password,
      callbackUrl: "/student/dashboard",
    });

    setLoading(false);

    if (!res) {
      setError("Something went wrong, please try again.");
      return;
    }

    if (res.error) {
      setError("Invalid student credentials");
      return;
    }

    router.push("/student/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(132,204,22,0.16),_transparent_28%),linear-gradient(135deg,_#14532d_0%,_#0f172a_46%,_#111827_100%)]">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="rounded-3xl border border-lime-300/20 bg-slate-900/90 px-8 py-6 text-center shadow-2xl">
            <p className="text-lg font-semibold text-white">Signing you in...</p>
            <p className="mt-2 text-sm text-slate-300">Opening your student dashboard.</p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[9%] top-20 h-52 w-52 rounded-full bg-lime-400/12 blur-3xl" />
        <div className="absolute bottom-8 right-[8%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/10 bg-white/6 shadow-[0_24px_80px_-36px_rgba(132,204,22,0.38)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative flex flex-col justify-between border-b border-white/10 p-7 text-white sm:p-10 lg:border-b-0 lg:border-r">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-lime-200">
                <Sparkles className="h-3.5 w-3.5" />
                Student Access
              </div>

              <h1 className="mt-6 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                Step into your learning dashboard with confidence.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                Sign in to view your attendance, keep up with academic progress, and stay connected to the most important updates from your college.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {LOGIN_HIGHLIGHTS.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-lg shadow-slate-950/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-lime-400/10 p-2 text-lime-200">
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-medium text-slate-100">{item}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/30 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-lime-400/10 p-3 text-lime-200">
                  <BookMarked className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Built for students</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Check attendance details, monitor your academic journey, and stay prepared with a calmer, cleaner student experience.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white/92 p-7 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-100 text-lime-700 shadow-sm">
                  <GraduationCap className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">OSRA Portal</p>
                  <h2 className="mt-1 text-3xl font-black text-slate-950">Student Login</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Use your admission number and password to continue to your student dashboard.
              </p>

              {error && (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Admission Number</span>
                  <input
                    type="text"
                    placeholder="Enter your admission number"
                    value={admissionNo}
                    onChange={(event) => setAdmissionNo(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-lime-400 focus:bg-white"
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
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-lime-400 focus:bg-white"
                    required
                  />
                </label>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-lime-600 to-emerald-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-lime-200/70 transition hover:from-lime-500 hover:to-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Login to Dashboard"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </motion.button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Need access to your student account?{" "}
                <Link href="/student-activate" className="font-semibold text-lime-700 hover:text-lime-800 hover:underline">
                  Activate here
                </Link>
              </div>
            </div>
          </section>
        </div>
      </motion.main>
    </div>
  );
}
