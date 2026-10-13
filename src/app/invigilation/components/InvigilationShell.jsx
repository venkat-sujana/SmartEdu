//src/app/invigilation/components/InvigilationShell.jsx
"use client";

import InvigilationSidebar from "@/app/invigilation/components/InvigilationSidebar";
import { signOut } from "next-auth/react";

export default function InvigilationShell({ user, title, children, backUrl }) {
  const safeUser = user || {};
  const role = safeUser.role || "user";
  const name = safeUser.name || "User";
  const designation = safeUser.designation || "";
  const institutionName = safeUser.institutionName || "";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-600">
              {name}
              {designation ? ` | ${designation}` : ""}
              {institutionName ? ` | ${institutionName}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <InvigilationSidebar role={role} />
          <main className="min-w-0 rounded-xl border bg-white p-3 shadow-sm sm:p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
