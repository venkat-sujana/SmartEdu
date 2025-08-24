//app/student/login/page.jsx

"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function MultiRoleLogin() {
  const [identifier, setIdentifier] = useState(""); // Email / AdmissionNo
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("lecturer"); // default
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      redirect: true,
      identifier,
      password,
      role,
      callbackUrl:
        role === "lecturer"
          ? "/lecturer/dashboard"
          : role === "student"
          ? "/student/dashboard"
          : "/principal/dashboard",
    });

    if (res?.error) setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Role Selector */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        >
          <option value="lecturer">Lecturer</option>
          <option value="student">Student</option>
          <option value="principal">Principal</option>
        </select>

        {/* Identifier */}
        <input
          type="text"
          placeholder={role === "student" ? "Admission No" : "Email"}
          className="w-full p-2 border rounded mb-3"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
