// app/principal/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { School } from "lucide-react";

export default function PrincipalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("principal-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      callbackUrl: "/principal/dashboard",
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/principal/dashboard");
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex space-x-3">
            <div className="h-4 w-4 animate-pulse rounded-full bg-white" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-white delay-150" />
            <div className="h-4 w-4 animate-pulse rounded-full bg-white delay-300" />
          </div>
          <p className="mt-4 animate-pulse text-lg text-white">Loading...</p>
        </div>
      )}

      <div className="mt-12 flex min-h-screen items-start justify-center bg-gradient-to-br from-slate-50 to-blue-100 bg-[url('/images/college.jpg')] bg-cover bg-center">
        <form
          className="mt-8 w-64 max-w-md space-y-6 rounded-2xl bg-white p-4 shadow-xl"
          onSubmit={handleLogin}
        >
          <div className="mb-2 flex flex-col items-center space-y-2">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
              <School className="h-8 w-8" />
            </span>
            <h2 className="text-2xl font-extrabold text-gray-800">Principal Login</h2>
          </div>

          {error && <div className="rounded bg-red-50 p-2 text-center text-red-600">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            required
          />

          <button className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-bold text-white hover:bg-blue-700">
            Login
          </button>

          <p className="pt-2 text-center text-sm text-gray-600">
            Do not have an account?{" "}
            <a href="/principal-registration" className="text-blue-600 hover:underline">
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
