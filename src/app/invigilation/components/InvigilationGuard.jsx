//src/app/invigilation/components/InvigilationGuard.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function InvigilationGuard({ allowRoles, children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState(null);

  const sessionRole = session?.user?.role || null;
  const roleKey = allowRoles.join(",");

  useEffect(() => {
    if (status !== "authenticated") return;

    const roles = roleKey ? roleKey.split(",") : [];
    if (roles.length > 0 && !roles.includes(sessionRole)) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setProfile(data?.user || null);
      } catch {
        // Profile data is optional enrichment; the OSRA session stays authoritative.
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [status, sessionRole, roleKey]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/auth/login");
      return;
    }

    const roles = roleKey ? roleKey.split(",") : [];
    if (roles.length > 0 && !roles.includes(sessionRole)) {
      router.replace("/invigilation");
    }
  }, [status, sessionRole, roleKey, router]);

  if (status === "loading") {
    return <div className="p-6 text-sm text-slate-600">Loading dashboard...</div>;
  }

  if (status !== "authenticated") {
    return <div className="p-6 text-sm text-slate-600">Redirecting...</div>;
  }

  const roles = roleKey ? roleKey.split(",") : [];
  if (roles.length > 0 && !roles.includes(sessionRole)) {
    return <div className="p-6 text-sm text-slate-600">Redirecting...</div>;
  }

  const user = profile
    ? { ...session.user, ...profile }
    : {
        ...session.user,
        designation: "",
        institutionName: "",
        phone: "",
      };

  return children(user);
}