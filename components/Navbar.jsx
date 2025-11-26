// components/Navbar.jsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
// import Tutorials from './tutorials/page'
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
          <div className="relative flex items-center justify-center bg-white border-1 rounded-full shadow-md">
            <Image
              src="/images/profile.jpg" // public folderలో logo ఉంచండి
              alt="OSRA Logo"
              width={60}
              height={60}
              className="rounded-full drop-shadow-md"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide">Embeti Venkataiah</span>
            <span className="text-[15px] text-gray-200 font-bold">Fullstack Developer</span>
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

              <Link href="/components/about" className="font-semibold hover:text-yellow-300 transition">
                About
              </Link>

              {/* ✅ Tutorials menu */}
              {/* <Tutorials /> */}

              <span className="hidden text-sm font-semibold md:inline">
                {session?.user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-3 py-1 text-sm font-semibold hover:bg-red-600 transition cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}



