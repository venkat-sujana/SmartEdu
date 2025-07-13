// components/NavBar.jsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/lecturer-login" }); // Or student-login
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-6">
        <Link href="/admin" className="font-bold text-xl">
          OSRA
        </Link>
        {session?.user?.role === "lecturer" && (
          <>
            <Link href="/lecturer/dashboard" className={navLinkStyle(pathname, "/lecturer/dashboard")}>
              Dashboard
            </Link>
            <Link href="/lecturer/attendance" className={navLinkStyle(pathname, "/lecturer/attendance")}>
              Attendance
            </Link>
          </>
        )}
      </div>

      {session ? (
        <button
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-gray-200"
        >
          Logout
        </button>
      ) : (
        <Link href="/lecturer-login" className="hover:underline">
          Login
        </Link>
      )}
    </nav>
  );
}

function navLinkStyle(current, target) {
  return `hover:underline ${current === target ? "underline font-semibold" : ""}`;
}
