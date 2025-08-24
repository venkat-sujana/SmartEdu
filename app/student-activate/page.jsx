//app/student-activate/page.jsx

"use client";

import { useState } from "react";
import Link from "next/link";

export default function StudentActivatePage() {
  const [admissionNo, setAdmissionNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const strength = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s; // 0-4
  })();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    if (strength < 2) {
      setErr("Please use a stronger password (min 8 chars incl. a number or uppercase).");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/students/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErr(data?.error || "Activation failed");
        return;
      }

      setMsg("🎉 Account activated! You can login now.");
      // optional: redirect after short delay
      setTimeout(() => {
        window.location.href = "/registration-success";
      }, 800);
    } catch (e) {
      setErr("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-emerald-100 via-blue-100 to-indigo-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">🔐 Activate Student Account</h1>
        <p className="text-sm text-gray-600 text-center">Set your password using your Admission No</p>

        <div>
          <label className="block text-sm mb-1">Admission No</label>
          <input
            type="text"
            value={admissionNo}
            onChange={(e) => setAdmissionNo(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="e.g. 23GJ1234"
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            placeholder="Min 8 characters"
            required
          />
          {/* simple strength bar */}
          <div className="h-1 mt-2 bg-gray-200 rounded">
            <div
              className={[
                "h-1 rounded transition-all",
                strength === 0 ? "w-0" :
                strength === 1 ? "w-1/4" :
                strength === 2 ? "w-2/4" :
                strength === 3 ? "w-3/4" : "w-full"
              ].join(" ")}
              style={{ backgroundColor: strength < 2 ? "#f97316" : strength < 4 ? "#eab308" : "#22c55e" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Use 8+ chars, include uppercase/number/symbol for better strength.
          </p>
        </div>

        <div>
          <label className="block text-sm mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
        </div>

        {err && <p className="text-sm text-red-600 text-center">{err}</p>}
        {msg && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded text-center">
            {msg} &nbsp;
            <Link href="/login" className="underline font-medium">Go to Login</Link>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 transition disabled:opacity-70"
        >
          {isLoading ? "Activating..." : "Set Password & Activate"}
        </button>

        <p className="text-center text-sm text-gray-600">
          Already activated?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
