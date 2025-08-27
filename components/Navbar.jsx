'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Tutorials from './tutorials/page';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [collegeName, setCollegeName] = useState('');

  // ✅ Fetch college name from API using collegeId
  useEffect(() => {
    const fetchCollegeName = async () => {
      if (session?.user?.collegeId) {
        try {
          const res = await fetch(`/api/colleges/${session.user.collegeId}`);
          const data = await res.json();
          if (res.ok) {
            setCollegeName(data.name); // assuming { name: "ABC College" }
          } else {
            console.error("College fetch failed:", data.error);
          }
        } catch (err) {
          console.error("Error fetching college name:", err);
        }
      }
    };

    fetchCollegeName();
  }, [session?.user?.collegeId]);

  // ✅ Role-wise logout redirect
  const handleLogout = () => {
    let redirectPath = '/';
    if (session?.user?.role === 'lecturer') redirectPath = '/lecturer/login';
    else if (session?.user?.role === 'student') redirectPath = '/student/login';
    else if (session?.user?.role === 'principal') redirectPath = '/principal/login';

    signOut({ callbackUrl: redirectPath });
  };

  // ✅ Role-wise dashboard link
  const getDashboardLink = () => {
    if (session?.user?.role === 'lecturer') return '/lecturer/dashboard';
    if (session?.user?.role === 'student') return '/student/dashboard';
    if (session?.user?.role === 'principal') return '/principal/dashboard';
    return '/';
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          OSRA
        </Link>

        <div className="flex gap-4 items-center">
          {/* ✅ College name */}
          {collegeName && (
            <span className="text-sm font-semibold hidden sm:inline">
              {collegeName}
            </span>
          )}

          {status === 'authenticated' && (
            <>
              <Link href={getDashboardLink()} className="hover:underline font-semibold">
                Dashboard
              </Link>

              {/* ✅ Tutorials అన్ని role కి కనిపిస్తుంది */}
              <Tutorials />

              <span className="hidden sm:inline text-md mr-3 font-semibold">
                {session?.user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          )}

{status === "unauthenticated" && (
  <div className="flex gap-2">
    <Link href="/student/login" className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-100">
      Student Login
    </Link>
    <Link href="/lecturer/login" className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-100">
      Lecturer Login
    </Link>
    <Link href="/principal/login" className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-100">
      Principal Login
    </Link>
  </div>
)}

        </div>
      </div>
    </nav>
  );
}
