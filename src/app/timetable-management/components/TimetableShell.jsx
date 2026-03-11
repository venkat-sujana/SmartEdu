"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { invigilationLogoutAction } from "@/app/invigilation/actions";

function LinkItem({ href, label }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm ${
        active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      {label}
    </Link>
  );
}

export default function TimetableShell({ user, title, children }) {
  const safeUser = user || {};
  const role = safeUser.role || "user";
  const name = safeUser.name || "User";

  const links =
    role === "admin"
      ? [{ href: "/timetable-management/admin/dashboard", label: "Admin Dashboard" }]
      : [{ href: "/timetable-management/lecturer/dashboard", label: "Lecturer Dashboard" }];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">{name}</p>
          </div>
          <form action={invigilationLogoutAction}>
            <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Logout
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border bg-white p-3 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Time Table
            </p>
            <div className="space-y-1">
              {links.map((l) => (
                <LinkItem key={l.href} href={l.href} label={l.label} />
              ))}
            </div>
          </aside>
          <main className="rounded-xl border bg-white p-4 shadow-sm">{children}</main>
        </div>
      </div>
    </div>
  );
}
