"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "./components/SessionProviderWrapper";
import Navbar from "/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0f766e",
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.5rem",
            },
            success: { icon: "✅" },
            error: {
              style: { background: "#dc2626" },
              icon: "❌",
            },
          }}
        />

        <SessionProviderWrapper>
          <Navbar />
          
         <main className="p-4">{children}</main>
       </SessionProviderWrapper>
       
      </body>
    </html>
  );
}
