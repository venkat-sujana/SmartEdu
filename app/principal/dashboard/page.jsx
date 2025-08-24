
//app/principal/dashboard/page.jsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function PrincipalDashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">You are not logged in.</p>
      </div>
    );
  }

  const principal = session.user;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Welcome, {principal.name}
        </h1>
        {/* <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button> */}
      </header>

      <section className="bg-white p-6 rounded-2xl shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Principal Dashboard
        </h2>

        <ul className="space-y-3">
          <li className="p-3 border rounded-lg hover:bg-gray-50">
            📊 View College Statistics
          </li>
          <li className="p-3 border rounded-lg hover:bg-gray-50">
            👩‍🏫 Manage Lecturers
          </li>
          <li className="p-3 border rounded-lg hover:bg-gray-50">
            🎓 Manage Students
          </li>
          <li className="p-3 border rounded-lg hover:bg-gray-50">
            📅 View Attendance Reports
          </li>
        </ul>
      </section>
    </div>
  );
}
