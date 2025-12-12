//app/lecturer/login/page.jsx
"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Subject to Group mapping
const subjectGroupMap = {
  MandAT: "mandat",
  CET: "cet",
  MLT: "mlt",
  Maths: "mpc",
  Physics: "mpc",
  Chemistry: "mpc",
  Botany: "bipc",
  Zoology: "bipc",
  Civics: "cec",
  Economics: "cec",
  History: "hec",
  Commerce: "cec",
  GFC: "gfc",
};

export default function LecturerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  // ✅ Session వచ్చిన వెంటనే subject ఆధారంగా redirect
  useEffect(() => {
    if (status === "authenticated" && session?.user?.subject) {
      const subject = session.user.subject;
      const group = subjectGroupMap[subject] || "mpc";
      router.push(`/dashboards/${group}`);
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("lecturer-login", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (res?.error) {
      setError("Invalid credentials");
      setLoading(false);
    } else {
      // ఇక్కడ redirect చేయాల్సిన అవసరం లేదు
      // useSession effect session update అయిన వెంటనే redirect చేస్తుంది
      setLoading(false);
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

      <div className="flex items-start mt-1 justify-center min-h-screen bg-gray-200 bg-[url('/images/bg-6.jpg')] bg-cover bg-center">
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
