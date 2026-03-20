//src/app/student-edit-form/page.js

'use client'

import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import {
  User,
  Pencil,
  Phone,
  Users2,
  IdCard,
  CalendarCheck2,
  MapPin,
  ImageUp,
  School,
  Save,
  X,
  KeyRound,
} from 'lucide-react'
import { DEFAULT_COLLEGE_GROUPS } from '@/utils/collegeGroups'

const castes = ['OC', 'OBC', 'BC-A', 'BC-B', 'BC-C', 'BC-D', 'BC-E', 'SC', 'SC-A', 'SC-B', 'SC-C', 'ST', 'OTHER']
const yearOptions = ['First Year', 'Second Year']
const statusOptions = ['Active', 'Terminated']

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100'

const normalizeDate = value => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().split('T')[0]
}

const createFormState = student => ({
  name: student?.name || '',
  fatherName: student?.fatherName || '',
  mobile: student?.mobile || '',
  parentMobile: student?.parentMobile || '',
  admissionNo: student?.admissionNo || '',
  group: student?.group || '',
  caste: student?.caste || '',
  dob: normalizeDate(student?.dob),
  gender: student?.gender || '',
  yearOfStudy: student?.yearOfStudy || '',
  status: student?.status || 'Active',
  dateOfJoining: normalizeDate(student?.dateOfJoining),
  admissionYear: student?.admissionYear || '',
  password: student?.password || '',
  address: student?.address || '',
  photo: student?.photo || '',
  file: null,
})

const Field = ({ icon: Icon, iconClassName, label, children, className = '' }) => (
  <div className={className}>
    <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <Icon className={`h-4 w-4 ${iconClassName}`} />
      {label}
    </label>
    {children}
  </div>
)

const StudentEditForm = ({ student, onCancel, onSave }) => {
  const [formData, setFormData] = useState(createFormState(student))
  const [isUploading, setIsUploading] = useState(false)
  const [availableGroups, setAvailableGroups] = useState(DEFAULT_COLLEGE_GROUPS)
  const { data: session } = useSession()

  useEffect(() => {
    setFormData(createFormState(student))
  }, [student])

  useEffect(() => {
    const fetchCollegeGroups = async () => {
      if (!session?.user?.collegeId) return

      try {
        const res = await fetch(`/api/colleges/${session.user.collegeId}`)
        const data = await res.json()
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

  const collegeName = session?.user?.collegeName || 'Loading college...'
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
    const { name, value, files } = e.target

    if (name === 'file') {
      const file = files?.[0] || null
      setFormData(prev => ({
        ...prev,
        file,
        photo: file ? URL.createObjectURL(file) : student?.photo || '',
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const uploadToCloudinary = async file => {
    const payload = new FormData()
    payload.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: payload,
    })

    if (!res.ok) {
      const result = await res.json().catch(() => ({}))
      throw new Error(result.message || 'Photo upload failed')
    }

    const data = await res.json()
    return data.url
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsUploading(true)

    try {
      let photoUrl = formData.photo

      if (formData.file) {
        const toastId = toast.loading('Uploading photo...')
        try {
          photoUrl = await uploadToCloudinary(formData.file)
          toast.success('Photo uploaded successfully', { id: toastId })
        } catch (err) {
          toast.error(err.message || 'Photo upload failed', { id: toastId })
          return
        }
      }

      const updateData = {
        name: formData.name,
        fatherName: formData.fatherName,
        mobile: formData.mobile,
        parentMobile: formData.parentMobile,
        admissionNo: formData.admissionNo,
        group: formData.group,
        caste: formData.caste,
        dob: formData.dob || null,
        gender: formData.gender,
        yearOfStudy: formData.yearOfStudy,
        status: formData.status,
        dateOfJoining: effectiveDateOfJoining,
        admissionYear: Number(formData.admissionYear),
        password: formData.password?.trim() || undefined,
        address: formData.address,
        photo: photoUrl,
        _id: student._id,
      }

      const res = await fetch(`/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Update failed')

      onSave(result.data)
      toast.success('Student updated successfully')
    } catch (err) {
      toast.error(`Update failed: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-xl backdrop-blur sm:p-6 lg:p-8"
    >
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
            <School className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Institution</p>
            <p className="text-sm font-bold text-slate-900">{collegeName}</p>
          </div>
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">Edit Student Details</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
        <Field icon={User} iconClassName="text-cyan-700" label="Full Name">
          <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
        </Field>

        <Field icon={Pencil} iconClassName="text-emerald-700" label="Father's Name">
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>

        <Field icon={Phone} iconClassName="text-indigo-700" label="Mobile">
          <input name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} required />
        </Field>

        <Field icon={Phone} iconClassName="text-cyan-700" label="Parent Mobile">
          <input
            name="parentMobile"
            value={formData.parentMobile}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>

        <Field icon={IdCard} iconClassName="text-amber-700" label="Admission Number">
          <input
            name="admissionNo"
            value={formData.admissionNo}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>

        <Field icon={Users2} iconClassName="text-purple-700" label="Group">
          <select name="group" value={formData.group} onChange={handleChange} className={inputClass} required>
            <option value="">Select Group</option>
            {availableGroups.map(group => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={IdCard} iconClassName="text-rose-700" label="Caste">
          <select name="caste" value={formData.caste} onChange={handleChange} className={inputClass} required>
            <option value="">Select Caste</option>
            {castes.map(caste => (
              <option key={caste} value={caste}>
                {caste}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={CalendarCheck2} iconClassName="text-orange-700" label="Date of Birth">
          <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
        </Field>

        <Field icon={Users2} iconClassName="text-fuchsia-700" label="Gender">
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </Field>

        <Field icon={School} iconClassName="text-blue-700" label="Year of Study">
          <select
            name="yearOfStudy"
            value={formData.yearOfStudy}
            onChange={handleChange}
            className={inputClass}
            required
          >
            <option value="">Select Year</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={School} iconClassName="text-slate-700" label="Status">
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={CalendarCheck2} iconClassName="text-teal-700" label="Date of Joining">
          <input
            type="date"
            name="dateOfJoining"
            value={effectiveDateOfJoining}
            onChange={handleChange}
            disabled={isSecondYear}
            className={`${inputClass} ${
              isSecondYear ? 'cursor-not-allowed bg-slate-100 text-slate-500 opacity-80' : ''
            }`}
            required={!isSecondYear}
          />
          {isSecondYear ? (
            <p className="mt-2 text-xs font-medium text-slate-500">
              Date of joining is auto-set from admission year for second-year students.
            </p>
          ) : null}
        </Field>

        <Field icon={CalendarCheck2} iconClassName="text-green-700" label="Admission Year">
          <input
            type="number"
            min="2000"
            max={currentYear + 1}
            name="admissionYear"
            value={formData.admissionYear}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </Field>

        <Field icon={KeyRound} iconClassName="text-violet-700" label="Password" className="md:col-span-2">
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
            placeholder="Leave as-is or enter a new password"
          />
        </Field>

        <Field icon={MapPin} iconClassName="text-red-700" label="Address" className="md:col-span-2">
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            required
          />
        </Field>

        <Field icon={ImageUp} iconClassName="text-blue-700" label="Upload Photo" className="md:col-span-2">
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-800"
          />
          {formData.photo && (
            <img
              src={formData.photo}
              alt="Student preview"
              className="mt-3 h-24 w-24 rounded-xl border border-slate-200 object-cover"
            />
          )}
        </Field>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-700 to-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-cyan-800 hover:to-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isUploading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

export default StudentEditForm
