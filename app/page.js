// app/page.jsx - Fixed redirect + imports
"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users, ClipboardList, School } from "lucide-react"
import Sidebar from "./components/Sidebar"
import Navbar from "@/components/Navbar" // Fixed import path

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login") // Now exists!
      return
    }
  }, [status, router])

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading login Dashboard...</p>
        </div>
      </div>
    )
  }

  // No session - show public login (fallback)
  if (!session) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
        <div className="text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
            Go to Login →
          </Link>
        </div>
      </div>
    )
  }

  const user = session.user || {}

  // Show role selector if no role
  if (!user.role) {
    return <LoginRoleSelector />
  }

  // Protected dashboard
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        {/* Rest of dashboard content - unchanged */}
        <main className="flex-1 p-6 overflow-y-auto mt-16">
          {/* Your existing dashboard content */}
        </main>
      </div>
    </div>
  )
}

// Keep all your helper components (LoginRoleSelector, RoleCard, etc.) unchanged
