
//app/registration-success/page.jsx
"use client";

import Link from "next/link";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-200">
        <h1 className="text-3xl font-bold text-green-700 mb-4">🎉 Registration Successful!</h1>
        <p className="text-gray-700 mb-6">
          Your account has been created successfully. You can now login using your credentials.
        </p>
        <Link
          href="lecturer/login"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          🔑 Go to Login
        </Link>
      </div>
    </div>
  );
}
