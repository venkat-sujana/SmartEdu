'use client'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DEFAULT_COLLEGE_GROUPS } from '@/utils/collegeGroups'
import { normalizeAttendanceGroup } from '@/utils/attendanceGroup'

// Constants defined outside component to prevent recreation
const MONTHS_LIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const YEARS_LIST = ['First Year', 'Second Year']
const SESSION_LIST = ['FN', 'AN']
const ATTENDANCE_STATUS = ['present', 'absent']

// Memoized student row component
const StudentRow = memo(function StudentRow({ student, status, onToggle }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border-2 border-blue-100 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
          {student.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800">{student.name}</p>
          <p className="text-xs text-slate-500">{student.admissionNo}</p>
        </div>
      </div>

      <div className="mt-1 flex gap-2">
        {ATTENDANCE_STATUS.map(s => (
          <button
            key={s}
            onClick={() => onToggle(student._id, s)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              status === s
                ? s === 'present'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-red-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'present' ? '✓ Present' : '✗ Absent'}
          </button>
        ))}
      </div>
    </div>
  )
})

// Memoized form select component
const FormSelect = memo(function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-xl border-2 border-blue-400 bg-white px-3 py-2 text-base transition-all focus:border-blue-500 focus:ring-2 focus:ring-indigo-400"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option
            key={typeof opt === 'object' ? opt.value : opt}
            value={typeof opt === 'object' ? opt.value : opt}
          >
            {typeof opt === 'object' ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  )
})

