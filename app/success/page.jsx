"use client";

export default function LoginSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-3xl font-bold text-green-700 mb-4">
        Login Successful ✅
      </h1>
      <p className="text-gray-700">Welcome! You have successfully logged in.</p>
    </div>
  );
}
