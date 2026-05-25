//src/app/invigilation/admin/lecturers/page.jsx
'use client'
import { useState } from 'react'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'

import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

export default function LecturersPage() {
  const [lecturerForm, setLecturerForm] = useState({
    name: '',
    designation: '',
    institutionName: '',
    phone: '',
    password: '',
  })

  
  const onCreateLecturer = async e => {
    e.preventDefault()

    try {
      const res = await fetch('/api/invigilation/lecturers', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify(lecturerForm),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      toast.success(
        `Lecturer added.
Login: ${data.loginId}
Pass: ${data.tempPassword}`
      )

      setLecturerForm({
        name: '',
        designation: '',
        institutionName: '',
        phone: '',
        password: '',
      })

      loadLecturers()
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Lecturer Management">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Lecturer Management</h1>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
