//app/principal/login/page.jsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function PrincipalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      identifier: email,
      password,
      role: "principal",
      redirect: false,
    });

    if (res.ok) {
      window.location.href = "/principal/dashboard";
    } else {
      setError("❌ Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6"
      >
        <div className="flex flex-col items-center space-y-2 mb-2">
          <span className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl">🎓</span>
          <h2 className="text-2xl font-extrabold text-gray-800">Principal Login</h2>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
          required
        />
        {error && (
          <div className="text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition cursor-pointer"
        >
          Login
        </button>
        <div className="text-center pt-2 text-gray-600 text-sm">
          {"Don't have an account?"}
          <a href="/principal-registration" className="text-blue-600 hover:underline ml-1 cursor-pointer">
            Register here
          </a>
        </div>
      </form>
    </div>
  );
}
