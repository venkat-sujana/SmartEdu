//src/app/register/page.js
'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Users2,
  FileInput,
  KeyRound,
  Phone,
  User,
  Pencil,
  MapPin,
  CalendarCheck2,
  IdCard,
  PlusCircle,
  School,
  ImageUp,
  Loader2,
} from 'lucide-react'
import { DEFAULT_COLLEGE_GROUPS } from '@/utils/collegeGroups'

const groupDashboardRoutes = {
  MPC: '/dashboards/mpc',
  BiPC: '/dashboards/bipc',
  BIPC: '/dashboards/bipc',
  CEC: '/dashboards/cec',
  HEC: '/dashboards/hec',
  'M&AT': '/dashboards/mandat',
  MLT: '/dashboards/mlt',
  CET: '/dashboards/cet',
}
const castes = [
  'OC',
  'OBC',
  'BC-A',
  'BC-B',
  'BC-C',
  'BC-D',
  'BC-E',
  'SC',
  'SC-A',
  'SC-B',
  'SC-C',
  'ST',
  'OTHER',
]

const modernInputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/15'

function SectionHeader({ icon: Icon, iconClassName, title, description }) {
  return (
    <div className="mb-3 flex items-start gap-2.5">
      <div className={['rounded-xl p-2 shadow-sm', iconClassName].join(' ')}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
    </div>
  )
}

function FieldLabel({ icon: Icon, iconClassName, children }) {
  return (
    <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <span className={['rounded-lg p-1.5 shadow-sm', iconClassName].join(' ')}>
        <Icon className="h-3.5 w-3.5 text-white" />
      </span>
      <span>{children}</span>
    </label>
  )
}

const emptyForm = {
  name: '',
  fatherName: '',
  mobile: '',
  parentMobile: '',
  admissionNo: '',
  group: '',
  caste: '',
  gender: '',
  yearOfStudy: '',
  admissionYear: '',
  dateOfJoining: '',
  password: '',
  address: '',
}

async function parseResponseBody(res) {
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()

  if (!text) {
    return {}
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(text)
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      message: res.ok
        ? 'Unexpected non-JSON response from server.'
        : 'Server returned an unexpected response. Check the API route or auth redirect.',
    }
  }
}

