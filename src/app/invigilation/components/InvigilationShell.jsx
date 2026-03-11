"use client";

import InvigilationSidebar from "@/app/invigilation/components/InvigilationSidebar";
import { invigilationLogoutAction } from "@/app/invigilation/actions";

export default function InvigilationShell({ user, title, children }) {
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
          <form action={invigilationLogoutAction}>
            <button className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700">
              Logout
            </button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <InvigilationSidebar role={role} />
          <main className="rounded-xl border bg-white p-4 shadow-sm">{children}</main>
        </div>
      </div>
    </div>
  );
}
