// app/components/active-lecturers-card/page.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ActiveLecturersCard({ title = 'Active Lecturers' }) {
  const { data: session } = useSession()
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

useEffect(() => {
  if (!session?.user?.collegeId) return
  console.log("Session College ID:", session.user.collegeId)

  const fetchLecturers = async () => {
    console.log("Fetching lecturers...")
    try {
      const res = await fetch(`/api/lecturers/active?collegeId=${session.user.collegeId}`)
      console.log("Fetched response:", res)
      const data = await res.json()
      console.log("Fetched lecturers data:", data)
      setLecturers(data)
    } catch (err) {
      console.error("Error fetching lecturers:", err)
      setError(err.message)
    } finally {
      console.log("Finished fetching lecturers.")
      setLoading(false)
    }
  }

  fetchLecturers()
}, [session])


  if (loading) return <div className="rounded bg-white p-4 shadow">Loading...</div>
  if (error) return <div className="rounded bg-white p-4 text-red-600 shadow">Error: {error}</div>
  if (!lecturers.length) return <div className="rounded bg-white p-4 shadow">No lecturers currently logged in.</div>

  return (
    <div className="max-w-xs rounded-lg bg-blue-100 p-4 shadow-md border border-blue-200">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <ul className="max-h-60 list-inside list-disc overflow-y-auto">
        {lecturers.map((lecturer, idx) => (
          <li key={idx}>
            {lecturer.name} - <span className="italic">{lecturer.subject}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
