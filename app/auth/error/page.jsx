// app/auth/error/page.jsx
"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getErrorMessage = () => {
    switch (error) {
      case "OAuthAccountNotLinked":
        return "This email is already registered with another provider.";
      case "AccessDenied":
        return "You don't have permission to access this account.";
      default:
        return "An authentication error occurred.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="mb-4">{getErrorMessage()}</p>
        <p className="text-gray-600">You will be redirected to the login page in 5 seconds...</p>
      </div>
    </div>
  );
}