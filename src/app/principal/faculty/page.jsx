//src/
'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  UsersRound,
  Search,
  LoaderCircle,
  CircleAlert,
  Mail,
  BookOpen,
} from 'lucide-react'

export default function FacultyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.replace('/login')
      return
    }

    const collegeId = session.user.collegeId

    if (!collegeId) {
      setError('మీ అకౌంట్‌కు College ID అందుబాటులో లేదు.')
      setLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchLecturers() {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `/api/lecturers/active?collegeId=${encodeURIComponent(collegeId)}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('లెక్చరర్ల వివరాలను పొందలేకపోయాం.')
        }

        const data = await response.json()
        setLecturers(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'ఏదో సమస్య ఏర్పడింది.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchLecturers()

    return () => controller.abort()
  }, [session, status, router])

  const filteredLecturers = lecturers.filter((lecturer) => {
    const query = search.trim().toLowerCase()

    return (
      lecturer.name?.toLowerCase().includes(query) ||
      lecturer.subject?.toLowerCase().includes(query)
    )
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 p-3 sm:p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <UsersRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Faculty List
              </h1>
              <p className="text-xs text-slate-500">
                మొత్తం లెక్చరర్లు: {lecturers.length}
              </p>
            </div>
          </div>

          <Link
            href="/principal/dashboard"
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="పేరు లేదా సబ్జెక్ట్‌తో వెతకండి..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white p-10 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            లెక్చరర్ల వివరాలు లోడ్ అవుతున్నాయి...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <CircleAlert className="h-5 w-5 shrink-0" />
            {error}
          </div>
        ) : filteredLecturers.length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center text-sm text-slate-500">
            లెక్చరర్లు ఎవరూ కనబడలేదు.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLecturers.map((lecturer, index) => (
              <article
                key={`${lecturer.name}-${lecturer.subject}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                {lecturer.photo ? (
                  <Image
                    src={lecturer.photo}
                    alt={lecturer.name || 'Lecturer'}
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                    {lecturer.name?.charAt(0)?.toUpperCase() || 'L'}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-slate-900">
                    {lecturer.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-600">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    {lecturer.subject || 'Subject not specified'}
                  </p>

                  {lecturer.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lecturer.email}</span>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
