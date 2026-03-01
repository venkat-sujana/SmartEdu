// app/lecturer/login/page.jsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const subjectGroupMap = {
  MandAT: "mandat",
  CET: "cet",
  MLT: "mlt",
  Maths: "mpc",
  Physics: "mpc",
  Chemistry: "mpc",
  Botany: "bipc",
  Zoology: "bipc",
  Civics: "cec",
  Economics: "cec",
  History: "hec",
  Commerce: "cec",
  GFC: "gfc",
};

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.subject) {
      const group = subjectGroupMap[session.user.subject] || "mpc";
      router.push(`/dashboards/${group}`);
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("lecturer-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (res?.error) {
      setError("Invalid credentials");
    }

    setLoading(false);
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <p className="animate-pulse text-2xl font-semibold text-white">Please wait...</p>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-1 flex min-h-screen items-start justify-center bg-gray-200 bg-[url('/images/bg-6.jpg')] bg-cover bg-center"
      >
        <form onSubmit={handleSubmit} className="mt-10 w-72 rounded-lg bg-white p-6 shadow-lg">
          <h2 className="mb-4 text-center text-2xl font-bold">Lecturer Login</h2>
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 w-full rounded border px-3 py-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4 w-full rounded border px-3 py-2"
            required
          />

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>

          <p className="mt-3 text-center text-sm">
            Do not have an account?{" "}
            <a href="/lecturer-registration" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
