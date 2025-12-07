'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ title = 'Dashboard', navItems = [] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-blue-800 text-white">
        <h1 className="font-semibold text-lg truncate">{title}</h1>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md border border-blue-300"
          aria-label="Open sidebar"
        >
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </header>

      {/* Drawer for mobile */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setOpen(false)}
        />

        <aside
          className={`
            absolute inset-y-0 left-0 w-72 max-w-full bg-white shadow-xl
            transform transition-transform duration-200
            ${open ? 'translate-x-0' : '-translate-x-full'}
            flex flex-col
          `}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-blue-800 text-white">
            <span className="font-semibold">{title}</span>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-md border border-blue-300"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) =>
              item.href.startsWith('#') ? (
                <button
                  key={item.label}
                  onClick={() => {
                    const el = document.querySelector(item.href);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md text-sm font-medium
                    ${
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:border-r md:border-gray-200 md:bg-white md:h-screen md:sticky md:top-0">
        <div className="h-16 flex items-center px-4 bg-blue-800 text-white">
          <h1 className="font-semibold text-xl truncate">{title}</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) =>
            item.href.startsWith('#') ? (
              <button
                key={item.label}
                onClick={() => {
                  const el = document.querySelector(item.href);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block px-3 py-2 rounded-md text-sm font-medium
                  ${
                    pathname === item.href
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }
                `}
              >
                {item.label}
              </Link>
            )
          )}
        </nav>
      </aside>
    </>
  );
}
