//src/app/invigilation/admin/dashboard/page.jsx

'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'
import {
  CalendarRange,
  ClipboardCheck,
  Zap,
  FileSpreadsheet,
  FileText,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  RefreshCw,
  Calendar,
  Hash,
  GraduationCap,
  Search,
  School,
  Layers3,
  BookOpen,
  Pencil,
  Trash2,
  LayoutDashboard,
  ListChecks,
  MapPin,
  UserSquare2,
  Settings2,
  CalendarCheck,
} from 'lucide-react'
import AvailabilityTab from '../dashboard/AvailabilityTab'
// ─── Constants ───────────────────────────────────────────────────────────────
const EXAM_TYPES = [
  'UNIT-1',
  'UNIT-2',
  'UNIT-3',
  'UNIT-4',
  'QUARTERLY',
  'HALFYEARLY',
  'PRE-PUBLIC-1',
  'PRE-PUBLIC-2',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date))
}

function parseDateKey(dateStr) {
  if (!dateStr) return null
  const [year, month, day] = String(dateStr).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function formatExamType(examType) {
  return String(examType || '')
    .replace(/HALFYEARLY/g, 'HALF YEARLY')
    .replace(/PRE-PUBLIC/g, 'PRE PUBLIC')
    .replace(/-/g, ' ')
}
function getDayCount(fromDate, toDate) {
  if (!fromDate || !toDate) return 0
  const start = parseDateKey(fromDate)
  const end = parseDateKey(toDate)
  if (isNaN(start) || isNaN(end) || start > end) return 0
  return Math.floor((end - start) / 86400000) + 1
}

// ─── Design System ────────────────────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  const palette = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', val: 'text-blue-700' },
    indigo: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', val: 'text-indigo-700' },
    emerald: {
      bg: 'bg-emerald-50',
      icon: 'bg-emerald-100 text-emerald-600',
      val: 'text-emerald-700',
    },
    violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', val: 'text-violet-700' },
  }
  const p = palette[color] || palette.blue
  return (
    <div className={`rounded-2xl p-5 ${p.bg} border border-white`}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${p.icon}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-black ${p.val}`}>{value}</p>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      {children}
    </div>
  )
}

function Input({ icon, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute top-2.5 left-3 text-slate-400">{icon}</span>
      )}
      <input
        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none ${icon ? 'pl-9' : 'pl-3.5'}`}
        {...props}
      />
    </div>
  )
}

function Select({ icon, children, ...props }) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute top-2.5 left-3 text-slate-400">{icon}</span>
      )}
      <select
        className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pr-8 text-sm text-slate-700 transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none ${icon ? 'pl-9' : 'pl-3.5'}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute top-3 right-3 text-slate-400"
      />
    </div>
  )
}

function Btn({
  children,
  onClick,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
}) {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    violet: 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-sm' }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        children
      )}
    </button>
  )
}

function Chip({ children, color = 'slate' }) {
  const map = {
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  )
}

function SessionChip({ session }) {
  const map = { FN: 'amber', AN: 'blue', EN: 'violet' }
  return <Chip color={map[session] || 'slate'}>{session}</Chip>
}

function AvailChip({ value }) {
  if (!value) return <Chip color="slate">—</Chip>
  const low = value.toLowerCase()
  if (low === 'available')
    return (
      <Chip color="emerald">
        <CheckCircle2 size={10} />
        Available
      </Chip>
    )
  if (low === 'unavailable' || low === 'not available')
    return (
      <Chip color="rose">
        <XCircle size={10} />
        Unavailable
      </Chip>
    )
  return (
    <Chip color="amber">
      <AlertCircle size={10} />
      {value}
    </Chip>
  )
}

function EmptyRow({ cols, icon, message, sub }) {
  return (
    <tr>
      <td colSpan={cols} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="opacity-30">{icon}</div>
          <p className="text-sm font-medium">{message}</p>
          {sub && <p className="text-xs">{sub}</p>}
        </div>
      </td>
    </tr>
  )
}

