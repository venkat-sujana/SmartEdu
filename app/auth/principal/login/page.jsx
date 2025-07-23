"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PrincipalLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await signIn("credentials", {
      email,
      password,
      role:"principal", // Ensure role is set to principal
      redirect: false
    })

    if (res?.error) {
      setError("Invalid credentials")
    } else {
      router.push("/dashboard") // or /lecturer/dashboard
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Lecturer Login</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>
        <p className="text-center text-sm text-gray-500">
          Don't have an account? <a href="/auth/principal/register" className="text-blue-600 hover:underline">Register</a>
        </p>
      </form>
    </div>
  )
}
