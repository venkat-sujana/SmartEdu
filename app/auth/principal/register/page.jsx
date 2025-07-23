"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PrincipalRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
   
    role: "principal",
    photo: null,
    collegeId: ""
  })

  const [error, setError] = useState("")
  const router = useRouter()

  const handleChange = (e) => {
    if (e.target.name === "photo") {
      setForm({ ...form, photo: e.target.files[0] })
    } else {
      setForm({ ...form, [e.target.name]: e.target.value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value)
    })

    const res = await fetch("/api/register/lecturer", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const { message } = await res.json()
      setError(message || "Registration failed")
      return
    }

    router.push("/auth/lecturer/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4" encType="multipart/form-data">
        <h2 className="text-2xl font-bold text-center">Principal Registration</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input type="text" name="name" placeholder="Name" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="email" name="email" placeholder="Email" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="password" name="password" placeholder="Password" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="text" name="collegeId" placeholder="College ID" className="w-full px-4 py-2 border rounded"
          onChange={handleChange} required />

        <input type="file" name="photo" accept="image/*" className="w-full" onChange={handleChange} required />

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  )
}
