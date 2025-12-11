"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

import Sidebar from "./components/Sidebar";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
        <SessionProvider>
          <Toaster />

          {/* Navbar (fixed on top) */}
          {/* <Navbar onOpenDrawer={() => setDrawerOpen(true)} /> */}
          
          <Navbar onOpenDrawer={() => setDrawerOpen(true)} />

          <div className="min-h-screen md:flex pt-16"> {/* pt-16 to offset fixed navbar */}
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <Sidebar />
            </div>

            {/* Mobile drawer / overlay */}
            {drawerOpen && (
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
        </SessionProvider>
      </body>
    </html>
  );
}
