// app/components/active-lecturers-card/page.jsx
"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { UserIcon, BookOpenIcon } from '@heroicons/react/24/solid'

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
    <div className="max-w-xs rounded-lg bg-blue-100 p-4 shadow-xl border border-lg border-blue-200">
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <ol className="max-h-60 list-decimal list-outside overflow-y-auto pl-4">
        {lecturers.map((lecturer, idx) => (
          <li key={idx} className="mb-2">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="font-medium">{lecturer.name}</span>
              <BookOpenIcon className="h-4 w-4 text-purple-600 mx-1 flex-shrink-0" />
              <span className="italic text-gray-700">{lecturer.subject}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
