"use client";
import { useSession, signOut } from "next-auth/react";

export default function LogoutButton() {
  const { data: session } = useSession();

  if (!session) return null; // session loading

  const role = session?.user?.role;

  const logout = () => {
    if (role === "principal") {
      signOut({ callbackUrl: "/principal/login" });
    } else if (role === "lecturer") {
      signOut({ callbackUrl: "/lecturer-login" });
    } else {
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <button
      onClick={logout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Logout
    </button>
  );
}
