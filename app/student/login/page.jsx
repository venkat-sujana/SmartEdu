//app/student/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("student-login", {
      redirect: false,
      admissionNo: admissionNo.trim(),
      password: password,
      callbackUrl: "/student/dashboard",
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else if (res?.url) {
      router.push(res.url);
    }
  };

  return (
    <div className="relative">

      {/* ---------- FULL PAGE LOADING SPINNER ---------- */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

          <p className="text-white text-lg mt-4 animate-pulse">Loading…</p>
        </div>
      )}

      {/* ---------- LOGIN UI ---------- */}
      <div className="min-h-screen mt-12 flex flex-col items-center justify-start bg-blue-500 pt-10 bg-[url('/images/bg-8.jpg')] bg-cover bg-center">
        <form
          className="bg-white p-4 rounded-xl shadow-md space-y-4 w-60 max-w-sm"
          onSubmit={handleSubmit}
        >
          <h1 className="text-xl font-bold text-center text-gray-800">
            Student Login
          </h1>

          {error && (
            <div className="text-red-600 bg-red-50 p-2 rounded text-center">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Admission No"
            value={admissionNo}
            onChange={(e) => setAdmissionNo(e.target.value)}
            className="w-full px-5 py-2 border rounded focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-2 border rounded focus:ring-2 focus:ring-green-500"
            required
          />

          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 cursor-pointer">
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <a href="/student-activate" className="text-green-600 hover:underline">
              Activate your Account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
