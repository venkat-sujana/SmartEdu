
//app/lecturer/login/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: true,
      identifier: email.trim().toLowerCase(),
      password: password.trim(),
      role: "lecturer",
      callbackUrl: "/lecturer/dashboard",
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/lecturer/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-lg p-6 w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Lecturer Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        <div className="my-4 text-center text-gray-500">or</div>

<button
  type="button"
  onClick={() => signIn("google", { callbackUrl: "/auto-redirect" })}
  className="flex items-center justify-center gap-2 w-full border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
>
  <FcGoogle size={22} />
  <span className="text-gray-700 font-medium">Sign in with Google</span>
</button>


        <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <a
            href="/lecturer-registration"
            className="text-blue-600 hover:underline"
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
