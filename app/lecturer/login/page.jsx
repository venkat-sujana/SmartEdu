"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SpinnerDots from "@/components/SpinnerDots";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("lecturer");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      role,
      redirect: false,
    });

    setIsLoading(false);

    if (res?.ok) {
      if (role === "lecturer") router.push("/lecturer/dashboard");
      else if (role === "student") router.push("/student/dashboard");
      else if (role === "principal") router.push("/principal/dashboard");
    } else {
      alert("Invalid credentials for selected role");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-100 via-indigo-100 to-emerald-100">
      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🔑 Login</h2>

        {/* Role Selection */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Select Role
          </label>
          <select
            id="role"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="lecturer">Lecturer</option>
            <option value="student">Student</option>
            <option value="principal">Principal</option>
          </select>
        </div>

        {/* Identifier field */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
            {role === "student" ? "Admission No" : "Email"}
          </label>
          <input
            id="identifier"
            type={role === "student" ? "text" : "email"}
            placeholder={role === "student" ? "Enter your Admission No" : "Enter your Email"}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <SpinnerDots /> : "Login"}
        </button>

        {/* Role-based Register Links */}
        {role === "lecturer" && (
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/lecturer-registration" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </p>
        )}

        {role === "student" && (
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/student-active" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </p>
        )}

        {role === "principal" && (
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a href="/principal-registration" className="text-blue-600 hover:underline font-medium">
              Register here
            </a>
          </p>
        )}
      </form>
    </div>
  );
}
