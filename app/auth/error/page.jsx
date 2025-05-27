"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ErrorContent component must be wrapped in Suspense
function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  const errorMessages = {
    "OAuthAccountNotLinked": "Your email is already registered with another provider.",
    "AccessDenied": "You don't have permission to access this account.",
    "Default": error || "An unknown authentication error occurred."
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="mb-4">
          {errorMessages[error] || errorMessages["Default"]}
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        </div>
        <p className="text-gray-600">Redirecting to login page in 5 seconds...</p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading error details...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}