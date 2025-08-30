'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (password === 'admin123') {
      localStorage.setItem('admin-auth', 'true')
      router.push('/admin-dashboard')
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div className=" bg-cyan-100 flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-6">👤&nbsp;Admin Login</h1>
      <input
        type="password"
        placeholder="Enter Admin Password"
        className="border p-2 mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer font-bold">
        Login
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}

    </div>
  )
}
