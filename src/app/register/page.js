//src/app/register/page.js
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import {
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

const groups = ['MPC', 'BiPC', 'CEC', 'HEC', 'M&AT', 'MLT', 'CET']
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

const baseInputClass = `w-full rounded-3xl border border-slate-200/50 bg-white/80 px-4 py-3.5 text-sm font-medium text-slate-900 
  backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-[1.01] focus:scale-[1.02] focus:border-cyan-500/70 
  focus:shadow-xl focus:ring-4 focus:ring-cyan-500/30 focus:ring-offset-0 transition-all duration-300 
  placeholder:text-slate-400`

const emptyForm = {
  name: '',
  fatherName: '',
  mobile: '',
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

export default function RegisterPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [collegeName, setCollegeName] = useState('')

  useEffect(() => {
    if (session?.user?.collegeName) setCollegeName(session.user.collegeName)
  }, [session])

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

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
    form.append('admissionNo', formData.admissionNo)
    form.append('group', formData.group)
    form.append('caste', formData.caste)
    form.append('gender', formData.gender)
    form.append('yearOfStudy', formData.yearOfStudy)
    form.append('admissionYear', formData.admissionYear)
    form.append('dateOfJoining', formData.dateOfJoining)
    form.append('password', formData.password)
    form.append('address', formData.address)
    form.append('collegeId', session.user.collegeId)
    form.append('lecturerId', session.user.id)

    if (photo) form.append('photo', photo)

    try {
      const res = await fetch('/api/students/register', {
        method: 'POST',
        body: form,
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(`Error: ${result.message || result.error || 'Failed to register student'}`)
        return
      }

      toast.success('Student registered successfully')
      const redirectPath = groupDashboardRoutes[formData.group] || '/dashboards'
      setFormData(emptyForm)
      setPhoto(null)
      router.push(redirectPath)
    } catch (err) {
      toast.error('Something went wrong.')
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50/30 p-4 sm:p-6 lg:p-8">
      {/* Enhanced Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/50 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 shadow-lg">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
            <p className="mt-4 text-center text-lg font-black text-slate-800">Registering Student</p>
            <p className="mt-1 text-center text-sm text-slate-600">Please wait while we process the data...</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-6xl">
        {/* Premium Header Card */}
        <div className="mx-auto mb-8 max-w-2xl rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur-md md:p-8 lg:max-w-3xl ring-1 ring-white/50">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-lg">
              <School className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Student Management System</p>
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl lg:text-4xl">Register New Student</h1>
              <p className="mt-1 text-sm font-medium text-slate-600">{collegeName || 'Loading college...'}</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="mx-auto max-w-4xl rounded-3xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-12 ring-1 ring-slate-200/50">
          {/* Header Badge & Title */}
          <div className="mb-10 border-b border-slate-200/50 pb-8">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 px-4 py-2.5 text-sm font-black text-white shadow-lg">
              <PlusCircle className="h-5 w-5" />
              New Student Registration
            </div>
            <h2 className="mt-6 text-3xl font-black text-slate-900 sm:text-4xl">Create Profile</h2>
            <p className="mt-3 text-lg text-slate-600">
              Fill out all required information. Password is optional (uses server default if empty).
            </p>
          </div>

          {/* Form Grid */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
            {/* Personal Info Section */}
            <div className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 p-2 shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  className={baseInputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 p-2 shadow-md">
                    <Pencil className="h-5 w-5 text-white" />
                  </div>
                  Father&apos;s Name *
                </label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father&apos;s name"
                  className={baseInputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-indigo-400 to-purple-500 p-2 shadow-md">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  Mobile Number *
                </label>
                <input
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className={baseInputClass}
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 p-2 shadow-md">
                    <IdCard className="h-5 w-5 text-white" />
                  </div>
                  Admission Number *
                </label>
                <input
                  name="admissionNo"
                  value={formData.admissionNo}
                  onChange={handleChange}
                  placeholder="e.g., 24MPC018"
                  className={baseInputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-purple-400 to-violet-500 p-2 shadow-md">
                    <Users2 className="h-5 w-5 text-white" />
                  </div>
                  Group *
                </label>
                <select name="group" value={formData.group} onChange={handleChange} className={baseInputClass} required>
                  <option value="">Select Academic Group</option>
                  {groups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 p-2 shadow-md">
                    <IdCard className="h-5 w-5 text-white" />
                  </div>
                  Caste *
                </label>
                <select name="caste" value={formData.caste} onChange={handleChange} className={baseInputClass} required>
                  <option value="">Select Caste Category</option>
                  {castes.map(caste => (
                    <option key={caste} value={caste}>{caste}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Academic Info */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="mb-2 text-xl font-black text-slate-900">Academic Details</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                    <div className="rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 p-2 shadow-md">
                      <Users2 className="h-5 w-5 text-white" />
                    </div>
                    Gender *
                  </label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={baseInputClass} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                    <div className="rounded-xl bg-gradient-to-r from-green-400 to-teal-500 p-2 shadow-md">
                      <CalendarCheck2 className="h-5 w-5 text-white" />
                    </div>
                    Year of Study *
                  </label>
                  <select name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} className={baseInputClass} required>
                    <option value="">Select Year</option>
                    <option value="First Year">First Year</option>
                    <option value="Second Year">Second Year</option>
                  </select>
                </div>

                <div>
                  <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                    <div className="rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 p-2 shadow-md">
                      <CalendarCheck2 className="h-5 w-5 text-white" />
                    </div>
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
                    className={baseInputClass}
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                    <div className="rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 p-2 shadow-md">
                      <CalendarCheck2 className="h-5 w-5 text-white" />
                    </div>
                    Date of Joining *
                  </label>
                  <input
                    type="date"
                    name="dateOfJoining"
                    value={formData.dateOfJoining}
                    onChange={handleChange}
                    className={baseInputClass}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 p-2 shadow-md">
                    <KeyRound className="h-5 w-5 text-white" />
                  </div>
                  Password (Optional)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave empty for server default password"
                  className={baseInputClass}
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-red-400 to-rose-500 p-2 shadow-md">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  Complete Address *
                </label>
                <textarea
                  name="address"
                  rows={4}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete residential address"
                  className={`${baseInputClass} min-h-[120px] resize-vertical`}
                  required
                />
              </div>

              <div>
                <label className="mb-3 flex items-center gap-3 text-sm font-black text-slate-800">
                  <div className="rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 p-2 shadow-md">
                    <ImageUp className="h-5 w-5 text-white" />
                  </div>
                  Profile Photo (Optional)
                </label>
                <div className="group">
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={e => setPhoto(e.target.files?.[0] || null)}
                    className="block w-full cursor-pointer rounded-3xl border-2 border-dashed border-slate-200/50 bg-gradient-to-r from-slate-50 to-indigo-50/30 
                      px-6 py-8 text-sm font-medium text-slate-700 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-cyan-400/50 
                      hover:bg-gradient-to-r hover:from-cyan-50 hover:to-emerald-50/50 focus:shadow-xl focus:border-cyan-500/70 
                      transition-all duration-300 file:hidden file:mr-4 file:py-2.5 file:px-4 file:rounded-2xl file:border-0 
                      file:bg-gradient-to-r file:from-cyan-500 file:to-emerald-500 file:text-sm file:font-black file:text-white 
                      file:shadow-lg file:hover:brightness-105 file:hover:scale-105"
                  />
                  <label htmlFor="photo" className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center p-4 transition-all group-hover:scale-105">
                      <ImageUp className="h-8 w-8 text-slate-400 group-hover:text-cyan-600" />
                      <p className="mt-2 text-sm font-medium text-slate-600 group-hover:text-slate-800">
                        Click to upload student photo
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-3 rounded-3xl bg-gradient-to-r 
                  from-cyan-600 via-blue-600 to-emerald-600 px-8 py-5 text-lg font-black text-white shadow-2xl 
                  transition-all duration-300 hover:from-cyan-700 hover:via-blue-700 hover:to-emerald-700 
                  hover:shadow-3xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed 
                  disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:scale-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Registering Student...
                  </>
                ) : (
                  <>
                    <FileInput className="h-5 w-5" />
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
