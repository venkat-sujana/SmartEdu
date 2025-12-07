"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import Navbar from "/components/Navbar";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Navbar />
      <Toaster />
      <main>{children}</main>
    </SessionProvider>
  );
}
