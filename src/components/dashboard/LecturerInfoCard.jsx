//src/components/dashboard/LecturerInfoCard.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  AcademicCapIcon,
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

  return (
  <motion.section
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
  >
    <div className={`bg-linear-to-r ${theme.header} p-2 text-white`}>
      <div className="flex items-center gap-4">
        {/* Photo + Upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
            {profile?.photo ? (
              <Image
                src={profile.photo}
                alt={profile?.name || 'Lecturer'}
                className="h-full w-full object-cover"
                width={64}
                height={64}
              />
            ) : (
              <UserCircleIcon className="h-12 w-12 text-white" />
            )}
          </div>
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
  </motion.section>
)
}