function TableHead({ cols }) {
  return (
    <thead>
      <tr className="border-b border-slate-100 bg-slate-50/80">
        {cols.map(c => (
          <th
            key={c}
            className="px-5 py-3 text-left text-xs font-bold tracking-wide whitespace-nowrap text-slate-400 uppercase"
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// ─── Room Picker ──────────────────────────────────────────────────────────────
function RoomPicker({ rooms, selectedRoomIds, onToggleRoom, onSelectAll }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Select Rooms</p>
          <p className="mt-0.5 text-xs text-slate-400">
            All selected rooms get schedules for every day in the range
          </p>
        </div>
        <Btn variant="outline" size="sm" onClick={onSelectAll}>
          {selectedRoomIds.length === rooms.length && rooms.length > 0 ? 'Clear All' : 'Select All'}
        </Btn>
      </div>
      {rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-400">
          No rooms created yet. Add rooms first.
        </div>
      ) : (
        <div className="grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map(room => {
            const on = selectedRoomIds.includes(room._id)
            return (
              <label
                key={room._id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${on ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => onToggleRoom(room._id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="min-w-0">
                  <span className="block font-semibold">{room.name}</span>
                  <span className="block text-xs text-slate-400">
                    {room.block || 'Main Block'}
                    {room.capacity ? ` · ${room.capacity} seats` : ''}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminInvigilationDashboardPage() {
  // ── State (unchanged) ────────────────────────────────────────────────────
  const [lecturers, setLecturers] = useState([])
  const [rooms, setRooms] = useState([])
  const [exams, setExams] = useState([])
  const [duties, setDuties] = useState([])
  const [loading, setLoading] = useState(false)
  const [autoLoading, setAutoLoading] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [unavailCount, setUnavailCount] = useState(0)

  const [roomForm, setRoomForm] = useState({ name: '', block: '', capacity: '' })
  const [scheduleForm, setScheduleForm] = useState({
    fromDate: '',
    toDate: '',
    session: 'FN',
    examType: 'UNIT-1',
    roomIds: [],
    maxDutiesPerLecturer: '2',
    sameDayNoRepeat: true,
  })
  const [editingRoomId, setEditingRoomId] = useState('')
  const [editingScheduleId, setEditingScheduleId] = useState('')
  const [singleScheduleForm, setSingleScheduleForm] = useState({
    date: '',
    session: 'FN',
    examType: 'UNIT-1',
    roomId: '',
  })
  const [seatingDeleteExamType, setSeatingDeleteExamType] = useState('')
  const [dutyForm, setDutyForm] = useState({ examScheduleId: '', lecturerId: '' })
  const [filters, setFilters] = useState({ fromDate: '', toDate: '', lecturerId: '', session: '' })
  const [allDuties, setAllDuties] = useState([])

  // ── Data fetching (unchanged) ─────────────────────────────────────────────
  const fetchAll = useCallback(
    async (activeFilters = { date: '', lecturerId: '', session: '' }) => {
      setLoading(true)
      try {
        const qp = new URLSearchParams()
        if (activeFilters.fromDate) qp.set('fromDate', activeFilters.fromDate)
        if (activeFilters.toDate) qp.set('toDate', activeFilters.toDate)
        if (activeFilters.lecturerId) qp.set('lecturerId', activeFilters.lecturerId)
        if (activeFilters.session) qp.set('session', activeFilters.session)

        const [lRes, rRes, eRes, dRes, allDRes] = await Promise.all([
          fetch('/api/invigilation/lecturers', { cache: 'no-store' }),
          fetch('/api/invigilation/rooms', { cache: 'no-store' }),
          fetch('/api/invigilation/exams', { cache: 'no-store' }),
          fetch(`/api/invigilation/duties?${qp}`, { cache: 'no-store' }),
          fetch('/api/invigilation/duties', { cache: 'no-store' }),
        ])
        const [lData, rData, eData, dData, allDData] = await Promise.all([
          lRes.json(),
          rRes.json(),
          eRes.json(),
          dRes.json(),
          allDRes.json(),
        ])
        setAllDuties(allDData.data || [])
        console.log('allDData:', allDData)

        if (!lRes.ok || !rRes.ok || !eRes.ok || !dRes.ok)
          throw new Error(
            lData.message || rData.message || eData.message || dData.message || 'Failed'
          )
        setLecturers(lData.data || [])
        setRooms(rData.data || [])
        setExams(eData.data || [])
        setDuties(dData.data || [])
        setAllDuties(allDData.data || [])
      } catch (err) {
        toast.error(err.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    },
    []
  )
  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Handlers (unchanged logic) ────────────────────────────────────────────
  const onCreateRoom = async e => {
    e.preventDefault()
    try {
      const isEditing = Boolean(editingRoomId)
      const res = await fetch(
        isEditing ? `/api/invigilation/rooms/${editingRoomId}` : '/api/invigilation/rooms',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomForm),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(isEditing ? 'Room updated' : 'Room created')
      setRoomForm({ name: '', block: '', capacity: '' })
      setEditingRoomId('')
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  const createScheduleBatch = async () => {
    if (scheduleForm.roomIds.length === 0) {
      toast.error('Select at least one room')
      return null
    }
    setScheduleLoading(true)
    try {
      const res = await fetch('/api/invigilation/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(
        `${data.message} | Created: ${data.createdCount || 0} | Skipped: ${data.skippedCount || 0}`
      )
      fetchAll(filters)
      return data
    } catch (err) {
      toast.error(err.message || 'Failed')
      return null
    } finally {
      setScheduleLoading(false)
    }
  }

  const onCreateSchedule = async e => {
    e.preventDefault()
    const ok = await createScheduleBatch()
    if (ok) setScheduleForm(s => ({ ...s, fromDate: '', toDate: '', roomIds: [] }))
  }

  const resetScheduleEditor = () => {
    setEditingScheduleId('')
    setSingleScheduleForm({ date: '', session: 'FN', examType: 'UNIT-1', roomId: '' })
  }

  const onAssignDuty = async e => {
    e.preventDefault()
    try {
      const res = await fetch('/api/invigilation/duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dutyForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Duty assigned')
      setDutyForm({ examScheduleId: '', lecturerId: '' })
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  const onAutoAssign = async () => {
    setAutoLoading(true)
    try {
      const res = await fetch('/api/invigilation/duties/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: filters.fromDate || undefined,
          toDate: filters.toDate || undefined,
          session: filters.session || undefined,
          maxDutiesPerLecturer: Number(scheduleForm.maxDutiesPerLecturer || 0) || undefined,
          sameDayNoRepeat: scheduleForm.sameDayNoRepeat,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`${data.message} | Assigned: ${data.assigned} | Skipped: ${data.skipped}`)
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Auto assign failed')
    } finally {
      setAutoLoading(false)
    }
  }

  const onGenerateAndAssign = async () => {
    const snap = { ...scheduleForm }
    const ok = await createScheduleBatch()
    if (!ok) return
    setAutoLoading(true)
    try {
      const res = await fetch('/api/invigilation/duties/auto-assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromDate: snap.fromDate,
          toDate: snap.toDate,
          session: snap.session,
          examType: snap.examType,
          maxDutiesPerLecturer: Number(snap.maxDutiesPerLecturer || 0) || undefined,
          sameDayNoRepeat: snap.sameDayNoRepeat,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Generated & assigned | Assigned: ${data.assigned} | Skipped: ${data.skipped}`)
      setScheduleForm(s => ({ ...s, fromDate: '', toDate: '', roomIds: [] }))
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setAutoLoading(false)
    }
  }

  const onUpdateSingleSchedule = async e => {
    e.preventDefault()
    if (!editingScheduleId) return
    setActionLoading(`schedule-save-${editingScheduleId}`)
    try {
      const res = await fetch(`/api/invigilation/exams/${editingScheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleScheduleForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Schedule updated')
      resetScheduleEditor()
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const onEditRoom = room => {
    setEditingRoomId(room._id)
    setRoomForm({
      name: room.name || '',
      block: room.block || '',
      capacity: room.capacity ? String(room.capacity) : '',
    })
  }
  const onDeleteRoom = async room => {
    if (!window.confirm(`Delete room ${room.name}?`)) return
    setActionLoading(`room-delete-${room._id}`)
    try {
      const res = await fetch(`/api/invigilation/rooms/${room._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Room deleted')
      if (editingRoomId === room._id) {
        setEditingRoomId('')
        setRoomForm({ name: '', block: '', capacity: '' })
      }
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const onEditSchedule = plan => {
    setEditingScheduleId(plan.id)
    const room = rooms.find(r => r.name === plan.hallNo)
    setSingleScheduleForm({
      date: formatDate(plan.date),
      session: plan.session,
      examType: plan.examType,
      roomId: room?._id || '',
    })
  }

  const onDeleteSchedule = async plan => {
    if (!window.confirm(`Delete schedule for ${plan.hallNo} on ${formatDate(plan.date)}?`)) return
    setActionLoading(`schedule-delete-${plan.id}`)
    try {
      const res = await fetch(`/api/invigilation/exams/${plan.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success('Schedule deleted')
      if (editingScheduleId === plan.id) resetScheduleEditor()
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const onDeleteAllSchedules = async () => {
    if (roomSeatingPlan.length === 0) {
      toast.error('No schedules to delete')
      return
    }
    if (
      !window.confirm(
        `Delete ${roomSeatingPlan.length} schedules? Linked duties will also be removed.`
      )
    )
      return
    setActionLoading('schedule-delete-all')
    try {
      const res = await fetch('/api/invigilation/exams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: roomSeatingPlan.map(i => i.id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Deleted ${data.deletedCount || 0} schedules`)
      if (editingScheduleId) resetScheduleEditor()
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const onDeleteSchedulesByExamType = async () => {
    if (!seatingDeleteExamType) {
      toast.error('Select exam type')
      return
    }

    const targetPlans = roomSeatingPlan.filter(plan => plan.examType === seatingDeleteExamType)

    if (targetPlans.length === 0) {
      toast.error('No schedules found for selected exam type')
      return
    }

    if (
      !window.confirm(
        `Delete ${targetPlans.length} schedules for ${formatExamType(seatingDeleteExamType)}? Linked duties will also be removed.`
      )
    )
      return

    setActionLoading('schedule-delete-exam-type')
    try {
      const res = await fetch('/api/invigilation/exams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetPlans.map(plan => plan.id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      toast.success(`Deleted ${data.deletedCount || 0} schedules`)
      if (editingScheduleId && targetPlans.some(plan => plan.id === editingScheduleId)) {
        resetScheduleEditor()
      }
      fetchAll(filters)
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setActionLoading('')
    }
  }

  const toggleRoom = id =>
    setScheduleForm(s => ({
      ...s,
      roomIds: s.roomIds.includes(id) ? s.roomIds.filter(r => r !== id) : [...s.roomIds, id],
    }))
  const toggleAllRooms = () =>
    setScheduleForm(s => ({
      ...s,
      roomIds: s.roomIds.length === rooms.length ? [] : rooms.map(r => r._id),
    }))

  // ── Derived (unchanged) ───────────────────────────────────────────────────
  const totalDays = useMemo(
    () => getDayCount(scheduleForm.fromDate, scheduleForm.toDate),
    [scheduleForm.fromDate, scheduleForm.toDate]
  )
  const schedulePreviewCount = totalDays * scheduleForm.roomIds.length
  const selectedRooms = useMemo(
    () => rooms.filter(r => scheduleForm.roomIds.includes(r._id)),
    [rooms, scheduleForm.roomIds]
  )
  const totalSelectedCapacity = useMemo(
    () => selectedRooms.reduce((s, r) => s + (Number(r.capacity) || 0), 0),
    [selectedRooms]
  )
  const dailySeatCapacity = totalSelectedCapacity
  const rangeSeatCapacity = dailySeatCapacity * totalDays
  const workloadLimit = Number(scheduleForm.maxDutiesPerLecturer || 0)
  const effectiveLecturerLimit = scheduleForm.sameDayNoRepeat
    ? Math.min(workloadLimit || totalDays, totalDays)
    : workloadLimit
  const lecturerCoverage = lecturers.length * (effectiveLecturerLimit || 0)
  const hasCoverageGap = workloadLimit > 0 && lecturerCoverage < schedulePreviewCount

  const exportRows = useMemo(
    () =>
      duties.map((d, i) => ({
        SNo: i + 1,
        Date: d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : '',
        Session: d.examScheduleId?.session || '',
        ExamType: d.examScheduleId?.examType || d.examScheduleId?.subject || '',
        HallNo: d.examScheduleId?.hallNo || '',
        Lecturer: d.lecturerId?.name || '',
        Availability: d.availability,
      })),
    [duties]
  )

  const exportExcel = () => {
    const ws = utils.json_to_sheet(exportRows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Duties')
    writeFile(wb, `invigilation-duties-${Date.now()}.xlsx`)
  }
  const exportPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(15)
    doc.text('Invigilation Duty Assignment Report', 14, 14)
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20)
    autoTable(doc, {
      startY: 26,
      head: [['Date', 'Session', 'Exam Type', 'Hall', 'Lecturer', 'Availability']],
      body: exportRows.map(r => [
        r.Date,
        r.Session,
        r.ExamType,
        r.HallNo,
        r.Lecturer,
        r.Availability,
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
    })
    doc.save(`invigilation-duties-${Date.now()}.pdf`)
  }

  const roomMap = useMemo(() => new Map(rooms.map(r => [String(r._id), r])), [rooms])
  const dutyByExamId = useMemo(
    () => new Map(duties.map(d => [String(d.examScheduleId?._id || ''), d])),
    [duties]
  )
  const filteredScheduleExams = useMemo(
    () =>
      exams.filter(
        e =>
          (!filters.date || formatDate(e.date) === filters.date) &&
          (!filters.session || e.session === filters.session)
      ),
    [exams, filters.date, filters.session]
  )
  const roomSeatingPlan = useMemo(
    () =>
      filteredScheduleExams
        .map(exam => {
          const room = exam.roomId
            ? roomMap.get(String(exam.roomId._id || exam.roomId))
            : rooms.find(r => r.name === exam.hallNo)
          const duty = dutyByExamId.get(String(exam._id))
          return {
            id: exam._id,
            date: exam.date,
            session: exam.session,
            examType: exam.examType || exam.subject,
            hallNo: exam.hallNo,
            block: room?.block || '-',
            capacity: Number(room?.capacity) || 0,
            lecturerName: duty?.lecturerId?.name || '',
            assigned: Boolean(duty),
            availability: duty?.availability || '',
          }
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date) || a.hallNo.localeCompare(b.hallNo)),
    [dutyByExamId, filteredScheduleExams, roomMap, rooms]
  )

  const lecturerDutySummary = useMemo(() => {
    const vis = filters.lecturerId ? lecturers.filter(l => l.id === filters.lecturerId) : lecturers
    return vis
      .map(l => {
        const ld = duties.filter(
          d =>
            String(d.lecturerId?._id || d.lecturerId?.id || d.lecturerId) === String(l._id || l.id)
        )

        const dates = new Set(
          ld.filter(d => d.examScheduleId?.date).map(d => formatDate(d.examScheduleId.date))
        )
        return {
          id: l._id || l.id,
          name: l.name,
          designation: l.designation,
          totalDuties: ld.length,
          pending: ld.filter(d => d.availability === 'Pending').length,
          available: ld.filter(d => d.availability === 'Available').length,
          unavailable: ld.filter(d => d.availability === 'Not Available').length,
          activeDays: dates.size,
          rooms: [...new Set(ld.map(d => d.examScheduleId?.hallNo).filter(Boolean))].slice(0, 4),
        }
      })
      .sort((a, b) => b.totalDuties - a.totalDuties || a.name.localeCompare(b.name))
  }, [duties, filters.lecturerId, lecturers])

  const assignedCount = roomSeatingPlan.filter(i => i.assigned).length
  const unassignedCount = roomSeatingPlan.length - assignedCount

  const exportSeatingPlanPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(15)
    doc.text('Room Wise Seating Plan', 14, 14)
    doc.setFontSize(9)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 20)
    autoTable(doc, {
      startY: 26,
      head: [
        ['Date', 'Session', 'Exam Type', 'Room', 'Block', 'Capacity', 'Invigilator', 'Status'],
      ],
      body: roomSeatingPlan.map(i => [
        formatDate(i.date),
        i.session,
        formatExamType(i.examType),
        i.hallNo,
        i.block,
        i.capacity || '-',
        i.lecturerName || '-',
        i.assigned ? i.availability || 'Pending' : 'Unassigned',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [5, 150, 105], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 253, 250] },
      margin: { left: 10, right: 10 },
    })
    doc.save(`seating-plan-${Date.now()}.pdf`)
  }

  const exportLecturerRegisterExcel = () => {
    const ws = utils.json_to_sheet(
      lecturerDutySummary.map((i, idx) => ({
        SNo: idx + 1,
        Lecturer: i.name,
        Designation: i.designation || 'Lecturer',
        TotalDuties: i.totalDuties,
        ActiveDays: i.activeDays,
        Pending: i.pending,
        Available: i.available,
        Unavailable: i.unavailable,
        Rooms: i.rooms.join(', '),
      }))
    )
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Lecturer Register')
    writeFile(wb, `lecturer-duty-register-${Date.now()}.xlsx`)
  }

  // ── Tabs config ───────────────────────────────────────────────────────────
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={15} /> },
    { id: 'schedule', label: 'Schedule', icon: <CalendarRange size={15} /> },
    { id: 'duties', label: 'Duties', icon: <ListChecks size={15} />, badge: duties.length },
    {
      id: 'seating',
      label: 'Seating Plan',
      icon: <MapPin size={15} />,
      badge: unassignedCount || null,
    },
    {
      id: 'availability',
      label: 'Availability',
      icon: <CalendarCheck size={15} />,
      badge: unavailCount,
    },
    { id: 'lecturers', label: 'Lecturers', icon: <UserSquare2 size={15} /> },
  ]

  

  const exportLecturerWisePdf = () => {
    console.log('allDuties at export time:', allDuties.length)

    const uniqueDates = [
      ...new Set(
        allDuties.filter(d => d.examScheduleId?.date).map(d => formatDate(d.examScheduleId.date))
      ),
    ].sort()
    console.log('uniqueDates:', uniqueDates) 
    console.log('allDuties sample:', allDuties[0]?.examScheduleId)

    if (uniqueDates.length === 0) {
      toast.error('No duty data available to export')
      return
    }

    // From - To date range
    const fromDate = uniqueDates[0]
    const toDate = uniqueDates[uniqueDates.length - 1]

    // Lookup: lecturerId → date → session → hallNo
    const lookup = {}
    allDuties.forEach(d => {
      const lid = String(d.lecturerId?._id || d.lecturerId?.id || d.lecturerId)
      const date = d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : null
      const session = d.examScheduleId?.session
      const hall = d.examScheduleId?.hallNo || '✓'

      if (!lid || !date || !session) return

      if (!lookup[lid]) lookup[lid] = {}
      if (!lookup[lid][date]) lookup[lid][date] = {}

      lookup[lid][date][session] = hall
    })

    const doc = new jsPDF({ orientation: 'landscape' })

    // ── Title block ──────────────────────────────────────────────
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Lecturer-Wise Invigilation Duty Register', 14, 13)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)

    doc.text(`Exam Period : ${fromDate}  to  ${toDate}`, 14, 21)

    doc.text(
      `Total Lecturers: ${lecturers.length}   |   Total Duties: ${allDuties.length}   |   Exam Days: ${uniqueDates.length}`,
      14,
      27
    )

    doc.setTextColor(0)

    // ── Header Row 1 ─────────────────────────────────────────────
    // Removed "Designation" column
    const headerRow1 = [
      {
        content: 'S.No',
        rowSpan: 2,
        styles: { halign: 'center', valign: 'middle' },
      },
      {
        content: 'Lecturer',
        rowSpan: 2,
        styles: { valign: 'middle' },
      },

      ...uniqueDates.map(date => ({
        content: date,
        colSpan: 4,
        styles: { halign: 'center' },
      })),

      {
        content: 'Total',
        rowSpan: 2,
        styles: { halign: 'center', valign: 'middle' },
      },
    ]

    // ── Header Row 2 ─────────────────────────────────────────────
    const headerRow2 = uniqueDates.flatMap(() => [
      { content: 'FN', styles: { halign: 'center' } },
      { content: 'Sig', styles: { halign: 'center', textColor: [120, 120, 120] } },
      { content: 'AN', styles: { halign: 'center' } },
      { content: 'Sig', styles: { halign: 'center', textColor: [120, 120, 120] } },
    ])

    // ── Body ─────────────────────────────────────────────────────
    const body = lecturers.map((l, i) => {
      const lid = String(l.id || l._id)
      const dutyMap = lookup[lid] || {}

      let total = 0

      const cells = uniqueDates.flatMap(date => {
        const fn = dutyMap[date]?.FN || '—'
        const an = dutyMap[date]?.AN || '—'

        if (fn !== '—') total++
        if (an !== '—') total++

        return [
          {
            content: fn,
            styles: {
              halign: 'center',
              fontStyle: fn !== '—' ? 'bold' : 'normal',
              textColor: fn !== '—' ? [30, 64, 175] : [200, 200, 200],
            },
          },
          {
            content: '',
            styles: {
              fillColor: fn !== '—' ? [239, 246, 255] : [250, 250, 250],
            },
          },
          {
            content: an,
            styles: {
              halign: 'center',
              fontStyle: an !== '—' ? 'bold' : 'normal',
              textColor: an !== '—' ? [5, 150, 105] : [200, 200, 200],
            },
          },
          {
            content: '',
            styles: {
              fillColor: an !== '—' ? [240, 253, 244] : [250, 250, 250],
            },
          },
        ]
      })

      return [
        {
          content: i + 1,
          styles: { halign: 'center' },
        },

        {
          content: l.name,
        },

        ...cells,

        {
          content: total || '—',
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            textColor: total > 0 ? [30, 64, 175] : [180, 180, 180],
          },
        },
      ]
    })

    // ── Table ────────────────────────────────────────────────────
    autoTable(doc, {
      startY: 33,
      head: [headerRow1, headerRow2],
      body,

      styles: {
        fontSize: 7,
        cellPadding: 2.5,
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
      },

      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7.5,
      },

      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },

      // Adjusted column widths after removing Designation
      columnStyles: {
        0: { cellWidth: 10 }, // S.No
        1: { cellWidth: 42 }, // Lecturer
      },

      margin: { left: 7, right: 7 },
      tableWidth: 'auto',
      rowPageBreak: 'avoid',
    })

    // ── Page numbers ─────────────────────────────────────────────
    const pages = doc.getNumberOfPages()

    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)

      doc.setFontSize(8)
      doc.setTextColor(160)

      doc.text(
        `Page ${i} of ${pages}`,
        doc.internal.pageSize.width - 10,
        doc.internal.pageSize.height - 5,
        { align: 'right' }
      )
    }

    doc.save(`lecturer-wise-duty-register-${fromDate}-to-${toDate}.pdf`)
  }

  // ──────────────────────────────────────────────────────────────
  // Lecturer Individual Duty PDF
  // Updated Header with:
  // 1. Dynamic Exam Type
  // 2. Dynamic Date Range
  // 3. Fully Centered Header
  // ──────────────────────────────────────────────────────────────

  const exportLecturerIndividualPdf = () => {
    if (allDuties.length === 0) {
      toast.error('No duty data available to export')
      return
    }

    // ── Dynamic Exam Type ─────────────────────────────
    const examTypes = [
      ...new Set(
        allDuties.map(d => d.examScheduleId?.examType || d.examScheduleId?.subject).filter(Boolean)
      ),
    ]

    const examTypeText =
      examTypes.length === 1
        ? formatExamType(examTypes[0])
        : examTypes.map(t => formatExamType(t)).join(', ')

    // ── Dynamic Date Range ────────────────────────────
    const uniqueDates = [
      ...new Set(
        allDuties.filter(d => d.examScheduleId?.date).map(d => formatDate(d.examScheduleId.date))
      ),
    ].sort()

    const fromDate = uniqueDates[0] || '—'
    const toDate = uniqueDates[uniqueDates.length - 1] || '—'

    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()

    // ── Main Title ────────────────────────────────────
    doc.setFontSize(17)
    doc.setFont('helvetica', 'bold')

    doc.text('Lecturer Individual Duty Report', pageWidth / 2, 16, { align: 'center' })

    // ── Exam Type ─────────────────────────────────────
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')

    doc.text(`Exam Type : ${examTypeText}`, pageWidth / 2, 25, { align: 'center' })

    // ── Date Range ────────────────────────────────────
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80)

    doc.text(`Exam Period : ${fromDate}  to  ${toDate}`, pageWidth / 2, 32, { align: 'center' })

    // ── Generated Time ────────────────────────────────
    doc.text(`Generated : ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: 'center' })

    doc.setTextColor(0)

    let startY = 48

    lecturers.forEach((lecturer, index) => {
      const lecturerDuties = allDuties.filter(
        d =>
          String(d.lecturerId?._id || d.lecturerId?.id || d.lecturerId) ===
          String(lecturer.id || lecturer._id)
      )

      // Skip lecturers without duties
      if (lecturerDuties.length === 0) return

      // ── Page Break ─────────────────────────────────
      if (startY > 240) {
        doc.addPage()
        startY = 20
      }

      // ── Lecturer Header ───────────────────────────
      doc.setFillColor(30, 64, 175)

      doc.roundedRect(14, startY - 6, 182, 10, 2, 2, 'F')

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255)

      doc.text(
        `${index + 1}. ${lecturer.name} ${lecturer.designation ? `(${lecturer.designation})` : ''}`,
        18,
        startY
      )

      doc.setTextColor(0)

      // ── Lecturer Duties Table ─────────────────────
      autoTable(doc, {
        startY: startY + 8,

        head: [['S.No', 'Date', 'Session', 'Exam Type', 'Hall', 'Availability']],

        body: lecturerDuties.map((duty, i) => [
          i + 1,

          duty.examScheduleId?.date ? formatDate(duty.examScheduleId.date) : '—',

          duty.examScheduleId?.session || '—',

          formatExamType(duty.examScheduleId?.examType || duty.examScheduleId?.subject || '—'),

          duty.examScheduleId?.hallNo || '—',

          duty.availability || 'Available',
        ]),

        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          valign: 'middle',
        },

        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        columnStyles: {
          0: {
            cellWidth: 12,
            halign: 'center',
          },

          1: {
            cellWidth: 28,
            halign: 'center',
          },

          2: {
            cellWidth: 20,
            halign: 'center',
          },

          3: {
            cellWidth: 55,
          },

          4: {
            cellWidth: 28,
            halign: 'center',
          },

          5: {
            cellWidth: 35,
            halign: 'center',
          },
        },

        margin: {
          left: 14,
          right: 14,
        },

        didDrawPage: () => {
          const pageCount = doc.getNumberOfPages()

          doc.setFontSize(8)
          doc.setTextColor(150)

          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
            doc.internal.pageSize.width - 14,
            doc.internal.pageSize.height - 6,
            { align: 'right' }
          )
        },
      })

      // ── Next Section Position ─────────────────────
      startY = doc.lastAutoTable.finalY + 14
    })

    doc.save(`lecturer-individual-duty-report-${Date.now()}.pdf`)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Admin · Invigilation">
          <div className="min-h-screen bg-slate-50">
            {/* ── Page Header ── */}
            <div className="border-b border-slate-200 bg-white px-6 py-5">
              <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600">
                    <Shield size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg leading-none font-black text-slate-800">
                      Invigilation Management
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                      Generate schedules · Assign duties · Track availability
                    </p>
                  </div>
                </div>
                <Btn variant="outline" onClick={() => fetchAll(filters)} loading={loading}>
                  <RefreshCw size={14} />
                  Refresh
                </Btn>
              </div>

              {/* Tab Navigation */}
              <div className="mx-auto mt-5 flex max-w-screen-2xl gap-1">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                  >
                    {t.icon}
                    {t.label}
                    {t.badge ? (
                      <span
                        className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeTab === t.id ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}
                      >
                        {t.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="mx-auto max-w-screen-2xl space-y-6 p-6">
              {/* ══════════ OVERVIEW TAB ══════════ */}
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    <StatCard
                      label="Lecturers"
                      value={lecturers.length}
                      icon={<Users size={16} />}
                      color="blue"
                    />
                    <StatCard
                      label="Rooms"
                      value={rooms.length}
                      icon={<School size={16} />}
                      color="emerald"
                    />
                    <StatCard
                      label="Exam Slots"
                      value={exams.length}
                      icon={<Calendar size={16} />}
                      color="indigo"
                    />
                    <StatCard
                      label="Duties"
                      value={duties.length}
                      icon={<ClipboardCheck size={16} />}
                      color="violet"
                    />
                  </div>

                  <div className="grid gap-5 xl:grid-cols-3">
                    {/* Quick assign */}
                    <Card className="xl:col-span-1">
                      <SectionHeader
                        icon={<ClipboardCheck size={16} />}
                        title="Manual Duty Assignment"
                        subtitle="Map a lecturer to an exam slot"
                      />
                      <form onSubmit={onAssignDuty} className="space-y-4 p-5">
                        <Field label="Exam Slot">
                          <Select
                            icon={<Calendar size={14} />}
                            required
                            value={dutyForm.examScheduleId}
                            onChange={e =>
                              setDutyForm(s => ({ ...s, examScheduleId: e.target.value }))
                            }
                          >
                            <option value="">Choose exam slot…</option>
                            {exams.map(e => (
                              <option key={e._id} value={e._id}>
                                {formatDate(e.date)} · {e.session} ·{' '}
                                {formatExamType(e.examType || e.subject)} · Hall {e.hallNo}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Field label="Lecturer">
                          <Select
                            icon={<GraduationCap size={14} />}
                            required
                            value={dutyForm.lecturerId}
                            onChange={e => setDutyForm(s => ({ ...s, lecturerId: e.target.value }))}
                          >
                            <option value="">Choose lecturer…</option>

                            {lecturers.map((l, i) => (
                              <option key={l._id || l.id || i} value={l._id || l.id}>
                                {l.name}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Btn type="submit" variant="violet" className="w-full justify-center">
                          <ClipboardCheck size={14} />
                          Assign Duty
                        </Btn>
                      </form>
                    </Card>

                    {/* Room management */}
                    <Card className="xl:col-span-2">
                      <SectionHeader
                        icon={<School size={16} />}
                        title="Room Management"
                        subtitle="Add and manage exam halls"
                      />
                      <form onSubmit={onCreateRoom} className="space-y-4 p-5">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Room Name">
                            <Input
                              placeholder="e.g. Hall A"
                              required
                              value={roomForm.name}
                              onChange={e => setRoomForm(s => ({ ...s, name: e.target.value }))}
                            />
                          </Field>
                          <Field label="Block">
                            <Input
                              placeholder="e.g. Main Block"
                              value={roomForm.block}
                              onChange={e => setRoomForm(s => ({ ...s, block: e.target.value }))}
                            />
                          </Field>
                          <Field label="Capacity">
                            <Input
                              placeholder="e.g. 30"
                              type="number"
                              min="1"
                              value={roomForm.capacity}
                              onChange={e => setRoomForm(s => ({ ...s, capacity: e.target.value }))}
                            />
                          </Field>
                        </div>
                        <div className="flex gap-2">
                          <Btn type="submit" variant="emerald">
                            <School size={14} />
                            {editingRoomId ? 'Update Room' : 'Add Room'}
                          </Btn>
                          {editingRoomId && (
                            <Btn
                              variant="outline"
                              onClick={() => {
                                setEditingRoomId('')
                                setRoomForm({ name: '', block: '', capacity: '' })
                              }}
                            >
                              Cancel
                            </Btn>
                          )}
                        </div>
                      </form>

                      {rooms.length > 0 && (
                        <div className="overflow-x-auto border-t border-slate-100">
                          <table className="min-w-full text-sm">
                            <TableHead cols={['Room', 'Block', 'Capacity', 'Actions']} />
                            <tbody className="divide-y divide-slate-50">
                              {rooms.map((room, i) => (
                                <tr
                                  key={room._id}
                                  className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                                >
                                  <td className="px-5 py-3 font-semibold text-slate-700">
                                    {room.name}
                                  </td>
                                  <td className="px-5 py-3 text-slate-500">{room.block || '—'}</td>
                                  <td className="px-5 py-3 text-slate-500">
                                    {room.capacity || '—'}
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => onEditRoom(room)}
                                        className="rounded-lg p-1.5 text-amber-600 transition hover:bg-amber-50"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onDeleteRoom(room)}
                                        disabled={actionLoading === `room-delete-${room._id}`}
                                        className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Card>
                  </div>
                </>
              )}

              {/* ══════════ SCHEDULE TAB ══════════ */}
              {activeTab === 'schedule' && (
                <Card>
                  <SectionHeader
                    icon={<CalendarRange size={16} />}
                    title="Generate Exam Schedule"
                    subtitle="Bulk-create exam slots across all selected rooms and date range"
                  />
                  <form onSubmit={onCreateSchedule} className="space-y-6 p-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <Field label="From Date">
                        <Input
                          icon={<Calendar size={14} />}
                          type="date"
                          required
                          value={scheduleForm.fromDate}
                          onChange={e => setScheduleForm(s => ({ ...s, fromDate: e.target.value }))}
                        />
                      </Field>
                      <Field label="To Date">
                        <Input
                          icon={<Calendar size={14} />}
                          type="date"
                          required
                          value={scheduleForm.toDate}
                          onChange={e => setScheduleForm(s => ({ ...s, toDate: e.target.value }))}
                        />
                      </Field>
                      <Field label="Exam Type">
                        <Select
                          icon={<BookOpen size={14} />}
                          value={scheduleForm.examType}
                          onChange={e => setScheduleForm(s => ({ ...s, examType: e.target.value }))}
                        >
                          {EXAM_TYPES.map(t => (
                            <option key={t} value={t}>
                              {formatExamType(t)}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Session">
                        <Select
                          icon={<Clock size={14} />}
                          value={scheduleForm.session}
                          onChange={e => setScheduleForm(s => ({ ...s, session: e.target.value }))}
                        >
                          <option value="FN">FN · Forenoon</option>
                          <option value="AN">AN · Afternoon</option>
                          <option value="EN">EN · Evening</option>
                        </Select>
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Max Duties Per Lecturer">
                        <Input
                          icon={<Users size={14} />}
                          type="number"
                          min="1"
                          value={scheduleForm.maxDutiesPerLecturer}
                          onChange={e =>
                            setScheduleForm(s => ({ ...s, maxDutiesPerLecturer: e.target.value }))
                          }
                        />
                      </Field>
                      <Field label=" ">
                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={scheduleForm.sameDayNoRepeat}
                            onChange={e =>
                              setScheduleForm(s => ({ ...s, sameDayNoRepeat: e.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            <span className="block text-sm font-semibold text-slate-700">
                              FN/AN Same Day No Repeat
                            </span>
                            <span className="block text-xs text-slate-400">
                              One duty per lecturer per day across all sessions
                            </span>
                          </span>
                        </label>
                      </Field>
                    </div>

                    <RoomPicker
                      rooms={rooms}
                      selectedRoomIds={scheduleForm.roomIds}
                      onToggleRoom={toggleRoom}
                      onSelectAll={toggleAllRooms}
                    />

                    {/* Preview metrics */}
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                      {[
                        {
                          label: 'Selected Rooms',
                          value: scheduleForm.roomIds.length,
                          color: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                        },
                        {
                          label: 'Total Days',
                          value: totalDays,
                          color: 'bg-blue-50 text-blue-700 border-blue-100',
                        },
                        {
                          label: 'Schedules to Create',
                          value: schedulePreviewCount,
                          color: 'bg-violet-50 text-violet-700 border-violet-100',
                        },
                        {
                          label: 'Lecturer Coverage',
                          value: lecturerCoverage,
                          color: hasCoverageGap
                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        },
                      ].map(m => (
                        <div key={m.label} className={`rounded-2xl border p-4 ${m.color}`}>
                          <p className="text-xs font-semibold opacity-70">{m.label}</p>
                          <p className="mt-1 text-2xl font-black">{m.value}</p>
                        </div>
                      ))}
                    </div>

                    {hasCoverageGap && (
                      <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        <AlertCircle size={16} /> Coverage gap detected — add more lecturers or
                        reduce workload limit.
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Btn type="submit" variant="primary" loading={scheduleLoading} size="lg">
                        <Layers3 size={15} />
                        Generate Schedule
                      </Btn>
                    </div>
                  </form>
                </Card>
              )}

              {/* ══════════ DUTIES TAB ══════════ */}
              {activeTab === 'duties' && (
                <Card>
                  {/* Filters bar */}
                  <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
                    <Field label="From Date">
                      <Input
                        icon={<Calendar size={13} />}
                        type="date"
                        value={filters.fromDate}
                        onChange={e => setFilters(s => ({ ...s, fromDate: e.target.value }))}
                      />
                    </Field>
                    <Field label="To Date">
                      <Input
                        icon={<Calendar size={13} />}
                        type="date"
                        value={filters.toDate}
                        onChange={e => setFilters(s => ({ ...s, toDate: e.target.value }))}
                      />
                    </Field>

                    <Field label="Lecturer">
                      <Select
                        icon={<Users size={13} />}
                        value={filters.lecturerId}
                        onChange={e => setFilters(s => ({ ...s, lecturerId: e.target.value }))}
                      >
                        <option value="">All Lecturers</option>
                        {lecturers.map(l => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Session">
                      <Select
                        icon={<Clock size={13} />}
                        value={filters.session}
                        onChange={e => setFilters(s => ({ ...s, session: e.target.value }))}
                      >
                        <option value="">All Sessions</option>
                        <option value="FN">FN</option>
                        <option value="AN">AN</option>
                        <option value="EN">EN</option>
                      </Select>
                    </Field>
                    <Btn variant="ghost" onClick={() => fetchAll(filters)}>
                      <Search size={14} />
                      Apply
                    </Btn>

                    <Field label="Max Duties">
                      <Input
                        type="number"
                        min="1"
                        value={scheduleForm.maxDutiesPerLecturer}
                        onChange={e => setScheduleForm(s => ({ ...s, maxDutiesPerLecturer: e.target.value }))}
                        style={{ width: '80px' }}
                      />
                    </Field>
                    <Btn variant="primary" onClick={onAutoAssign} loading={autoLoading}>
                      <Zap size={14} />
                      Auto Assign
                    </Btn>


                    <div className="ml-auto flex gap-2">
                      <Btn variant="outline" size="sm" onClick={exportExcel}>
                        <FileSpreadsheet size={13} />
                        Excel
                      </Btn>
                      <Btn variant="outline" size="sm" onClick={exportPdf}>
                        <FileText size={13} />
                        PDF
                      </Btn>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <TableHead
                        cols={[
                          '#',
                          'Date',
                          'Session',
                          'Exam Type',
                          'Hall',
                          'Lecturer',
                          'Availability',
                        ]}
                      />
                      <tbody className="divide-y divide-slate-50">
                        {duties.length === 0 ? (
                          <EmptyRow
                            cols={7}
                            icon={<ClipboardCheck size={32} />}
                            message="No duty assignments found"
                            sub="Generate schedules first, then use Auto Assign or manual assignment."
                          />
                        ) : (
                          duties.map((duty, i) => (
                            <tr
                              key={duty._id}
                              className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                            >
                              <td className="px-5 py-3 text-xs font-bold text-slate-400">
                                {i + 1}
                              </td>
                              <td className="px-5 py-3">
                                <span className="font-semibold text-slate-700">
                                  {duty.examScheduleId?.date
                                    ? formatDate(duty.examScheduleId.date)
                                    : '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <SessionChip session={duty.examScheduleId?.session || '—'} />
                              </td>
                              <td className="px-5 py-3 font-medium text-slate-700">
                                {formatExamType(
                                  duty.examScheduleId?.examType ||
                                    duty.examScheduleId?.subject ||
                                    '—'
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-600">
                                  {duty.examScheduleId?.hallNo || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-black text-indigo-700">
                                    {duty.lecturerId?.name?.[0]?.toUpperCase() || '?'}
                                  </div>
                                  <span className="font-semibold text-slate-700">
                                    {duty.lecturerId?.name || '—'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3">
                                <AvailChip value={duty.availability} />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {duties.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs font-medium text-slate-400">
                        {duties.length} duty assignments
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* ══════════ SEATING PLAN TAB ══════════ */}
              {activeTab === 'seating' && (
                <Card>
                  <SectionHeader
                    icon={<MapPin size={16} />}
                    title="Room-Wise Seating Plan"
                    subtitle="Daily hall schedule with capacity and invigilator coverage"
                    action={
                      <div className="flex gap-2">
                        <Btn variant="emerald" size="sm" onClick={exportSeatingPlanPdf}>
                          <FileText size={13} />
                          Print PDF
                        </Btn>
                        <Btn
                          variant="outline"
                          size="sm"
                          onClick={onDeleteAllSchedules}
                          loading={actionLoading === 'schedule-delete-all'}
                        >
                          <Trash2 size={13} />
                          Delete All
                        </Btn>
                      </div>
                    }
                  />

                  {/* Summary chips */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                    <Chip color="emerald">Assigned · {assignedCount}</Chip>
                    <Chip color={unassignedCount > 0 ? 'rose' : 'slate'}>
                      Unassigned · {unassignedCount}
                    </Chip>
                    <Chip color="indigo">
                      Total Seats · {roomSeatingPlan.reduce((s, i) => s + i.capacity, 0)}
                    </Chip>
                    {filters.date && <Chip color="amber">{filters.date}</Chip>}
                    {filters.session && <SessionChip session={filters.session} />}
                  </div>

                  <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-white px-5 py-4">
                    <Field label="Delete By Exam Type">
                      <Select
                        icon={<BookOpen size={13} />}
                        value={seatingDeleteExamType}
                        onChange={e => setSeatingDeleteExamType(e.target.value)}
                      >
                        <option value="">Select Exam Type</option>
                        {EXAM_TYPES.map(t => (
                          <option key={t} value={t}>
                            {formatExamType(t)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Btn
                      variant="danger"
                      size="sm"
                      onClick={onDeleteSchedulesByExamType}
                      loading={actionLoading === 'schedule-delete-exam-type'}
                    >
                      <Trash2 size={13} />
                      Delete Exam Type
                    </Btn>
                  </div>

                  {/* Inline edit form */}
                  {editingScheduleId && (
                    <form
                      onSubmit={onUpdateSingleSchedule}
                      className="grid gap-3 border-b border-slate-100 bg-indigo-50/40 px-5 py-4 md:grid-cols-5"
                    >
                      <Field label="Date">
                        <Input
                          type="date"
                          value={singleScheduleForm.date}
                          onChange={e =>
                            setSingleScheduleForm(s => ({ ...s, date: e.target.value }))
                          }
                          required
                        />
                      </Field>
                      <Field label="Session">
                        <Select
                          value={singleScheduleForm.session}
                          onChange={e =>
                            setSingleScheduleForm(s => ({ ...s, session: e.target.value }))
                          }
                        >
                          <option value="FN">FN</option>
                          <option value="AN">AN</option>
                          <option value="EN">EN</option>
                        </Select>
                      </Field>
                      <Field label="Exam Type">
                        <Select
                          value={singleScheduleForm.examType}
                          onChange={e =>
                            setSingleScheduleForm(s => ({ ...s, examType: e.target.value }))
                          }
                        >
                          {EXAM_TYPES.map(t => (
                            <option key={t} value={t}>
                              {formatExamType(t)}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Room">
                        <Select
                          value={singleScheduleForm.roomId}
                          onChange={e =>
                            setSingleScheduleForm(s => ({ ...s, roomId: e.target.value }))
                          }
                        >
                          <option value="">Choose room…</option>
                          {rooms.map(r => (
                            <option key={r._id} value={r._id}>
                              {r.name}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label=" ">
                        <div className="flex h-full items-center gap-2 pt-1">
                          <Btn
                            type="submit"
                            variant="emerald"
                            loading={actionLoading === `schedule-save-${editingScheduleId}`}
                          >
                            Save
                          </Btn>
                          <Btn variant="outline" onClick={resetScheduleEditor}>
                            Cancel
                          </Btn>
                        </div>
                      </Field>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <TableHead
                        cols={[
                          'Date',
                          'Session',
                          'Exam Type',
                          'Room',
                          'Block',
                          'Capacity',
                          'Invigilator',
                          'Status',
                          'Actions',
                        ]}
                      />
                      <tbody className="divide-y divide-slate-50">
                        {roomSeatingPlan.length === 0 ? (
                          <EmptyRow
                            cols={9}
                            icon={<School size={32} />}
                            message="No schedules found"
                            sub="Generate exam schedules first."
                          />
                        ) : (
                          roomSeatingPlan.map((item, i) => (
                            <tr
                              key={item.id}
                              className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                            >
                              <td className="px-5 py-3 font-semibold whitespace-nowrap text-slate-700">
                                {formatDate(item.date)}
                              </td>
                              <td className="px-5 py-3">
                                <SessionChip session={item.session} />
                              </td>
                              <td className="px-5 py-3 font-medium text-slate-700">
                                {formatExamType(item.examType)}
                              </td>
                              <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-600">
                                {item.hallNo}
                              </td>
                              <td className="px-5 py-3 text-slate-500">{item.block}</td>
                              <td className="px-5 py-3 font-semibold text-slate-700">
                                {item.capacity || '—'}
                              </td>
                              <td className="px-5 py-3 text-slate-700">
                                {item.lecturerName || <span className="text-slate-400">—</span>}
                              </td>
                              <td className="px-5 py-3">
                                {item.assigned ? (
                                  <AvailChip value={item.availability || 'Pending'} />
                                ) : (
                                  <Chip color="rose">Unassigned</Chip>
                                )}
                              </td>
                              <td className="px-5 py-3">
                                <div className="flex gap-1">
                                  <button
                                    type="button"
                                    onClick={() => onEditSchedule(item)}
                                    className="rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-50"
                                  >
                                    <Pencil size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteSchedule(item)}
                                    disabled={actionLoading === `schedule-delete-${item.id}`}
                                    className="rounded-lg p-1.5 text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* ══════════ LECTURERS TAB ══════════ */}
              {activeTab === 'lecturers' && (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <p className="text-xs font-semibold tracking-wide text-blue-500 uppercase">
                        Lecturers
                      </p>
                      <p className="mt-1 text-3xl font-black text-blue-700">
                        {lecturerDutySummary.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
                      <p className="text-xs font-semibold tracking-wide text-violet-500 uppercase">
                        Total Duties
                      </p>
                      <p className="mt-1 text-3xl font-black text-violet-700">
                        {lecturerDutySummary.reduce((s, i) => s + i.totalDuties, 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                      <p className="text-xs font-semibold tracking-wide text-amber-500 uppercase">
                        Pending
                      </p>
                      <p className="mt-1 text-3xl font-black text-amber-700">
                        {lecturerDutySummary.reduce((s, i) => s + i.pending, 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Btn variant="outline" onClick={exportLecturerRegisterExcel}>
                      <FileSpreadsheet size={14} />
                      Export Register Excel
                    </Btn>
                    <div className="flex justify-end gap-2">
                      <Btn variant="outline" onClick={exportLecturerRegisterExcel}>
                        <FileSpreadsheet size={14} />
                        Export Excel
                      </Btn>
                      <Btn variant="outline" onClick={exportLecturerWisePdf}>
                        <FileText size={14} />
                        Lecturer-Wise PDF
                      </Btn>
                      <Btn variant="outline" onClick={exportLecturerIndividualPdf}>
                        <FileText size={14} />
                        Individual Lecturer PDF
                      </Btn>
                    </div>
                  </div>

                  {lecturerDutySummary.length === 0 ? (
                    <Card className="px-4 py-16 text-center text-sm text-slate-400">
                      No lecturer duty data available for the current filters.
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {lecturerDutySummary.map(item => (
                        <Card key={item.id} className="p-5">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-black text-indigo-700">
                                {item.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <p className="leading-none font-bold text-slate-800">{item.name}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {item.designation || 'Lecturer'}
                                </p>
                              </div>
                            </div>
                            <Chip color={item.totalDuties > 0 ? 'indigo' : 'slate'}>
                              {item.totalDuties} duties
                            </Chip>
                          </div>

                          <div className="mb-4 grid grid-cols-4 gap-2">
                            {[
                              { label: 'Days', value: item.activeDays, color: 'text-slate-700' },
                              { label: 'Pending', value: item.pending, color: 'text-amber-700' },
                              {
                                label: 'Available',
                                value: item.available,
                                color: 'text-emerald-700',
                              },
                              {
                                label: 'Unavailable',
                                value: item.unavailable,
                                color: 'text-rose-700',
                              },
                            ].map(m => (
                              <div
                                key={m.label}
                                className="rounded-xl bg-slate-50 px-2 py-2.5 text-center"
                              >
                                <p className={`text-lg font-black ${m.color}`}>{m.value}</p>
                                <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                                  {m.label}
                                </p>
                              </div>
                            ))}
                          </div>

                          {item.rooms.length > 0 && (
                            <div>
                              <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                                Rooms
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {item.rooms.map(r => (
                                  <Chip key={r} color="indigo">
                                    {r}
                                  </Chip>
                                ))}
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
