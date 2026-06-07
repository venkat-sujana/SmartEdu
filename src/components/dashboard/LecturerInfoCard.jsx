//src/components/dashboard/LecturerInfoCard.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { getGroupTheme } from '@/components/dashboard/groupTheme'

export default function LecturerInfoCard({ user, groupName }) {
  const theme = getGroupTheme(groupName)
  const { data: session } = useSession()
  const isLecturer = session?.user?.role === 'lecturer'
  const [profile, setProfile] = useState(user || {})
  const [isUploading, setIsUploading] = useState(false)
  const [photoMessage, setPhotoMessage] = useState('')
  const [photoError, setPhotoError] = useState('')

  useEffect(() => {
    setProfile(user || {})
  }, [user])

  useEffect(() => {
    if (!isLecturer) return

    let isMounted = true
    fetch('/api/lecturers/profile')
      .then(res => res.json())
      .then(result => {
        if (!isMounted || !result?.data) return
        setProfile(prev => ({ ...prev, ...result.data }))
      })
      .catch(err => {
        console.error('Failed to load lecturer profile:', err)
      })

    return () => {
      isMounted = false
    }
  }, [isLecturer])

  const infoItems = useMemo(
    () => [
      {
        label: 'Email',
        value: profile?.email || 'lecturer@example.com',
        icon: <EnvelopeIcon className="h-4 w-4" />,
        tone: 'bg-sky-100 text-sky-700',
      },
      {
        label: 'Subject',
        value: profile?.subject || 'Subject',
        icon: <AcademicCapIcon className="h-4 w-4" />,
        tone: 'bg-violet-100 text-violet-700',
      },
      {
        label: 'College',
        value: profile?.collegeName || 'College Name',
        icon: <BuildingOffice2Icon className="h-4 w-4" />,
        tone: 'bg-emerald-100 text-emerald-700',
      },
    ],
    [profile]
  )

  const uploadToCloudinary = async file => {
    const payload = new FormData()
    payload.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    })

    const result = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(result.message || 'Photo upload failed')
    }

    return result.url
  }

  const handlePhotoChange = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploading(true)
    setPhotoMessage('')
    setPhotoError('')

    try {
      const photoUrl = await uploadToCloudinary(file)
      const res = await fetch('/api/lecturers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: photoUrl }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save lecturer photo')
      }

      setProfile(prev => ({ ...prev, ...(result.data || {}), photo: photoUrl }))
      setPhotoMessage('Photo updated successfully')
    } catch (err) {
      console.error(err)
      setPhotoError(err.message || 'Photo upload failed')
    } finally {
      setIsUploading(false)
    }
  }

 return (
  <motion.section
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div className={`bg-linear-to-r ${theme.header} p-4 text-white`}>
      <div className="flex items-center gap-4">
        {/* Photo + Upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
            {profile?.photo ? (
              <img
                src={profile.photo}
                alt={profile?.name || 'Lecturer'}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-white" />
            )}
          </div>

          {isLecturer && (
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-white/20">
              <ArrowUpTrayIcon className="h-3 w-3" />
              {isUploading ? 'Uploading...' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Lecturer Info */}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold">
            {profile?.name || 'Lecturer Name'}
          </h2>

          <p className="mt-1 text-sm text-white/90">
            {profile?.subject || 'Subject'}
          </p>

          <p className="text-xs text-white/70">
            {profile?.collegeName || 'College Name'}
          </p>
        </div>
      </div>
    </div>

    {(photoMessage || photoError) && (
      <div
        className={`m-3 rounded-lg border px-3 py-2 text-sm ${
          photoError
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        {photoError || photoMessage}
      </div>
    )}
  </motion.section>
)
}
