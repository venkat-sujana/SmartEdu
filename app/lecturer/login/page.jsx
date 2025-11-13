//app/lecturer/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("lecturer-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
      callbackUrl: "/lecturer/dashboard",
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      router.push(res.url || "/lecturer/dashboard");
    }
  };

  return (
    <div className="relative">
      {/* ---------- FULL PAGE LOADING OVERLAY ---------- */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <p className="text-white text-2xl font-semibold animate-pulse">
            Please wait…
          </p>
        </div>
      )}

      {/* ---------- LOGIN FORM UI ---------- */}
      <div className="flex items-start mt-20 justify-center min-h-screen bg-gray-200 bg-[url('/images/bg-6.jpg')] bg-cover bg-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 w-72 mt-10"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Lecturer Login</h2>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
          >
            Login
          </button>

          <p className="mt-3 text-center text-sm">
            Don’t have an account?{" "}
            <a
              href="/lecturer-registration"
              className="text-blue-600 hover:underline"
            >
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
