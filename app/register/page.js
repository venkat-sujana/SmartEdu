//app/register/page.jsx
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'


import {
Users2, FileInput, KeyRound, Phone, User, Pencil, MapPin, CalendarCheck2, IdCard, PlusCircle,
  School, ImageUp
} from 'lucide-react';

export default function RegisterPage() {
  const { data: session } = useSession()
  console.log('SESSION: ', session)

  const [collegeId, setCollegeId] = useState('')
  const [collegeName, setCollegeName] = useState('')

  useEffect(() => {
    if (session?.user?.collegeId) {
      setCollegeId(session.user.collegeId)
    }
    if (session?.user?.collegeName) {
      setCollegeName(session.user.collegeName)
    }
  }, [session])

  const [photo, setPhoto] = useState(null)
  const [formData, setFormData] = useState({
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
    photo: null,
    password: '', // <-- password field add చేయండి
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFileChange = e => {
    setFormData({ ...formData, photo: e.target.files[0] })
  }

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setIsLoading(true)

    if (!session?.user?.collegeId) {
      toast.error('Session expired. Please login again.')
      return
    }

    // Password లేకపోతే default password ఇక్కడ set చేయండి
    const password = formData.password || ''
    const passwordToSend = password.trim() === '' ? 'Welcome@2025' : password

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

    form.append('collegeId', collegeId) // ✅ Add this line to send collegeId  not in formData
    form.append('lecturerId', session.user.id) // ✅ Add lecturerId from session

    if (photo) {
      form.append('photo', photo)
    }

    // Password పంపండి (plain text)
    form.append('password', passwordToSend)

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        body: form, // ✅ Correct formData sent here
      })

      const result = await res.json() // ✅ No duplicate parsing
      console.log(result)

      if (res.ok) {
        toast.success('Student registered successfully👍✅')
        router.push('/register') // ✅ Redirect to student table

        // Reset the form
        setFormData({
          name: '',
          fatherName: '',
          mobile: '',
          group: '',
          caste: '',
          dob: '',
          gender: '',
          admissionNo: '',
          admissionYear: '',
          yearOfStudy: '',
          dateOfJoining: '',
          address: '',
          password: '', // <-- password field reset చేయండి
        })
        setPhoto(null)
      } else {
        toast.error('Error: ' + result.message)
      }
    } catch (err) {
      toast.error('Something went wrong.')
      console.error('Submit error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative ">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <School className="w-8 h-8 text-indigo-700" />
              <span className="text-2xl font-bold text-blue-900 tracking-wide">{collegeName || 'Loading...'}</span>
            </div>
            <Link href="/student-table">
              <button className="flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2 text-white font-bold shadow hover:bg-blue-700 transition">
                <Users2 className="w-6 h-6" />
                Student Table
              </button>
            </Link>
          </div>

      {/* Full Page Spinner Overlay */}
      {isLoading && (
        <div className="bg-opacity-80 fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <svg
            className="mb-4 h-12 w-12 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <p className="text-xl font-semibold text-blue-600">Registering...</p>
        </div>
      )}
      <div className="mx-auto mt-10 max-w-2xl rounded-xl border-x-2 border-t-2 border-b-2 border-x-black border-t-blue-600 border-b-blue-600 bg-gray-100 p-6 font-bold shadow-lg">
        {/* College Name Display */}

<div className="mb-6 flex flex-col items-center justify-center">
  <div className="flex items-center gap-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 via-white to-green-50 px-6 py-3 font-extrabold text-blue-900 text-xl shadow-xl">
    <School className="w-8 h-8 text-indigo-700" />
    <span className="tracking-wider">
      {collegeName ? collegeName : 'Loading...'}
    </span>
  </div>
</div>


<div className="mb-5">
  <h2 className="text-center text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 via-green-500 to-purple-500 text-white shadow rounded-xl py-3">
    <PlusCircle className="inline-block w-7 h-7 mx-2 text-yellow-300 -mt-1" />
    🧑‍🎓 Student Admission <span className="font-black">2025</span>
    <PlusCircle className="inline-block w-7 h-7 mx-2 text-yellow-300 -mt-1" />
  </h2>
</div>


        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Column 1 */}

          <div className="space-y-4">
            {/* Name */}
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
            <User className="w-5 h-5 text-green-500" /> Full Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full rounded-md border p-2"
              required
            />

            <div>
              {/* Password */}
              <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <KeyRound className="w-5 h-5 text-teal-600" /> Password (Default: Welcome@2025)
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter Password or leave blank for default"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border p-2"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
             <Pencil className="w-5 h-5 text-orange-500" /> Father Name
             </label>
            <input
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Father's Name"
              className="w-full rounded-md border p-2"
              required
            />
            </div>

             <div>
              <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <Phone className="w-5 h-5 text-indigo-500" /> Mobile Number
            </label>
              <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="Mobile Number"
              className="w-full rounded-md border p-2"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <Users2 className="w-5 h-5 text-purple-500" /> Group
            </label>

            <select
              name="group"
              value={formData.group}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Select Group</option>
              <option value="MPC">MPC</option>
              <option value="BiPC">BiPC</option>
              <option value="CEC">CEC</option>
              <option value="HEC">HEC</option>
              <option value="M&AT">M&AT</option>
              <option value="MLT">MLT</option>
              <option value="CET">CET</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
            <IdCard className="w-5 h-5 text-pink-600" /> Caste
            </label>
            <select
              name="caste"
              value={formData.caste}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Select Caste</option>
              <option value="OC">OC</option>
              <option value="OBC">OBC</option>
              <option value="BC-A">BC-A</option>
              <option value="BC-B">BC-B</option>
              <option value="BC-C">BC-C</option>
              <option value="BC-D">BC-D</option>
              <option value="BC-E">BC-E</option>
              <option value="SC">SC</option>
              <option value="SC-A">SC-A</option>
              <option value="SC-B">SC-B</option>
              <option value="SC-C">SC-C</option>
              <option value="ST">ST</option>
              <option value="OTHER">OTHER</option>
            </select>
        </div>

            <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <Users2 className="w-5 h-5 text-purple-500" /> Group
            </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full rounded-md border p-2"
                required
              />
            </div>

            <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <Users2 className="w-5 h-5 text-pink-500" /> Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
           </div>

          </div>





          {/* Column 2 */}
          <div className="space-y-1">
            <div>
              {/* Admission No */}
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <IdCard className="w-5 h-5 text-yellow-600" /> Admission No
            </label>
              <input
                name="admissionNo"
                value={formData.admissionNo}
                onChange={handleChange}
                placeholder="Admission Number"
                className="w-full rounded-md border p-2"
                required
              />
            </div>

            <div>
              {/* Year of Study */}
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <CalendarCheck2 className="w-5 h-5 text-lime-700" /> Year of Study
            </label>
            <select
              name="yearOfStudy"
              value={formData.yearOfStudy}
              onChange={handleChange}
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Select Year of Study</option>
              <option value="First Year">First Year</option>
              <option value="Second Year">Second Year</option>
            </select>
            </div>

            <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <CalendarCheck2 className="w-5 h-5 text-lime-700" /> Admission Year
            </label>
              <input
                type="number"
                name="admissionYear"
                value={formData.admissionYear}
                onChange={handleChange}
                placeholder="Admission Year"
                className="w-full rounded-md border p-2"
                required
              />
            </div>

            <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <CalendarCheck2 className="w-5 h-5 text-lime-700" /> Date Of Joining
            </label>
              <input
                type="date"
                name="dateOfJoining"
                value={formData.dateOfJoining}
                onChange={handleChange}
                placeholder="Joining Date"
                className="w-full rounded-md border p-2"
                required
              />
            </div>


            <div>
            <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
              <MapPin className="w-5 h-5 text-red-500" /> Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full rounded-md border p-2"
              rows={4}
              required
            />
            </div>

            <div>
              {/* Photo */}
          <label className="flex items-center gap-2 text-base text-blue-700 font-semibold mb-1">
            <ImageUp className="w-5 h-5 text-blue-600" /> Upload Photo
          </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setPhoto(e.target.files[0])}
                className="w-full rounded-md border p-2"
              />
            </div>
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full mt-6 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-green-900 to-blue-900 py-2 text-lg font-bold text-white shadow hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                <FileInput className="w-6 h-6" />
                Register Student
              </button>

          </div>
        </form>
      </div>
    </div>
  )
}
