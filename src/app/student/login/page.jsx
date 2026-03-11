// app/student/login/page.jsx
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
      password,
      callbackUrl: "/student/dashboard",
    });

    setLoading(false);

    if (!res) {
      setError("Something went wrong, please try again.");
      return;
    }

    if (res.error) {
      setError("Invalid credentials");
      return;
    }

    router.push("/student/dashboard");
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="mt-4 animate-pulse text-lg text-white">Loading...</p>
        </div>
      )}

      <div className="mt-12 flex min-h-screen flex-col items-center justify-start bg-blue-500 bg-[url('/images/bg-8.jpg')] bg-cover bg-center pt-10">
        <form
          className="w-60 max-w-sm space-y-4 rounded-xl bg-white p-4 shadow-md"
          onSubmit={handleSubmit}
        >
          <h1 className="text-center text-xl font-bold text-gray-800">Student Login</h1>

          {error && <div className="rounded bg-red-50 p-2 text-center text-red-600">{error}</div>}

          <input
            type="text"
            placeholder="Admission No"
            value={admissionNo}
            onChange={(e) => setAdmissionNo(e.target.value)}
            className="w-full rounded border px-5 py-2 focus:ring-2 focus:ring-green-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-5 py-2 focus:ring-2 focus:ring-green-500"
            required
          />

          <button className="w-full cursor-pointer rounded bg-green-600 py-2 text-white hover:bg-green-700">
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Do not have an account?{" "}
            <a href="/student-activate" className="text-green-600 hover:underline">
              Activate your account
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
