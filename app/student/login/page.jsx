"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function StudentLoginPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: true,
      identifier: admissionNo, // 👈 important: admissionNo ని identifier గా పంపాలి
      password,
      role: "student",
      callbackUrl: "/student/dashboard",
    });
    if (res?.error) setError("Invalid credentials");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-center">Student Login</h1>
        <input
          type="text"
          placeholder="Admission No"
          value={admissionNo}
          onChange={(e) => setAdmissionNo(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Login
        </button>
        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <a href="/student-activate" className="text-green-600">
            Active your Account
          </a>
        </p>
      </form>
    </div>
  );
}
