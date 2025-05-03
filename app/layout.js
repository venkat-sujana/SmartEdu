import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// app/layout.js or app/layout.tsx
import { Toaster } from "react-hot-toast";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "OSRA",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  description: "Online student registration App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        
        <Toaster
          position="top-right"
          toastOptions={{
            className: "",
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
        {children}

      </body>
    </html>
  );
}
