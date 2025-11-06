'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Tutorials from './tutorials/page'
import Image from 'next/image'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [collegeName, setCollegeName] = useState('')

  // ✅ Fetch college name from API using collegeId
  useEffect(() => {
    const fetchCollegeName = async () => {
      if (session?.user?.collegeId) {
        try {
          const res = await fetch(`/api/colleges/${session.user.collegeId}`)
          const data = await res.json()
          if (res.ok) {
            setCollegeName(data.name)
          } else {
            console.error('College fetch failed:', data.error)
          }
        } catch (err) {
          console.error('Error fetching college name:', err)
        }
      }
    }

    fetchCollegeName()
  }, [session?.user?.collegeId])

  // ✅ Role-wise logout redirect
  const handleLogout = () => {
    let redirectPath = '/'
    if (session?.user?.role === 'lecturer') redirectPath = '/lecturer/login'
    else if (session?.user?.role === 'student') redirectPath = '/student/login'
    else if (session?.user?.role === 'principal') redirectPath = '/principal/login'
    signOut({ callbackUrl: redirectPath })
  }

  // ✅ Role-wise dashboard link
  const getDashboardLink = () => {
    if (session?.user?.role === 'lecturer') return '/lecturer/dashboard'
    if (session?.user?.role === 'student') return '/student/dashboard'
    if (session?.user?.role === 'principal') return '/principal/dashboard'
    return '/'
  }

  return (
    <nav className="fixed top-0 w-full  backdrop-blur-md bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-800/90 text-white shadow-lg z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        {/* ==== Left: Logo + Title ==== */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex items-center justify-center bg-white p-1 rounded-full shadow-md">
            <Image
              src="/images/123.jpeg" // public folderలో logo ఉంచండి
              alt="OSRA Logo"
              width={45}
              height={45}
              className="rounded-full drop-shadow-md"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-wide">OSRA</span>
            <span className="text-[10px] text-gray-200">Digital Platform for Modern Education</span>
          </div>
        </Link>

        {/* ==== Right: Links + Buttons ==== */}
        <div className="flex items-center gap-4">
          {/* ✅ College name */}
          {collegeName && (
            <span className="hidden text-sm font-semibold text-blue-100 md:inline">
              {collegeName}
            </span>
          )}

          {status === 'authenticated' ? (
            <>
              <Link
                href={getDashboardLink()}
                className="font-semibold hover:text-yellow-300 transition"
              >
                Dashboard
              </Link>

              {/* ✅ Tutorials menu */}
              <Tutorials />

              <span className="hidden text-sm font-semibold md:inline">
                {session?.user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              {/* <Link
                href="/student/login"
                className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold hover:bg-blue-500/70 transition"
              >
                Student Login
              </Link>
              <Link
                href="/admin"
                className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold hover:bg-blue-500/70 transition"
              >
                Admin
              </Link> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

// "use client";
// import Link from "next/link";
// import { GraduationCap } from "lucide-react";

// export default function Navbar() {
//   return (
//     <header className="fixed top-0 w-full z-50 bg-white shadow-sm">
//       <nav className="flex items-center justify-between px-6 py-3 md:px-10">
//         <div className="flex items-center space-x-2">
//           <GraduationCap className="text-blue-600 w-7 h-7" />
//           <h1 className="text-xl font-bold text-blue-700">SmartCollege</h1>
//         </div>

//         <ul className="hidden md:flex space-x-8 font-medium">
//           <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
//           <li><Link href="/#features" className="hover:text-blue-600">Features</Link></li>
//           <li><Link href="/#login" className="hover:text-blue-600">Login</Link></li>
//           <li><Link href="/#contact" className="hover:text-blue-600">Contact</Link></li>
//         </ul>

//         <Link
//           href="/lecturer-login"
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
//         >
//           Login
//         </Link>
//       </nav>
//     </header>
//   );
// }

