"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function InvigilationGuard({ allowRoles, children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/invigilation/login");
          return;
        }
        const data = await res.json();
        if (!data?.user || !allowRoles.includes(data.user.role)) {
          router.replace("/invigilation/login");
          return;
        }
        setUser(data.user);
      } catch {
        router.replace("/invigilation/login");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [allowRoles, router]);

  if (loading) {
    return <div className="p-6 text-sm text-slate-600">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="p-6 text-sm text-slate-600">Redirecting...</div>;
  }

  return children(user);
}
