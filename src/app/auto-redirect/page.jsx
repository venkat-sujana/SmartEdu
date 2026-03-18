"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AutoRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.push("/student/login");
      return;
    }

    const role = session.user.role;
    if (role === "admin") router.push("/admin-panel");
    else if (role === "lecturer") router.push("/lecturer/dashboard");
    else if (role === "student") router.push("/student/dashboard");
    else if (role === "principal") router.push("/principal/dashboard");
    else router.push("/student/login");
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg text-gray-600">Redirecting...</p>
    </div>
  );
}
