'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Building2, Briefcase, CreditCard, Mail, Phone, ShieldCheck, User } from 'lucide-react'
import SpinnerDots from '@/components/SpinnerDots'

const DESIGNATION_OPTIONS = [
  'Senior Assistant',
  'Record Assistant',
  'Office Superintendent',
  'Junior Assistant',
  'Data Entry Operator',
  'Office Subordinate',
]

const initialForm = {
  employeeId: '',
  name: '',
  email: '',
  password: '',
  designation: '',
  mobile: '',
  collegeId: '',
  photo: '',
}

export default function OfficeRegistrationPage() {
  const [form, setForm] = useState(initialForm)
  const [colleges, setColleges] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/colleges')
        const data = await response.json()
        setColleges(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        console.error('Failed to load colleges:', fetchError)
        setError('Unable to load colleges right now.')
      }
    }

    fetchColleges()
  }, [])

  const handleChange = event => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = event => {
    const file = event.target.files?.[0] || null
    setPhotoFile(file)
    setPhotoPreview(file ? URL.createObjectURL(file) : '')
  }

  const uploadToCloudinary = async file => {
    const payload = new FormData()
    payload.append('file', file)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.message || 'Photo upload failed.')
    }

    return data.url
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let photoUrl = form.photo

      if (photoFile) {
        setPhotoUploading(true)
        photoUrl = await uploadToCloudinary(photoFile)
      }

      const response = await fetch('/api/register/office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase(),
          photo: photoUrl,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Office registration failed.')
      }

      window.location.href = '/office/login'
      setForm(initialForm)
      setPhotoFile(null)
      setPhotoPreview('')
    } catch (submitError) {
      console.error(submitError)
      setError(submitError.message || 'Office registration failed.')
    } finally {
      setPhotoUploading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_28%),linear-gradient(135deg,#082f49_0%,#0f172a_40%,#111827_100%)] px-4 py-10 sm:px-6 lg:px-8">
      {isSubmitting && <SpinnerDots />}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-20 h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute bottom-10 right-[10%] h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 shadow-[0_28px_100px_-40px_rgba(34,211,238,0.45)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden bg-slate-950/35 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-100 uppercase">
              OSRA Office Portal
            </p>
            <h1 className="mt-4 max-w-md text-4xl font-black tracking-tight">
              Create an office staff account for daily campus operations.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-200">
              Register office staff credentials for attendance follow-up, student record
              coordination, and dashboard access.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              'Role-based office dashboard access',
              'Secure login with employee identity',
              'College-linked administrative registration',
            ].map(item => (
              <div
                key={item}
                className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 text-sm text-slate-100"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/94 p-6 sm:p-8 lg:p-10">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-cyan-700 shadow-sm">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Office Registration
                </p>
                <h2 className="mt-1 text-3xl font-black text-slate-950">
                  Create office account
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Fill in the office staff details below to create a new office login.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CreditCard className="h-4 w-4 text-cyan-700" />
                  Employee ID
                </span>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="OFF-001"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4 text-cyan-700" />
                  Full Name
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail className="h-4 w-4 text-cyan-700" />
                  Email Address
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="office@college.edu"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  Password
                </span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Briefcase className="h-4 w-4 text-cyan-700" />
                  Designation
                </span>
                <select
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                >
                  <option value="">Select designation</option>
                  {DESIGNATION_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone className="h-4 w-4 text-cyan-700" />
                  Mobile Number
                </span>
                <input
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Building2 className="h-4 w-4 text-cyan-700" />
                  College
                </span>
                <select
                  name="collegeId"
                  value={form.collegeId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                  required
                >
                  <option value="">Select college</option>
                  {colleges.map(college => (
                    <option key={college._id} value={college._id}>
                      {college.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4 text-cyan-700" />
                  Photo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-700 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-100 file:px-4 file:py-2 file:font-medium file:text-cyan-700 hover:file:bg-cyan-200"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {photoUploading
                    ? 'Uploading photo...'
                    : 'Optional. Selected image will be uploaded securely during registration.'}
                </p>
              </label>

              {photoPreview && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <Image
                      src={photoPreview}
                      alt="Office preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-2xl object-cover"
                      unoptimized
                    />
                    <div>
                      <p className="font-semibold text-slate-900">Photo preview</p>
                      <p className="text-sm text-slate-500">
                        Profile image will be used on the office dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={isSubmitting || photoUploading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-cyan-600 to-sky-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-cyan-200/60 transition hover:from-cyan-500 hover:to-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Register Office Staff'}
                </button>
              </div>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Already have an office account?{' '}
              <Link href="/office/login" className="font-semibold text-cyan-700 hover:underline">
                Login here
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
