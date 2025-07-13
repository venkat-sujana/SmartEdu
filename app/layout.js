"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NavBar from "./components/NavBar"; // ✅ fixed default import
import { Providers } from "./providers";  // ✅ correct named import

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
        <Providers>
          <NavBar />
          <main className="p-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
