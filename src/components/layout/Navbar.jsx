//src/components/layout/Navbar.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  CircleHelp,
  CircleUserRound,
  GraduationCap,
  Home,
  LogOut,
  Menu,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

function NavLink({ href, icon, label, active = false, accent = 'text-slate-500', onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <span
        className={`rounded-xl p-1.5 transition ${
          active ? 'bg-white/12 text-white' : `bg-slate-100 ${accent} group-hover:bg-slate-200`
        }`}
      >
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  )
}

export default function Navbar({ onOpenDrawer }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user || null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const canAccessAiAttendance = user?.role === 'lecturer' || user?.role === 'principal'

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: <Home className="h-4 w-4" />,
      accent: 'text-emerald-600',
    },
    

    {
      href: '/about',
      label: 'About',
      icon: <CircleHelp className="h-4 w-4" />,
      accent: 'text-violet-600',
    },
  ]

  if (user?.role === 'admin') {
    navItems.push({
      href: '/admin-panel',
      label: 'Admin Panel',
      icon: <ShieldEllipsis className="h-4 w-4" />,
      accent: 'text-rose-600',
    })
  }

  const handleMenuToggle = () => {
    setMobileMenuOpen(prev => !prev)
    onOpenDrawer?.()
  }

  return (
    <>
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-full items-center justify-between gap-4 bg-emerald-600 px-3 py-2 text-white sm:px-5">
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={handleMenuToggle}
              aria-label="Open menu"
              className="rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>

              <div className="hidden sm:block">
                <p className="text-xs tracking-wider text-white uppercase">OSRA</p>

                <p className="max-w-full truncate text-sm font-semibold text-white">
                  {user?.collegeName}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          {user && (
            <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-white px-2 py-1 shadow-sm lg:flex">
              {navItems.map(item => {
                const isActive =
                  item.href === '/' ? pathname === item.href : pathname?.startsWith(item.href)

                return (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={Boolean(isActive)}
                    accent={item.accent}
                  />
                )
              })}
            </nav>
          )}

          {!user ? (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-600 to-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-200/70 transition hover:from-cyan-500 hover:to-sky-500"
            >
              Login
            </Link>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 px-2 md:flex">
                <CircleUserRound className="text-white-500 color h-5 w-5" />
                <span className="max-w-[120px] truncate text-sm font-medium text-white">
                  {user.name}
                </span>
              </div>

              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 sm:inline-flex"
              >
                <CircleUserRound className="h-4 w-4" />
                Profile
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Mobile dropdown menu ── */}
        <AnimatePresence>
          {mobileMenuOpen && user && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/30 bg-white/95 backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navItems.map(item => {
                  const isActive =
                    item.href === '/' ? pathname === item.href : pathname?.startsWith(item.href)

                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={Boolean(isActive)}
                      accent={item.accent}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  )
                })}

                {/* User info + profile on mobile */}
                <div className="mt-2 border-t border-slate-100 pt-3">
                  <div className="mb-2 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                    <CircleUserRound className="h-5 w-5 text-slate-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mb-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <CircleUserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
