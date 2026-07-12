//src/app/late-entry/page.jsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

const groupsList = ['MPC', 'BiPC', 'CEC', 'HEC', 'CET', 'M&AT', 'MLT']

function getTodayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export default function LateEntryPage() {
  const { data: session } = useSession()
  const [group, setGroup] = useState('')
  const [yearOfStudy, setYearOfStudy] = useState('')
  const [date, setDate] = useState(getTodayStr())
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [lateTimeMap, setLateTimeMap] = useState({})
  const [message, setMessage] = useState('')

  const collegeName = session?.user?.collegeName || 'College'

  useEffect(() => {
    if (!group || !yearOfStudy || !date) {
      setStudents([])
      setLateTimeMap({})
      return
    }

    setLoading(true)

    fetch(
      `/api/attendance/late?group=${encodeURIComponent(group)}&yearOfStudy=${encodeURIComponent(yearOfStudy)}&date=${date}`
    )
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const nextStudents = data.data || []
          const times = {}

          nextStudents.forEach(student => {
            if (student.lateTime) {
              times[student.studentId] = student.lateTime
            }
          })

          setStudents(nextStudents)
          setLateTimeMap(times)
        } else {
          setStudents([])
          setLateTimeMap({})
        }
      })
      .finally(() => setLoading(false))
  }, [group, yearOfStudy, date])

  async function handleMarkLate(studentId) {
    const lateTime = lateTimeMap[studentId] || ''
    setSavingId(studentId)

    const res = await fetch('/api/attendance/late', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date, lateTime, group, yearOfStudy }),
    })

    const data = await res.json()
    setSavingId(null)

    if (data.status === 'success') {
      const savedLateTime = data.data?.lateTime || lateTime || getCurrentTime()

      setStudents(prev =>
        prev.map(student =>
          student.studentId?.toString() === studentId?.toString()
            ? {
                ...student,
                status: data.data?.status || student.status,
                lateComer: true,
                lateTime: savedLateTime,
              }
            : student
        )
      )

      setLateTimeMap(prev => ({
        ...prev,
        [studentId]: savedLateTime,
      }))
      setMessage('Success: Late marked!')
    } else {
      setMessage(`Error: ${data.message}`)
    }

    setTimeout(() => setMessage(''), 3000)
  }

  async function handlePresentLate(studentId) {
    setSavingId(studentId)

    const res = await fetch('/api/attendance/late', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        date,
        group,
        yearOfStudy,
        session: 'FN',
      }),
    })

    const data = await res.json()
    setSavingId(null)

    if (data.status === 'success') {
      const savedLateTime = data.data?.lateTime || getCurrentTime()

      setStudents(prev =>
        prev.map(student =>
          student.studentId?.toString() === studentId?.toString()
            ? {
                ...student,
                status: data.data?.status || 'Present',
                lateComer: data.data?.lateComer ?? true,
                lateTime: savedLateTime,
              }
            : student
        )
      )

      setLateTimeMap(prev => ({
        ...prev,
        [studentId]: savedLateTime,
      }))
      setMessage('Success: Present + Late marked')
    } else {
      setMessage(`Error: ${data.message}`)
    }

    setTimeout(() => setMessage(''), 3000)
  }

  async function handleUnmark(studentId) {
    setSavingId(studentId)

    const res = await fetch('/api/attendance/late', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, date }),
    })

    const data = await res.json()
    setSavingId(null)

    if (data.status === 'success') {
      setStudents(prev =>
        prev.map(student =>
          student.studentId?.toString() === studentId?.toString()
            ? { ...student, lateComer: false, lateTime: '' }
            : student
        )
      )
      setLateTimeMap(prev => {
        const updated = { ...prev }
        delete updated[studentId]
        return updated
      })
    }

    setTimeout(() => setMessage(''), 3000)
  }

  const lateCount = students.filter(student => student.lateComer).length
  const presentCount = students.filter(student => student.status === 'Present').length
  const pendingLateStudents = students.filter(
    student => student.status !== 'Present' && !student.lateComer
  )
  const lateEntryStudents = students.filter(
    student => student.status !== 'Present' || student.lateComer
  )

  return (
    <div className="mx-auto mt-24 max-w-4xl px-3 pb-10 sm:px-4">
      <div className="mb-4 rounded-3xl border border-slate-200 bg-linear-to-br from-white via-amber-50 to-orange-100 p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
          Late Entry Tracker
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {collegeName}
        </h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Late {lateCount}
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Present {presentCount}
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
            Pending Late Entry {pendingLateStudents.length}
          </span>
        </div>
      </div>

      <div className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select
            value={yearOfStudy}
            onChange={e => setYearOfStudy(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-amber-400 focus:bg-white"
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
          </select>

          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-amber-400 focus:bg-white"
          >
            <option value="">Select Group</option>
            {groupsList.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-amber-400 focus:bg-white"
          />

          <Link href="/attendance-records/attendance-calendar">
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Calendar View
            </button>
          </Link>
        </div>

        {message && (
          <p
            className={`mt-3 text-sm font-semibold ${
              message.startsWith('Success:') ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-500" />
          <p className="mt-3 text-sm font-semibold text-slate-500">Loading...</p>
        </div>
      ) : lateEntryStudents.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-black text-slate-700">
            {group && yearOfStudy
              ? 'No pending late-entry students found'
              : 'Select year and group'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lateEntryStudents.map(student => (
            <div
              key={student.studentId}
              className={`rounded-3xl border p-4 shadow-sm transition ${
                student.lateComer ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {student.photo ? (
                    <Image
                      src={student.photo}
                      alt={student.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-slate-100"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 text-lg font-black text-slate-600">
                      {student.name?.[0] || 'S'}
                    </div>
                  )}

                  <div>
                    <p className="font-black text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">Adm: {student.admissionNo}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      Status: {student.status}
                    </p>
                    {student.lateComer && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        Late {student.lateTime ? `- ${student.lateTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {student.status !== 'Present' && !student.lateComer ? (
                    <button
                      type="button"
                      onClick={() => handlePresentLate(student.studentId)}
                      disabled={savingId === student.studentId}
                      className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === student.studentId ? '...' : 'Present + Late'}
                    </button>
                  ) : !student.lateComer ? (
                    <>
                      <input
                        type="time"
                        value={lateTimeMap[student.studentId] || ''}
                        onChange={e =>
                          setLateTimeMap(prev => ({
                            ...prev,
                            [student.studentId]: e.target.value,
                          }))
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() => handleMarkLate(student.studentId)}
                        className="rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
                      >
                        Mark Late
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnmark(student.studentId)}
                      className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                    >
                      Unmark
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
