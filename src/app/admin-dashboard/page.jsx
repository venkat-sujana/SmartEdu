"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin-panel")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      Redirecting to admin panel...
    </div>
  )
}
