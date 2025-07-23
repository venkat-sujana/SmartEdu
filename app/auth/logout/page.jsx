//app/auth/logout/page.jsx
"use client"

import { signOut } from "next-auth/react"
import { useEffect } from "react"

export default function LogoutPage() {
  useEffect(() => {
    signOut({
  callbackUrl: "/auth/lecturer/login"  // ← ముందు `/` తప్పనిసరి
})

  }, [])

  return <p className="text-center mt-10">Logging out...</p>
}
