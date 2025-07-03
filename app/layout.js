"use client"; // 👈 Very Important
import { SessionProvider } from "next-auth/react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// app/layout.js or app/layout.tsx
import { Toaster } from "react-hot-toast";

//  import { Providers } from "./providers";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000, // 4 seconds
            style: {
              background: "#0f766e", // teal-700
              color: "white",
              fontWeight: "bold",
              borderRadius: "0.5rem",
            },
            success: {
              icon: "✅",
            },
            error: {
              style: {
                background: "#dc2626", // red-600
              },
              icon: "❌",
            },
          }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
