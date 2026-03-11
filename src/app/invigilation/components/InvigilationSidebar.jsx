"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function SidebarLink({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium ${
        active ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function InvigilationSidebar({ role }) {
  const links =
    role === "admin"
      ? [{ href: "/invigilation/admin/dashboard", label: "Admin Dashboard" }]
      : [{ href: "/invigilation/lecturer/dashboard", label: "Lecturer Dashboard" }];

  return (
    <aside className="w-full rounded-xl border bg-white p-3 shadow-sm md:w-64">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Invigilation</p>
      <div className="space-y-1">
        {links.map((l) => (
          <SidebarLink key={l.href} href={l.href} label={l.label} />
        ))}
      </div>
    </aside>
  );
}

