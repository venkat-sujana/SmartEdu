
//app/components/active-lecturers-card/page.jsx
import React from 'react'

export default function ActiveLecturersCard({
  lecturers = [],
  loading = false,
  error = null,
  title = 'Active Lecturers',
}) {
  if (loading) return <div className="rounded bg-white p-4 shadow">Loading...</div>
  if (error)
    return <div className="rounded bg-white p-4 text-red-600 shadow">Error loading lecturers.</div>
  if (!lecturers.length)
    return <div className="rounded bg-white p-4 shadow">No lecturers currently logged in.</div>

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
