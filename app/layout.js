// app/layout.js
"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { SessionProvider, useSession } from "next-auth/react"
import Sidebar from "./components/Sidebar"
import Navbar from "@/components/Navbar"
import { useState, useMemo } from "react"
import { usePathname } from "next/navigation"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

// UI shell
function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // login / public routes – no layout
  const isAuthPage = useMemo(() => {
    return (
      pathname === "/" ||
      pathname === "/auth/login" ||
      pathname === "/lecturer/login" ||
      pathname === "/principal/login" ||
      pathname === "/student/login"
    )
  }, [pathname])

  const role = session?.user?.role
  const isStudent = role === "student"

  // Auth pages → no navbar/sidebar
  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>
  }

  // Optional: while session loading
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600 font-medium">Checking session...</p>
      </div>
    )
  }

  // COMMON NAVBAR FOR ALL AUTH USERS (logout etc.)
  return (
    <>
      <Navbar onOpenDrawer={() => setDrawerOpen(true)} />

      <div className="min-h-screen md:flex pt-16">
        {/* Sidebar:
            - Student → HIDE
            - Lecturer/Principal → SHOW
        */}
        {!isStudent && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {/* Mobile drawer / overlay → studentకి కూడా దాచాలి */}
        {!isStudent && drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative z-50 h-full w-72 bg-white shadow-md">
              <div className="p-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mb-2 rounded-md px-2 py-1 text-sm border"
                >
                  Close
                </button>
                <Sidebar onClose={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <SessionProvider>
          <Toaster />
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  )
}
