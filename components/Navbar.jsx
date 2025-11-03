//app/components/Navbar.jsx

'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Tutorials from './tutorials/page'
import Image from 'next/image' // Next.js Image component recommended!

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
            setCollegeName(data.name) // assuming { name: "ABC College" }
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
    <nav className="mt-10 bg-black px-4 py-3 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/osra-4.jpg" // public లో పక్క logo image ఉంచండి, లేక absolute cdn link
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full border-2 border-white bg-white shadow-md"
          />
          {/* You want text also beside logo: */}
          <span className="ml-1 hidden text-xl font-bold sm:inline">OSRA</span>
        </Link>

        <div className="flex items-center gap-4">
          {/* ✅ College name */}
          {collegeName && (
            <span className="hidden text-sm font-semibold sm:inline">{collegeName}</span>
          )}

          {status === 'authenticated' && (
            <>
              <Link href={getDashboardLink()} className="font-semibold hover:underline">
                Dashboard
              </Link>

              {/* ✅ Tutorials అన్ని role కి కనిపిస్తుంది */}
              <Tutorials />

              <span className="text-md mr-3 hidden font-semibold sm:inline">
                {session?.user?.name}
              </span>

              <button
                onClick={handleLogout}
                className="cursor-pointer rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}

          {status === 'unauthenticated' && (
            <div className="flex gap-2">
              <Link
                href="/student/login"
                className="rounded-md  px-3 py-1 text-sm font-semibold text-white-600 hover:bg-blue-500"
              >
                Student Login
              </Link>
              <Link
                href="/admin"
                className="rounded-md  px-3 py-1 text-sm font-semibold text-white-600 hover:bg-blue-500"
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