export default function AttendanceForm({ defaultGroup = '', returnUrl = '/lecturer/dashboard' }) {
  // Consolidated state to reduce re-renders
  const [formState, setFormState] = useState({
    selectedYearOfStudy: '',
    selectedGroup: defaultGroup,
    selectedDate: '',
    selectedSession: '',
    selectedLecturerId: '',
  })

  const [attendanceData, setAttendanceData] = useState({})
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [groupsList, setGroupsList] = useState(DEFAULT_COLLEGE_GROUPS)
  const [isLoading, setIsLoading] = useState(false)
  const [fullscreenToastMessage, setFullscreenToastMessage] = useState(null)

  const { data: session } = useSession()
  const router = useRouter()

  const collegeId = session?.user?.collegeId
  const collegeName = session?.user?.collegeName || 'College'

  // Memoized fetch functions
  const fetchCollegeGroups = useCallback(async () => {
    if (!collegeId) return

    try {
      const res = await fetch(`/api/colleges/${collegeId}`, { credentials: 'include' })
      const data = await res.json()
      if (Array.isArray(data?.groups) && data.groups.length) {
        setGroupsList(data.groups)
      }
    } catch (error) {
      console.error('Failed to fetch college groups:', error)
    }
  }, [collegeId])

  const fetchLecturers = useCallback(async () => {
    if (!collegeId) return

    try {
      const res = await fetch(`/api/lecturers?collegeId=${collegeId}`, { credentials: 'include' })
      const json = await res.json()
      if (json.status === 'success') setLecturers(json.data)
    } catch (error) {
      console.error('Failed to fetch lecturers:', error)
    }
  }, [collegeId])

  const fetchStudents = useCallback(async () => {
    const { selectedGroup } = formState
    if (!selectedGroup || !collegeId) {
      setStudents([])
      return
    }

    try {
      const res = await fetch(
        `/api/students?collegeId=${collegeId}&group=${encodeURIComponent(selectedGroup)}`,
        { credentials: 'include' }
      )
      const json = await res.json()
      if (json.status === 'success') setStudents(json.data)
    } catch (error) {
      console.error('Failed to fetch students:', error)
      setStudents([])
    }
  }, [formState.selectedGroup, collegeId])

  // Effects with proper dependencies
  useEffect(() => {
    fetchCollegeGroups()
    fetchLecturers()
  }, [fetchCollegeGroups, fetchLecturers])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Optimized filtering with useMemo
  useEffect(() => {
    const { selectedGroup, selectedYearOfStudy } = formState

    if (selectedGroup && selectedYearOfStudy) {
      const normalizedSelectedGroup = normalizeAttendanceGroup(selectedGroup)
      const filtered = students.filter(
        s =>
          normalizeAttendanceGroup(s.group) === normalizedSelectedGroup &&
          s.yearOfStudy === selectedYearOfStudy
      )
      setFilteredStudents(filtered)
    } else {
      setFilteredStudents([])
    }
  }, [formState.selectedGroup, formState.selectedYearOfStudy, students])

  // Memoized handlers
  const handleFormChange = useCallback((field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleToggleChange = useCallback((studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }))
  }, [])

  const handleSubmit = useCallback(async () => {
    const {
      selectedDate,
      selectedGroup,
      selectedLecturerId,
      selectedSession,
      selectedYearOfStudy,
    } = formState

    if (
      !selectedDate ||
      !selectedGroup ||
      filteredStudents.length === 0 ||
      !selectedLecturerId ||
      !selectedSession
    ) {
      setFullscreenToastMessage(
        'Select date, group, session and lecturer. Ensure students visible.'
      )
      return
    }

    const dateObj = new Date(selectedDate)
    const month = MONTHS_LIST[dateObj.getMonth()]
    const year = dateObj.getFullYear()

    const lecturerInfo = lecturers.find(l => l._id === selectedLecturerId)
    const normalizedSelectedGroup = normalizeAttendanceGroup(selectedGroup)

    const attendanceRecords = filteredStudents.map(student => ({
      studentId: student._id,
      date: selectedDate,
      ...(attendanceData[student._id] ? { status: attendanceData[student._id] } : {}),
      group: normalizedSelectedGroup,
      month,
      yearOfStudy: selectedYearOfStudy,
      lecturerId: selectedLecturerId,
      lecturerName: lecturerInfo?.name || '',
      collegeId,
      year,
      session: selectedSession,
    }))

    setIsLoading(true)
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceRecords),
        credentials: 'include',
      })
      const result = await response.json()

      if (response.status === 400 && result.status === 'error') {
        setFullscreenToastMessage(result.message || 'Attendance already taken!')
        return
      }

      if (result.status === 'success') {
        setFullscreenToastMessage(result.message || 'Attendance submitted successfully!')

        // Reset form
        setFormState({
          selectedYearOfStudy: '',
          selectedGroup: '',
          selectedDate: '',
          selectedSession: '',
          selectedLecturerId: '',
        })
        setFilteredStudents([])
        setAttendanceData({})
        setStudents([])

        // Auto redirect
        setTimeout(() => router.push(returnUrl), 2000)
      } else {
        setFullscreenToastMessage(result.message || 'Something went wrong!')
      }
    } catch (error) {
      setFullscreenToastMessage('Error submitting attendance')
    } finally {
      setIsLoading(false)
    }
  }, [formState, filteredStudents, attendanceData, lecturers, collegeId, returnUrl, router])

  // Memoized options
  const lecturerOptions = useMemo(
    () => lecturers.map(l => ({ value: l._id, label: l.name })),
    [lecturers]
  )

  const groupOptions = useMemo(() => groupsList, [groupsList])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 px-2 py-5">
      {/* Toast Notification */}
      {fullscreenToastMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`flex max-w-md flex-col items-center rounded-xl border-2 bg-white px-8 py-6 text-xl font-bold shadow-2xl ${
              fullscreenToastMessage.includes('already') || fullscreenToastMessage.includes('Error')
                ? 'border-red-400 text-red-700'
                : 'border-green-400 text-green-700'
            }`}
          >
            <span className="mb-3 text-3xl">
              {fullscreenToastMessage.includes('already') ||
              fullscreenToastMessage.includes('Error')
                ? '❌'
                : '✅'}
            </span>
            <span className="mb-3 text-center">{fullscreenToastMessage}</span>
            <button
              className="mt-2 rounded-lg bg-blue-700 px-6 py-2 text-lg font-bold text-white shadow transition-colors hover:bg-blue-800"
              onClick={() => setFullscreenToastMessage(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-blue-500" />
        </div>
      )}

      <div className="mx-auto max-w-5xl rounded-2xl border-2 border-blue-100 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex flex-col items-center">
          <div className="flex items-center gap-3 rounded-2xl border bg-gradient-to-r from-blue-50 via-green-50 to-indigo-50 px-4 py-2 font-bold text-blue-700 shadow">
            <span className="text-2xl">🏫</span>
            <span className="tracking-wide">{collegeName}</span>
          </div>
          <h1 className="my-2 text-2xl font-bold text-blue-800">Mark Attendance</h1>
          <p className="text-gray-500">
            Select date, group, session and ensure students are visible.
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-4 flex justify-end">
          <Link href={returnUrl}>
            <button className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:bg-blue-700">
              ← Back to {defaultGroup || 'Dashboard'}
            </button>
          </Link>
        </div>

        {/* Form Fields */}
        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Date</label>
            <input
              type="date"
              value={formState.selectedDate}
              onChange={e => handleFormChange('selectedDate', e.target.value)}
              className="block w-full rounded-xl border-2 border-blue-400 px-3 py-2 text-base transition-all focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <FormSelect
            label="Year"
            value={formState.selectedYearOfStudy}
            onChange={e => handleFormChange('selectedYearOfStudy', e.target.value)}
            options={YEARS_LIST}
            placeholder="Select Year"
          />

          <FormSelect
            label="Group"
            value={formState.selectedGroup}
            onChange={e => handleFormChange('selectedGroup', e.target.value)}
            options={groupOptions}
            placeholder="Select Group"
          />

          <FormSelect
            label="Session"
            value={formState.selectedSession}
            onChange={e => handleFormChange('selectedSession', e.target.value)}
            options={SESSION_LIST}
            placeholder="Select Session"
            required
          />

          <FormSelect
            label="Lecturer"
            value={formState.selectedLecturerId}
            onChange={e => handleFormChange('selectedLecturerId', e.target.value)}
            options={lecturerOptions}
            placeholder="Select Lecturer"
            required
          />
        </div>

        {/* Students Grid */}
        {filteredStudents.length > 0 && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Students ({filteredStudents.length})
              </h2>
              <button
                onClick={() => {
                  const allPresent = {}
                  filteredStudents.forEach(s => (allPresent[s._id] = 'present'))
                  setAttendanceData(allPresent)
                }}
                className="rounded-lg bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600"
              >
                Mark All Present
              </button>
            </div>

            <div className="grid max-h-[600px] grid-cols-1 gap-4 overflow-y-auto p-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.map(student => (
                <StudentRow
                  key={student._id}
                  student={student}
                  status={attendanceData[student._id]}
                  onToggle={handleToggleChange}
                />
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {filteredStudents.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              {isLoading ? 'Submitting...' : 'Submit Attendance'}
            </button>
          </div>
        )}

        {filteredStudents.length === 0 &&
          formState.selectedGroup &&
          formState.selectedYearOfStudy && (
            <div className="py-8 text-center text-slate-500">
              <p className="text-lg">No students found for the selected criteria.</p>
            </div>
          )}
      </div>
    </div>
  )
}
