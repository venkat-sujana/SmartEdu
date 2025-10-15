"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function StudentLoginPage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier: admissionNo.trim(),
      password: password.trim(),
      role: "student",
      callbackUrl: "/student/dashboard",
    });

    if (res?.error) {
      setError("❌ Invalid Admission No or Password");
    } else if (res?.ok) {
      router.push(res.url);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-sm" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold text-center text-gray-800">Student Login</h1>

        {error && <div className="text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>}

        <input
          type="text"
          placeholder="Admission No"
          value={admissionNo}
          onChange={(e) => setAdmissionNo(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-green-500"
          required
        />

        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
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
  );
}
