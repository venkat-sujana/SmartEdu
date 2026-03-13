//app/components/MobileTopbar.jsx

"use client"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function MobileTopbar({ onToggle }) {
  return (
    <div className="md:hidden fixed top-2 left-2 right-2 z-40 flex items-center justify-between gap-2">
      <button
        onClick={onToggle}
        aria-label="Open menu"
        className="rounded-md bg-white/90 p-2 shadow-md border"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="mx-auto px-4 py-2 rounded-md bg-white/90 shadow text-center">
        <h1 className="text-sm font-semibold">OSRA Portal</h1>
      </div>

      <div className="w-8" /> {/* spacer to balance */}
    </div>
  )
}
