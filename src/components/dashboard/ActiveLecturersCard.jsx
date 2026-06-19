//src/components/dashboard/ActiveLecturersCard.jsx
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { BookOpen, CircleAlert, LoaderCircle, UsersRound } from 'lucide-react'
import Link from 'next/link'
export default function ActiveLecturersCard({ title = 'Active Lecturers' }) {
  const { data: session } = useSession()
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.user?.collegeId) return

    const fetchLecturers = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`/api/lecturers/active?collegeId=${session.user.collegeId}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.message || 'Failed to fetch active lecturers')
        }

        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
        setLecturers(list)
      } catch (fetchError) {
        console.error('Active lecturers fetch error:', fetchError)
        setError(fetchError.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchLecturers()
  }, [session])

  const displayLecturers = lecturers.slice(0, 5)

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-linear-to-r from-sky-700 via-blue-700 to-indigo-700 px-2 py-2 text-white">
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-violet-700 px-5 py-2 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mt-1 text-lg font-bold">Currently Active Lecturers</h3>
            </div>

            <div className="rounded-xl bg-white/10 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-[10px] text-white/70 uppercase">Online</p>

              <p className="text-xl font-bold">{lecturers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-slate-50 px-4 py-12 text-sm font-medium text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading active lecturers...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-10 text-center">
            <CircleAlert className="mx-auto h-6 w-6 text-rose-600" />
            <p className="mt-3 text-sm font-semibold text-rose-700">{error}</p>
          </div>
        ) : lecturers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
            <UsersRound className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No lecturers currently logged in
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayLecturers.map((lecturer, index) => (
              <article
                key={`${lecturer._id || lecturer.email || lecturer.name}-${index}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <UsersRound className="h-5 w-5" />
                    </div>

                    <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-slate-900">{lecturer.name}</h4>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">
                        {lecturer.subject || 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Active
                </span>
              </article>
            ))}
          </div>
        )}

        {lecturers.length > 5 && (
          <div className="border-t border-slate-100 pt-3 text-center">
            <Link
              href="/principal/faculty"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View All Faculty →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
