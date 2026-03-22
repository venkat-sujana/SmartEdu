//app/layout.js
"use client"

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "react-hot-toast"
import { SessionProvider, useSession } from "next-auth/react"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
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

function AppShell({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const isAuthPage = useMemo(() => {
    const isModuleAuthPage =
      pathname === "/invigilation" ||
      pathname === "/invigilation/login" ||
      pathname === "/timetable-management" ||
      pathname === "/timetable-management/login"

    return (
      pathname === "/" ||
      pathname === "/auth/login" ||
      pathname === "/lecturer/login" ||
      pathname === "/principal/login" ||
      pathname === "/student/login" ||
      pathname === "/admin/login" ||
      isModuleAuthPage
    )
  }, [pathname])

  const isStandaloneModulePage =
    pathname.startsWith("/invigilation") || pathname.startsWith("/timetable-management")

  const role = session?.user?.role
  const isStudent = role === "student"

  if (isAuthPage || isStandaloneModulePage) {
    return <div className="min-h-screen">{children}</div>
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-medium text-slate-600">Checking session...</p>
      </div>
    )
  }

  return (
    <>
      <Navbar onOpenDrawer={() => setDrawerOpen(true)} />

      <div className="min-h-screen pt-16 md:flex">
        {!isStudent && (
          <div className="hidden md:block">
            <Sidebar />
          </div>
        )}

        {!isStudent && drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="relative z-50 h-full w-72 bg-white shadow-md">
              <div className="p-3">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="mb-2 rounded-md border px-2 py-1 text-sm"
                >
                  Close
                </button>
                <Sidebar onClose={() => setDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>OSRA | Online Student Record & Attendance Management System</title>

        <meta
          name="description"
          content="OSRA is a smart online student record and attendance management system for colleges to manage attendance, exams, and academic performance efficiently."
        />

        <meta
          name="keywords"
          content="OSRA, student management system, online attendance system, college ERP, exam management system"
        />

        <meta name="robots" content="index, follow" />

        <meta property="og:title" content="OSRA | Smart College Management System" />
        <meta
          property="og:description"
          content="Manage student records, attendance, exams, and academic performance with OSRA – a smart digital solution for colleges."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="OSRA" />
        <meta property="og:url" content="https://smart-edu-lyart.vercel.app" />
        <meta property="og:image" content="/og-osra.png" />

        <meta
          name="google-site-verification"
          content="ONxgq2ymz7PH4gN4ZUuCRCTU3DgcS-Wc7xpVOck8_9Y"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://smart-edu-lyart.vercel.app/#software",
              name: "OSRA – Online Student Record & Attendance System",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              description:
                "OSRA is an online student record and attendance management system designed for colleges to manage attendance, exams, and academic performance efficiently.",
              url: "https://smart-edu-lyart.vercel.app",
              creator: {
                "@type": "Organization",
                name: "OSRA",
              },
              audience: {
                "@type": "EducationalAudience",
                educationalRole: "administrator",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
            }),
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <SessionProvider baseUrl={process.env.NEXTAUTH_URL || 'http://localhost:3000'} refetchInterval={60 * 1000}>
          <Toaster />
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  )
}