export default function RegisterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formData, setFormData] = useState(emptyForm)
  const [collegeName, setCollegeName] = useState('')
  const [availableGroups, setAvailableGroups] = useState(DEFAULT_COLLEGE_GROUPS)
  const returnUrl = searchParams.get('returnUrl')
  const requestedGroup = searchParams.get('group') || ''

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName)
  }, [session])

  useEffect(() => {
    if (!requestedGroup) return
    setFormData(prev => ({
      ...prev,
      group: prev.group || requestedGroup,
    }))
  }, [requestedGroup])

  useEffect(() => {
    const fetchCollegeGroups = async () => {
      if (!session?.user?.collegeId) return

      try {
        const res = await fetch(`/api/colleges/${session.user.collegeId}`)
        const data = await parseResponseBody(res)

        if (!res.ok) {
          throw new Error(data.error || data.message || 'Failed to fetch college groups')
        }

        if (Array.isArray(data?.groups) && data.groups.length) {
          setAvailableGroups(data.groups)
        } else {
          setAvailableGroups(DEFAULT_COLLEGE_GROUPS)
        }
      } catch (error) {
        console.error('Failed to fetch college groups:', error)
        setAvailableGroups(DEFAULT_COLLEGE_GROUPS)
      }
    }

    fetchCollegeGroups()
  }, [session?.user?.collegeId])

  const currentYear = useMemo(() => new Date().getFullYear(), [])
  const isSecondYear = formData.yearOfStudy === 'Second Year'
  const derivedSecondYearJoiningDate = useMemo(() => {
    const year = Number(formData.admissionYear)

    if (!Number.isInteger(year) || year < 2000) {
      return ''
    }

    return `${year}-06-01`
  }, [formData.admissionYear])

  const effectiveDateOfJoining = isSecondYear
    ? derivedSecondYearJoiningDate
    : formData.dateOfJoining

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const uploadPhoto = async file => {
    const payload = new FormData()
    payload.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    })

    const result = await parseResponseBody(res)
    if (!res.ok) {
      throw new Error(result.message || 'Photo upload failed')
    }

    return result.url
  }

  useEffect(() => {
    if (!photo) {
      setPhotoPreview('')
      return
    }

    const previewUrl = URL.createObjectURL(photo)
    setPhotoPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [photo])

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    if (!session?.user?.collegeId) {
      toast.error('Session expired. Please login again.')
      setIsLoading(false)
      return
    }

    const form = new FormData()
    form.append('name', formData.name)
    form.append('fatherName', formData.fatherName)
    form.append('mobile', formData.mobile)
    form.append('parentMobile', formData.parentMobile)
    form.append('admissionNo', formData.admissionNo)
    form.append('group', formData.group)
    form.append('caste', formData.caste)
    form.append('gender', formData.gender)
    form.append('yearOfStudy', formData.yearOfStudy)
    form.append('admissionYear', formData.admissionYear)
    form.append('dateOfJoining', effectiveDateOfJoining)
    form.append('password', formData.password)
    form.append('address', formData.address)
    form.append('collegeId', session.user.collegeId)
    form.append('lecturerId', session.user.id)

    try {
      if (photo) {
        const toastId = toast.loading('Uploading photo...')
        try {
          const photoUrl = await uploadPhoto(photo)
          form.append('photoUrl', photoUrl)
          toast.success('Photo uploaded successfully', { id: toastId })
        } catch (error) {
          toast.error(error.message || 'Photo upload failed', { id: toastId })
          return
        }
      }

      const res = await fetch('/api/students/register', {
        method: 'POST',
        body: form,
      })

      const result = await parseResponseBody(res)

      if (!res.ok) {
        toast.error(`Error: ${result.message || result.error || 'Failed to register student'}`)
        return
      }

      toast.success('Student registered successfully')
      const redirectPath = returnUrl || groupDashboardRoutes[formData.group] || '/dashboards'
      setFormData(emptyForm)
      setPhoto(null)
      setPhotoPreview('')
      router.push(redirectPath)
    } catch (err) {
      toast.error('Something went wrong.')
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[radial-linear(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-linear(180deg,#f8fafc_0%,#eef6ff_52%,#f8fafc_100%)] p-2 sm:p-4 lg:p-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in w-full max-w-sm rounded-2xl bg-white/95 p-6 shadow-2xl ring-1 ring-white/50 backdrop-blur-xl duration-300">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-r from-cyan-500 to-emerald-500 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
            <p className="mt-3 text-center text-base font-bold text-slate-800">
              Registering Student
            </p>
            <p className="mt-1 text-center text-xs text-slate-600">
              Please wait while we process the data...
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md sm:max-w-3xl lg:max-w-6xl">
        {/* Header Card */}
        <div className="mx-auto mb-3 max-w-5xl rounded-2xl border border-white/70 bg-white/90 p-3 shadow-md ring-1 ring-slate-200/60 backdrop-blur md:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="mb-0.5 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                  Student Admission Form
                </p>
                <p className="mt-1 text-sm font-semibold text-cyan-700">
                  {collegeName || 'Loading college...'}
                </p>
              </div>
            </div>
          </div>

          {returnUrl ? (
            <div className="mt-2 border-t border-slate-200 pt-2">
              <Link
                href={returnUrl}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          ) : null}
        </div>

        {/* Main Form Card */}
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/70 bg-white/92 p-3 shadow-xl ring-1 ring-slate-200/60 backdrop-blur-xl sm:p-4">
          {/* Title */}
          <div className="mb-3 border-b border-slate-200 pb-2">
            <h2 className="text-lg font-black text-slate-900 sm:text-xl">
              New Student Admission Form-2026-2027
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Info Section */}
            <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-cyan-400 to-blue-100 p-3 md:p-4">
              <SectionHeader
                icon={User}
                iconClassName="bg-gradient-to-br from-cyan-500 to-blue-600"
                title="Personal Details"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                     Full Name *
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={modernInputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Father&apos;s Name *
                  </label>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Enter father's name"
                    className={modernInputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Mobile Number *
                  </label>
                  <input
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={modernInputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Parent Mobile Number *
                  </label>
                  <input
                    name="parentMobile"
                    type="tel"
                    value={formData.parentMobile}
                    onChange={handleChange}
                    placeholder="10-digit parent mobile number"
                    className={modernInputClass}
                    required
                  />
                </div>
              </div>
            </section>


            {/* Academic Info */}
            <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-amber-200 to-orange-300 p-3 md:p-4">
              <SectionHeader
                icon={CalendarCheck2}
                iconClassName="bg-gradient-to-br from-emerald-500 to-teal-500"
                title="Academic Details"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">

               <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Year of Study *
                  </label>
                  <select
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className={modernInputClass}
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                  </select>
                </div>



                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={modernInputClass}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Admission Year *
                  </label>
                  <input
                    type="number"
                    name="admissionYear"
                    min="2000"
                    max={currentYear + 1}
                    value={formData.admissionYear}
                    onChange={handleChange}
                    placeholder="YYYY"
                    className={modernInputClass}
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={effectiveDateOfJoining}
                    onChange={handleChange}
                    disabled={isSecondYear}
                    className={`${modernInputClass} ${isSecondYear ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
                    required={!isSecondYear}
                  />
                  {isSecondYear ? (
                    <p className="mt-1.5 text-xs font-medium text-slate-500">
                      Date of joining is auto-set from admission year for second-year students.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>


            {/* Admission Details */}
            <section className="rounded-2xl border border-slate-200 bg-linear-to-br from-rose-100 to-red-200 p-3 md:p-4">
              <SectionHeader
                icon={IdCard}
                iconClassName="bg-gradient-to-br from-amber-500 to-orange-500"
                title="Admission Details"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Admission Number *
                  </label>
                  <input
                    name="admissionNo"
                    value={formData.admissionNo}
                    onChange={handleChange}
                    placeholder="e.g., 24MPC018"
                    disabled={isSecondYear}
                    className={`${modernInputClass} ${isSecondYear ? 'cursor-not-allowed bg-slate-100 text-slate-500' : ''}`}
                    required={!isSecondYear}
                  />
                  {isSecondYear ? (
                    <p className="mt-1.5 text-xs font-medium text-slate-500">
                      Admission number is disabled for second-year students.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Group *
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleChange}
                    className={modernInputClass}
                    required
                  >
                    <option value="">Select Academic Group</option>
                    {availableGroups.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Caste *
                  </label>
                  <select
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    className={modernInputClass}
                    required
                  >
                    <option value="">Select Caste Category</option>
                    {castes.map(caste => (
                      <option key={caste} value={caste}>
                        {caste}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            
            {/* Address & Photo */}
            <section className="rounded-2xl border border-slate-200     bg-linear-to-br from-green-300 to-blue-200 p-3 md:p-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter complete residential address"
                    className={`${modernInputClass} resize-vertical min-h-[90px]`}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Profile Photo (Optional)
                  </label>
                  <div className="group">
                    <input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={e => setPhoto(e.target.files?.[0] || null)}
                      className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 file:hidden hover:border-cyan-400 hover:bg-cyan-50/50 hover:shadow-md"
                    />
                    <label htmlFor="photo" className="cursor-pointer">
                      <div className="flex flex-col items-center justify-center p-2 transition-all group-hover:scale-[1.02]">
                        <ImageUp className="h-6 w-6 text-slate-400 group-hover:text-cyan-600" />
                        <p className="mt-1.5 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                          Click to upload student photo
                        </p>
                        <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                  </div>
                  {photoPreview && (
                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <Image
                        src={photoPreview}
                        alt="Student preview"
                        width={72}
                        height={72}
                        className="h-18 w-18 rounded-xl object-cover shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {photo?.name}
                        </p>
                        <p className="text-xs text-slate-500">Preview ready for upload</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-linear-to-r from-cyan-600 via-blue-600 to-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:from-cyan-700 hover:via-blue-700 hover:to-emerald-700 hover:shadow-xl active:scale-[0.99] disabled:scale-100 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Registering Student...
                  </>
                ) : (
                  <>
                    <FileInput className="h-4 w-4" />
                    Register Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}