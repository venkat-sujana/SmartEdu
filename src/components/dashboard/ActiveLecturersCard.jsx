//src/components/dashboard/ActiveLecturersCard.jsx

'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  CircleAlert,
  LoaderCircle,
  UsersRound,
} from 'lucide-react'
import Link from 'next/link'

export default function ActiveLecturersCard({
  title = 'Active Lecturers',
}) {
  const { data: session } = useSession()

  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user?.collegeId) {
      setLoading(false)
      return
    }

    const controller = new AbortController()

    const fetchLecturers = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(
          `/api/lecturers/active?collegeId=${encodeURIComponent(session.user.collegeId)}`,
          { signal: controller.signal }
        )

        const data = await res.json()

        if (!res.ok) {
          throw new Error(
            data?.message || 'Failed to fetch active lecturers'
          )
        }

        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : []

        setLecturers(list)
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') return

        console.error('Active lecturers fetch error:', fetchError)
        setError(fetchError.message || 'Something went wrong')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchLecturers()

    return () => controller.abort()
  }, [session?.user?.collegeId])

  const displayLecturers = lecturers.slice(0, 5)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Compact Header */}
      <div className="bg-linear-to-r from-sky-700 via-blue-700 to-indigo-700 px-3 py-2 text-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <UsersRound className="h-4 w-4 shrink-0 text-white/90" />

            <h3 className="truncate text-sm font-bold sm:text-base">
              {title === 'Active Lecturers'
                ? 'Currently Active Lecturers'
                : title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-lg bg-white/10 px-2 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wide text-white/80">
              Online
            </span>

            <span className="text-base font-black leading-none">
              {lecturers.length}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Content */}
      <div className="space-y-2 p-2 sm:p-3">

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-5 text-xs font-medium text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading active lecturers...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-3">
            <CircleAlert className="h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-xs font-semibold text-rose-700">
              {error}
            </p>
          </div>
        ) : lecturers.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-4">
            <UsersRound className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-xs font-medium text-slate-600">
              No lecturers currently logged in
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayLecturers.map((lecturer, index) => (
              <article
                key={`${lecturer._id || lecturer.email || lecturer.name}-${index}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-white px-2 py-1.5 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Lecturer Icon */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <UsersRound className="h-4 w-4" />

                    <span className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  {/* Lecturer Details */}
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-semibold leading-tight text-slate-900 sm:text-sm">
                      {lecturer.name || 'Unnamed Lecturer'}
                    </h4>

                    <p className="mt-1 truncate text-[10px] leading-tight text-violet-700">
                      {lecturer.subject || 'Not Assigned'}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Active
                </span>
              </article>
            ))}
          </div>
        )}

        {/* View All */}
        {!loading && !error && lecturers.length > 5 && (
          <div className="border-t border-slate-100 pt-2 text-center">
            <Link
              href="/principal/faculty"
              className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
            >
              View All Faculty →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

