// app/lecturer/layout.jsx

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function LecturerLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/lecturer-logout"); // or directly use signOut({ callbackUrl: '/lecturer-login' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Lecturer Portal</h1>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
