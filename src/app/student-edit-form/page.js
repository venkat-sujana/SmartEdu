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

const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100'



const createFormState = student => ({
  name: student?.name || '',
  mobile: student?.mobile || '',
  group: student?.group || '',
  caste: student?.caste || '',
  gender: student?.gender || '',
  dateOfJoining: normalizeDate(student?.dateOfJoining),
  admissionYear: student?.admissionYear || '',
  address: student?.address || '',
  photo: student?.photo || '',
  file: null,
})

const StudentEditForm = ({ student, onCancel, onSave }) => {
  const [formData, setFormData] = useState(createFormState(student))
  const [isUploading, setIsUploading] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    setFormData(createFormState(student))
  }, [student])

  const collegeName = session?.user?.collegeName || 'Loading college...'
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const handleChange = e => {
    const { name, value, files } = e.target

    if (name === 'file') {
      const file = files?.[0] || null
      const previewUrl = file ? URL.createObjectURL(file) : formData.photo
      setFormData(prev => ({
        ...prev,
        file,
        photo: previewUrl,
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const uploadToCloudinary = async file => {
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlwxpzc83'

    if (!uploadPreset) {
      throw new Error('NEXT_PUBLIC_UPLOAD_PRESET is missing')
    }

    const payload = new FormData()
    payload.append('file', file)
    payload.append('upload_preset', uploadPreset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: payload,
    })

    if (!res.ok) {
      throw new Error('Photo upload failed')
    }

    const data = await res.json()
    return data.secure_url
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
        mobile: formData.mobile,
        group: formData.group,
        caste: formData.caste,
        gender: formData.gender,
        dateOfJoining: formData.dateOfJoining,
        admissionYear: formData.admissionYear,
        address: formData.address,
        photo: photoUrl,
        _id: student._id,
      }

      const res = await fetch(`/api/students/${student._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!res.ok) throw new Error('Update failed')

      const updatedStudent = await res.json()
      onSave(updatedStudent)
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
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <User className="h-4 w-4 text-cyan-700" />
            Full Name
          </label>
          <input name="name" value={formData.name} onChange={handleChange} className={inputClass} required />
        </div>

        

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Phone className="h-4 w-4 text-indigo-700" />
            Mobile
          </label>
          <input name="mobile" value={formData.mobile} onChange={handleChange} className={inputClass} required />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users2 className="h-4 w-4 text-purple-700" />
            Group
          </label>
          <select name="group" value={formData.group} onChange={handleChange} className={inputClass} required>
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
          <select name="caste" value={formData.caste} onChange={handleChange} className={inputClass} required>
            <option value="">Select Caste</option>
            {castes.map(caste => (
              <option key={caste} value={caste}>
                {caste}
              </option>
            ))}
          </select>
        </div>

        <div>
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users2 className="h-4 w-4 text-fuchsia-700" />
            Gender
          </label>
          <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
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
            className={inputClass}
            required
          />
        </div>

        

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <CalendarCheck2 className="h-4 w-4 text-green-700" />
            Admission Year
          </label>
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
            rows={3}
            className={inputClass}
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
        </div>
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
