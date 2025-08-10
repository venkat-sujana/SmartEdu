'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SpinnerDots from "@/components/SpinnerDots";

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/success",
    });

    setIsLoading(false);

    if (res.ok) {
      router.push("/lecturer/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div
      // className="min-h-screen flex items-center justify-center bg-[url('/images/bg-7.jpg')] bg-cover bg-center relative px-4"
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-100 via-indigo-100 to-emerald-100"
    >
      {/* Transparent overlay for dim effect */}
      {/* <div className="absolute inset-0 "></div> */}

      <form
        onSubmit={handleLogin}
        className="relative z-10 w-full max-w-md bg-white/100 backdrop-blur-sm p-8 rounded-xl shadow-md border border-gray-200 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">🎓 Lecturer Login</h2>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white cursur-pointer font-semibold py-2 rounded-md hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isLoading ? <SpinnerDots /> : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/lecturer-registration" className="text-blue-600 hover:underline font-medium">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}
