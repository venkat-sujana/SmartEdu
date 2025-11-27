"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Subject to Group mapping
const subjectGroupMap = {
  "MandAT": "mandat",
  "CET": "cet",
  "MLT": "mlt",
  "Maths": "mpc",
  "Physics": "mpc",
  "Chemistry": "mpc",
  "Botany": "bipc",
  "Zoology": "bipc",
  "Civics": "cec",
  "Economics": "cec",
  "History": "hec",
  "Commerce": "cec",
};

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // NextAuth login (credentials provider)
    const res = await signIn("lecturer-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      // Wait for session to update and get lecturer subject from session
      // Poll api/auth/session for latest session (after login)
      try {
        let session = null;
        for (let i = 0; i < 10; i++) {
          const sessionRes = await fetch("/api/auth/session");
          session = await sessionRes.json();
          if (session?.user?.subject) break;
          // Small delay for session propagation
          await new Promise(r => setTimeout(r, 100));
        }
        // const subject = session?.user?.subject;
        // const group = subjectGroupMap[subject] || "mpc";
        // setLoading(false);

        // Redirect to correct dashboard
        router.push(`/dashboards/${group}`);
      } catch {
        setError("Could not fetch session info");
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <p className="text-white text-2xl font-semibold animate-pulse">
            Please wait…
          </p>
        </div>
      )}
      <div className="flex items-start mt-20 justify-center min-h-screen bg-gray-200 bg-[url('/images/bg-6.jpg')] bg-cover bg-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-lg p-6 w-72 mt-10"
        >
          <h2 className="text-2xl font-bold mb-4 text-center">Lecturer Login</h2>
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 cursor-pointer"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
          <p className="mt-3 text-center text-sm">
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
    </div>
  );
}
