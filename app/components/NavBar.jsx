'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [collegeName, setCollegeName] = useState('');

  // Fetch college name from API using collegeId
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

  const handleLogout = () => {
    signOut({ callbackUrl: '/lecturer/login' });
  };

  return (
    <nav className="bg-blue-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          OSRA App
        </Link>

        <div className="flex gap-4 items-center">
          {/* College name shown here */}
          {collegeName && (
            <span className="text-sm font-semibold hidden sm:inline">
              {collegeName}
            </span>
          )}

          <Link href="/about" className="hover:underline">
            About
          </Link>

          {status === 'authenticated' && (
            <>
              <span className="hidden sm:inline text-sm font-medium">
                {session?.user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </>
          )}

          {status === 'unauthenticated' && (
            <Link
              href="/lecturer/login"
              className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-semibold hover:bg-blue-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
