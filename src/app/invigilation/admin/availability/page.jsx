//src/app/invigilation/admin/availability/page.jsx

'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'
import AvailabilityTab from '../dashboard/AvailabilityTab'

export default function AvailabilityPage() {
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(false)

  // ── Fetch Lecturers ─────────────────────────────
  useEffect(() => {
    const fetchLecturers = async () => {
      setLoading(true)

      try {
        const res = await fetch('/api/invigilation/lecturers', {
          cache: 'no-store',
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message)
        }

        setLecturers(data.data || [])
      } catch (err) {
        toast.error(err.message || 'Failed to load lecturers')
      } finally {
        setLoading(false)
      }
    }

    fetchLecturers()
  }, [])

  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Lecturer Availability">
          <div className="space-y-6 p-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Lecturers Available for Invigilation
              </h1>

              <p className="mt-1 text-sm text-slate-500">Manage lecturer availability</p>
            </div>

            {/* Pass lecturers prop */}
            <AvailabilityTab lecturers={lecturers} loading={loading} />
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
