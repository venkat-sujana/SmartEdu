"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LegacyAdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin/login")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      Redirecting to admin login...
    </div>
  )
}
