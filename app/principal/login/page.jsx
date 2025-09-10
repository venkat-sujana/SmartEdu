//app/principal/login/page.jsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function PrincipalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await signIn("credentials", {
      identifier: email,
      password,
      role: "principal",   // 👈 తప్పనిసరిగా పంపాలి
      redirect: false,
    });

    if (res.ok) {
      window.location.href = "/principal/dashboard";
    } else {
      alert("❌ Invalid credentials");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4"
    >
      <h2 className="text-xl font-bold text-center">🎩 Principal Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
        required
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
      if don't have an account
      <a href="/principal-registration" className="text-blue-600 hover:underline">
        Register here
      </a>
    </form>
  );
}
