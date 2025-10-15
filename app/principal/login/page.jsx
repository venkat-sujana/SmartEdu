"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PrincipalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      identifier: email.trim().toLowerCase(),
      password: password.trim(),
      role: "principal",
      callbackUrl: "/principal/dashboard",
    });

    if (res?.error) {
      setError("❌ Invalid Email or Password");
    } else if (res?.ok) {
      router.push(res.url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
      <form className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6" onSubmit={handleLogin}>
        <div className="flex flex-col items-center space-y-2 mb-2">
          <span className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl">🎓</span>
          <h2 className="text-2xl font-extrabold text-gray-800">Principal Login</h2>
        </div>

        {error && <div className="text-red-600 bg-red-50 p-2 rounded text-center">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />

        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
          Login
        </button>

        <p className="text-center text-sm text-gray-600 pt-2">
          Don't have an account?{" "}
          <a href="/principal-registration" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
      </form>
    </div>
  );
}
