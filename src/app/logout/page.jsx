'use client';
export default function LogoutSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Logged Out 👋</h1>
      <p className="text-gray-700">You have been successfully logged out.</p>
    </div>
  )
}

export const metadata = {
  title: "OSRA",
  description: "Online Student Record and Attendance Application",

  manifest: "/manifest.json",

  icons: {
    icon: "/favicon.ico",
    apple: "/images/osra-6.png",
  },
};
