//app/register/page.js

'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
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
} from 'lucide-react'

const groups = ['MPC', 'BIPC', 'CEC', 'HEC', 'M&AT', 'MLT', 'CET']
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

const baseInputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100'

const emptyForm = {
  name: '',
  fatherName: '',
  mobile: '',
  group: '',
  caste: '',
  dob: '',
  gender: '',
  admissionNo: '',
  yearOfStudy: '',
  admissionYear: '',
  dateOfJoining: '',
  address: '',
  password: '',
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
    form.append('group', formData.group)
    form.append('caste', formData.caste)
    form.append('dob', formData.dob)
    form.append('gender', formData.gender)
    form.append('admissionNo', formData.admissionNo)
    form.append('yearOfStudy', formData.yearOfStudy)
    form.append('admissionYear', formData.admissionYear)
    form.append('dateOfJoining', formData.dateOfJoining)
    form.append('address', formData.address)
    form.append('collegeId', session.user.collegeId)
    form.append('lecturerId', session.user.id)
    form.append('password', formData.password)

    if (photo) form.append('photo', photo)

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        body: form,
      })

      const result = await res.json()

      if (!res.ok) {
        toast.error(`Error: ${result.message || 'Failed to register student'}`)
        return
      }

      toast.success('Student registered successfully')
      setFormData(emptyForm)
      setPhoto(null)
      router.push('/register')
    } catch (err) {
      toast.error('Something went wrong.')
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-white/25 bg-white px-8 py-6 shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-700" />
            <p className="mt-3 text-sm font-semibold text-slate-700">Submitting student data...</p>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        <header className="mb-4 flex items-center justify-between rounded-xl border bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
              <School className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Student Management</p>
              <h1 className="text-lg font-semibold text-slate-900">Register Student</h1>
              <p className="text-sm text-slate-600">{collegeName || 'Loading college...'}</p>
            </div>
          </div>
          <Link
            href="/student-table"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <Users2 className="h-4 w-4" />
            Student Table
          </Link>
        </header>

        <section className="rounded-xl border bg-white p-4 shadow-sm sm:p-6 lg:p-8">
          <div className="mb-6 border-b border-slate-200 pb-5">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold tracking-wide text-cyan-900">
              <PlusCircle className="h-4 w-4" />
              Student Registration
            </p>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Add New Student Profile</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill all required fields. If password is left empty, server default password will be used.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="h-4 w-4 text-cyan-700" />
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student full name"
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IdCard className="h-4 w-4 text-amber-700" />
                Admission Number
              </label>
              <input
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                placeholder="Example: 24MPC018"
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Pencil className="h-4 w-4 text-emerald-700" />
                Father Name
              </label>
              <input
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Enter father name"
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Phone className="h-4 w-4 text-indigo-700" />
                Mobile Number
              </label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit number"
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users2 className="h-4 w-4 text-purple-700" />
                Group
              </label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
                className={baseInputClass}
                required
              >
                <option value="">Select Group</option>
                {groups.map(group => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <IdCard className="h-4 w-4 text-rose-700" />
                Caste
              </label>
              <select
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                className={baseInputClass}
                required
              >
                <option value="">Select Caste</option>
                {castes.map(caste => (
                  <option key={caste} value={caste}>
                    {caste}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarCheck2 className="h-4 w-4 text-violet-700" />
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={baseInputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users2 className="h-4 w-4 text-fuchsia-700" />
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={baseInputClass}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarCheck2 className="h-4 w-4 text-lime-700" />
                Year of Study
              </label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                className={baseInputClass}
                required
              >
                <option value="">Select Year</option>
                <option value="First Year">First Year</option>
                <option value="Second Year">Second Year</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarCheck2 className="h-4 w-4 text-green-700" />
                Admission Year
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

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarCheck2 className="h-4 w-4 text-teal-700" />
                Date of Joining
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

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <KeyRound className="h-4 w-4 text-sky-700" />
                Password (Optional)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave empty to use server default"
                className={baseInputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin className="h-4 w-4 text-red-700" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={4}
                placeholder="Enter full address"
                className={baseInputClass}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ImageUp className="h-4 w-4 text-blue-700" />
                Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhoto(e.target.files?.[0] || null)}
                className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-800"
              />
            </div>

            <div className="pt-2 md:col-span-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-700 to-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:from-cyan-800 hover:to-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileInput className="h-4 w-4" />
                {isLoading ? 'Registering...' : 'Register Student'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}
