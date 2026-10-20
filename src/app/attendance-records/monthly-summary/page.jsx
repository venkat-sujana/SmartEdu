
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import GroupAttendanceSummary from '@/components/attendance/GroupAttendanceSummary'

const groupOptions = ['MPC', 'BiPC', 'CEC', 'HEC', 'MLT', 'CET', 'M&AT']
const yearOptions = ['First Year', 'Second Year']

export default function MonthlySummaryPage() {
  const [userRole, setUserRole] = useState('')
  const [mappedGroups, setMappedGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [mappingLoaded, setMappingLoaded] = useState(false)
  const [mappingError, setMappingError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadGroups() {
      try {
        setMappingError('')

        const sessionRes = await fetch('/api/auth/session', {
          cache: 'no-store',
        })

        if (!sessionRes.ok) {
          throw new Error('Unable to load login session.')
        }

        const sessionData = await sessionRes.json()
        const role = sessionData?.user?.role || ''

        if (cancelled) return

        setUserRole(role)

        if (role !== 'lecturer') {
          setMappedGroups(groupOptions)
          setSelectedGroup(groupOptions[0])
          return
        }

        const mappingRes = await fetch('/api/lecturer/group-mapping', {
          cache: 'no-store',
        })

        const mappingData = await mappingRes.json()

        if (
          !mappingRes.ok ||
          !mappingData?.success ||
          !Array.isArray(mappingData.groups)
        ) {
          throw new Error('Unable to load lecturer group mapping.')
        }

        if (cancelled) return

        const groups = mappingData.groups.filter(group =>
          groupOptions.includes(group)
        )

        setMappedGroups(groups)
        setSelectedGroup(current =>
          groups.includes(current) ? current : (groups[0] || '')
        )
      } catch (error) {
        if (!cancelled) {
          console.error('Monthly Attendance mapping error:', error)
          setMappedGroups([])
          setSelectedGroup('')
          setMappingError(error.message || 'Unable to load groups.')
        }
      } finally {
        if (!cancelled) {
          setMappingLoaded(true)
        }
      }
    }

    loadGroups()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-4 sm:px-5">
      <div className="mx-auto w-full max-w-7xl space-y-4">

        <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lecturer Dashboard
            </p>
            <h1 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
              Monthly Attendance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Student-wise attendance register
            </p>
          </div>

          <Link
            href="/lecturer/dashboard"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </header>

        <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Users className="h-5 w-5" />
            Select Group
          </div>

          <select
            value={selectedGroup}
            onChange={event => setSelectedGroup(event.target.value)}
            disabled={!mappingLoaded || mappedGroups.length === 0}
            className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100 sm:w-64"
          >
            {!mappingLoaded && <option value="">Loading groups...</option>}

            {mappingLoaded && mappedGroups.length === 0 && (
              <option value="">No mapped groups</option>
            )}

            {mappedGroups.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>

          {userRole === 'lecturer' && (
            <p className="text-xs text-slate-500">
              Only your mapped groups are available.
            </p>
          )}
        </section>

        {mappingError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            {mappingError}
          </div>
        )}

        {!mappingLoaded ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Loading lecturer groups...
          </div>
        ) : mappedGroups.length === 0 ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            {userRole === 'lecturer'
              ? 'No groups are mapped to this lecturer. Please check the lecturer group mapping.'
              : 'Unable to load groups. Please refresh the page or sign in again.'}
          </div>
        ) : (
          <div className="space-y-5">
            {yearOptions.map(year => (
              <section
                key={`${selectedGroup}-${year}`}
                className="space-y-3"
              >
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedGroup} — {year}
                  </h2>
                </div>

                <GroupAttendanceSummary
                  key={`${selectedGroup}-${year}`}
                  group={selectedGroup}
                  yearOfStudy={year}
                />
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
