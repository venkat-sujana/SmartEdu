'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter();

  // Simple front-end guard: only allow access if admin-auth=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('admin-auth');
      if (isAdmin !== 'true') {
        router.replace('/admin-login');
      }
    }
  }, [router]);

  const gotoLecturer = () => router.push('/lecturer/login');
  const gotoPrincipal = () => router.push('/principal/login');

  return (
    <div className="min-h-screen bg-cyan-50 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold mb-4">🔑 Admin Dashboard</h1>
        <button
          onClick={gotoLecturer}
          className="w-52 bg-blue-600 text-white text-lg py-2 rounded font-semibold transition hover:bg-blue-700 mb-2 cursor-pointer"
        >
          Lecturer Login
        </button>
        <button
          onClick={gotoPrincipal}
          className="w-52 bg-green-700 text-white text-lg py-2 rounded font-semibold transition hover:bg-green-800 cursor-pointer"
        >
          Principal Login
        </button>
      </div>
    </div>
  )
}
