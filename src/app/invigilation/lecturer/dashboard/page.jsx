//src/app/invigilation/lecturer/dashboard/page.jsx
'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  BookOpen,
  ClipboardList,
  BarChart3,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  ChevronDown,
  LayoutGrid,
  List,
} from 'lucide-react'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

// ─── Helper ──────────────────────────────────────────────────────────────────
function formatDate(date) {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ─── Local Design System ──────────────────────────────────────────────────────
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
    primary: { bg: 'bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', val: 'text-indigo-700' },
    success: { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', val: 'text-emerald-700' },
    warning: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', val: 'text-amber-700' },
    danger: { bg: 'bg-rose-50', icon: 'bg-rose-100 text-rose-600', val: 'text-rose-700' },
    neutral: { bg: 'bg-slate-50', icon: 'bg-slate-100 text-slate-600', val: 'text-slate-700' },
  }
  const p = palette[color] || palette.primary
  return (
    <div className={`rounded-2xl border border-slate-100 p-5 ${p.bg}`}>
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

function Chip({ children, color = 'slate' }) {
  const map = {
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    violet: 'bg-violet-100 text-violet-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    slate: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}>
      {children}
    </span>
  )
}

function SessionChip({ session }) {
  const map = { FN: 'amber', AN: 'blue', EN: 'violet', FULLDAY: 'indigo' }
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
  if (low === 'not available' || low === 'unavailable')
    return (
      <Chip color="rose">
        <XCircle size={10} />
        Not Available
      </Chip>
    )
  return (
    <Chip color="amber">
      <AlertCircle size={10} />
      {value}
    </Chip>
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

function StyledInput({ icon, ...props }) {
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

function StyledSelect({ icon, children, ...props }) {
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
      <ChevronDown size={13} className="pointer-events-none absolute top-3 right-3 text-slate-400" />
    </div>
  )
}

function Btn({ children, onClick, disabled, variant = 'primary', size = 'md', className = '', type = 'button' }) {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-5 py-3 text-sm' }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LecturerInvigilationDashboardPage() {
  // Responsive table-to-cards CSS
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @media (max-width: 1023px) {
        .responsive-table thead { display: none !important; }
        .responsive-table tbody,
        .responsive-table tr,
        .responsive-table td { display: block !important; width: 100% !important; }
        .responsive-table tr { 
          border: 1px solid #e2e8f0; 
          border-radius: 0.75rem; 
          margin-bottom: 0.75rem; 
          background: white;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .responsive-table tr:nth-child(even) { background: #f8fafc; }
        .responsive-table td { 
          padding: 0.75rem 1rem !important; 
          border: none !important; 
          border-bottom: 1px solid #f1f5f9 !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          min-height: 2.5rem;
        }
        .responsive-table td:last-child { border-bottom: none !important; }
        .responsive-table td::before { 
          content: attr(data-label); 
          font-weight: 600; 
          font-size: 0.7rem; 
          text-transform: uppercase; 
          letter-spacing: 0.05em; 
          color: #64748b; 
          margin-right: 1rem;
          flex-shrink: 0;
        }
        .responsive-table td[data-label="Actions"] { 
          justify-content: flex-end !important; 
          padding-top: 1rem !important; 
          border-top: 1px solid #e2e8f0 !important;
          background: #f8fafc;
          border-radius: 0 0 0.75rem 0.75rem;
        }
        .responsive-table td[data-label="Actions"]::before { display: none !important; }
        .responsive-table .footer-row { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])
  const [availabilityDate, setAvailabilityDate] = useState('')
  const [availabilitySession, setAvailabilitySession] = useState('FN')
  const [availabilityReason, setAvailabilityReason] = useState('')
  const [duties, setDuties] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingAvail, setSavingAvail] = useState(false)
  const [viewMode, setViewMode] = useState('auto') // 'auto' | 'cards' | 'table'
  const [isMobileScreen, setIsMobileScreen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const effectiveView = viewMode === 'auto' ? (isMobileScreen ? 'cards' : 'table') : viewMode

  const fetchData = async () => {
    setLoading(true)
    try {
      const [dRes, sRes] = await Promise.all([
        fetch('/api/invigilation/duties', { cache: 'no-store' }),
        fetch('/api/invigilation/duties/monthly-summary', { cache: 'no-store' }),
      ])
      const [dData, sData] = await Promise.all([dRes.json(), sRes.json()])
      if (!dRes.ok || !sRes.ok)
        throw new Error(dData.message || sData.message || 'Failed to load')
      setDuties(dData.data || [])
      setSummary(sData.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const markAvailability = async (dutyId, availability) => {
    try {
      const res = await fetch(`/api/invigilation/duties/${dutyId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Update failed')
      toast.success('Availability updated')
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Update failed')
    }
  }

  const saveAvailability = async () => {
    if (!availabilityDate) {
      toast.error('Select a date')
      return
    }
    setSavingAvail(true)
    try {
      const res = await fetch('/api/invigilation/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: availabilityDate,
          session: availabilitySession,
          status: 'NOT_AVAILABLE',
          reason: availabilityReason,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed')
      toast.success('Availability saved')
      setAvailabilityDate('')
      setAvailabilitySession('FN')
      setAvailabilityReason('')
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setSavingAvail(false)
    }
  }

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalDuties = duties.length
  const availableDuties = duties.filter(d => d.availability?.toLowerCase() === 'available').length
  const notAvailDuties = duties.filter(
    d => d.availability?.toLowerCase() === 'not available' || d.availability?.toLowerCase() === 'unavailable'
  ).length
  const pendingDuties = totalDuties - availableDuties - notAvailDuties

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <InvigilationGuard allowRoles={['lecturer']}>
      {user => (
        <InvigilationShell user={user} title="Lecturer · Invigilation" >
          <div className="min-h-screen bg-slate-50">

            {/* ── Page Header ── */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600">
                    <GraduationCap size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg leading-none font-black text-slate-800">
                      My Invigilation Duties
                    </h1>
                    <p className="mt-1 text-xs text-slate-400">
                      View duties · Mark availability · Track schedule
                    </p>
                  </div>
                </div>
                <Btn variant="outline" onClick={fetchData} disabled={loading} className="w-full justify-center sm:w-auto">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </Btn>
              </div>
            </div>

            <div className="mx-auto max-w-7xl space-y-5 p-4 sm:space-y-6 sm:p-6">

              {/* ── Stat Cards ── */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard label="Total Duties" value={totalDuties} icon={<ClipboardList size={16} />} color="primary" />
                <StatCard label="Available" value={availableDuties} icon={<CheckCircle2 size={16} />} color="success" />
                <StatCard label="Not Available" value={notAvailDuties} icon={<XCircle size={16} />} color="danger" />
                <StatCard label="Pending" value={pendingDuties} icon={<AlertCircle size={16} />} color="warning" />
              </div>

              {/* ── Manage Availability ── */}
              <Card>
                <SectionHeader
                  icon={<CalendarDays size={16} />}
                  title="Manage Availability"
                  subtitle="Mark yourself as not available for a specific date & session"
                />
                <div className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Field label="Date">
                      <StyledInput
                        type="date"
                        icon={<CalendarDays size={14} />}
                        value={availabilityDate}
                        onChange={e => setAvailabilityDate(e.target.value)}
                      />
                    </Field>
                    <Field label="Session">
                      <StyledSelect
                        icon={<Clock size={14} />}
                        value={availabilitySession}
                        onChange={e => setAvailabilitySession(e.target.value)}
                      >
                        <option value="FN">FN · Forenoon</option>
                        <option value="AN">AN · Afternoon</option>
                        <option value="EN">EN · Evening</option>
                        <option value="FULLDAY">Full Day</option>
                      </StyledSelect>
                    </Field>
                    <Field label="Reason (optional)">
                      <StyledInput
                        type="text"
                        placeholder="e.g. Medical leave"
                        value={availabilityReason}
                        onChange={e => setAvailabilityReason(e.target.value)}
                      />
                    </Field>
                    <Field label=" ">
                      <Btn
                        variant="danger"
                        onClick={saveAvailability}
                        disabled={savingAvail}
                        className="w-full justify-center"
                      >
                        <XCircle size={14} />
                        {savingAvail ? 'Saving…' : 'Mark Not Available'}
                      </Btn>
                    </Field>
                  </div>
                </div>
              </Card>

              {/* ── Assigned Duties ── */}
              <Card>
                <SectionHeader
                  icon={<ClipboardList size={16} />}
                  title="Assigned Duties"
                  subtitle="Your exam invigilation schedule"
                  action={
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setViewMode('cards')}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                            effectiveView === 'cards'
                              ? 'bg-white text-indigo-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <LayoutGrid size={12} />
                          Cards
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode('table')}
                          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
                            effectiveView === 'table'
                              ? 'bg-white text-indigo-700 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <List size={12} />
                          Table
                        </button>
                      </div>
                      <Chip color={duties.length > 0 ? 'indigo' : 'slate'}>
                        {duties.length} duties
                      </Chip>
                    </div>
                  }
                />

                {/* Table View (Active on Desktop or when Table selected) */}
                {effectiveView === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm responsive-table" role="table">
                      <thead className="hidden lg:table-header-group">
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          {['#', 'Date', 'Session', 'Subject', 'Hall', 'Availability', 'Actions'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-bold tracking-wide whitespace-nowrap text-slate-400 uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {duties.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <ClipboardList size={32} className="opacity-30" />
                                <p className="text-sm font-medium">
                                  {loading ? 'Loading duties…' : 'No duties assigned yet'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          duties.map((d, i) => (
                            <tr key={d._id} className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} lg:table-row`}>
                              <td className="px-5 py-3 text-xs font-bold text-slate-400 lg:table-cell" data-label="#">{i + 1}</td>
                              <td className="px-5 py-3 font-semibold whitespace-nowrap text-slate-700 lg:table-cell" data-label="Date">
                                <span className="inline-flex items-center gap-1.5">
                                  <CalendarDays size={13} className="text-indigo-400" />
                                  {d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap lg:table-cell" data-label="Session">
                                <SessionChip session={d.examScheduleId?.session || '—'} />
                              </td>
                              <td className="px-5 py-3 font-medium text-slate-700 max-w-xs truncate lg:table-cell" data-label="Subject" title={d.examScheduleId?.subject || ''}>
                                {d.examScheduleId?.subject || '—'}
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap lg:table-cell" data-label="Hall">
                                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                                  <MapPin size={11} className="text-slate-400" />
                                  {d.examScheduleId?.hallNo || '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap lg:table-cell" data-label="Availability">
                                <AvailChip value={d.availability} />
                              </td>
                              <td className="px-5 py-3 whitespace-nowrap lg:table-cell" data-label="Actions">
                                <div className="flex items-center gap-2">
                                  <Btn size="sm" variant="emerald" onClick={() => markAvailability(d._id, 'Available')}>
                                    <CheckCircle2 size={12} />
                                    Available
                                  </Btn>
                                  <Btn size="sm" variant="danger" onClick={() => markAvailability(d._id, 'Not Available')}>
                                    <XCircle size={12} />
                                    Not Available
                                  </Btn>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                    {duties.length > 0 && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-xs font-medium text-slate-400 hidden lg:block footer-row">
                        Showing {duties.length} duty {duties.length === 1 ? 'assignment' : 'assignments'}
                      </div>
                    )}
                  </div>
                )}

                {/* Cards View (Active on Mobile/Tablets or when Cards selected) */}
                {effectiveView === 'cards' && (
                  <div className="space-y-3 p-3 sm:p-4 bg-slate-50/50">
                    {duties.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                        <ClipboardList size={28} className="opacity-30" />
                        <p className="text-sm">{loading ? 'Loading duties…' : 'No duties assigned yet'}</p>
                      </div>
                    ) : (
                      duties.map((d, idx) => (
                        <div key={d._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                          {/* Card Header: Index, Date & Session */}
                          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">
                                #{idx + 1}
                              </span>
                              <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                <CalendarDays size={14} className="text-indigo-500" />
                                {d.examScheduleId?.date ? formatDate(d.examScheduleId.date) : '—'}
                              </span>
                            </div>
                            <SessionChip session={d.examScheduleId?.session || '—'} />
                          </div>

                          {/* Card Details */}
                          <div className="mb-3.5 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="font-semibold tracking-wide text-slate-400 uppercase">Subject</p>
                              <p className="mt-0.5 font-semibold text-slate-800 wrap-break-word">{d.examScheduleId?.subject || '—'}</p>
                            </div>
                            <div>
                              <p className="font-semibold tracking-wide text-slate-400 uppercase">Hall / Room</p>
                              <p className="mt-0.5 inline-flex items-center gap-1 font-mono font-bold text-slate-800">
                                <MapPin size={12} className="text-slate-400" />
                                {d.examScheduleId?.hallNo || '—'}
                              </p>
                            </div>
                            <div className="col-span-2 pt-1 border-t border-slate-50">
                              <p className="font-semibold tracking-wide text-slate-400 uppercase mb-1">Status</p>
                              <AvailChip value={d.availability} />
                            </div>
                          </div>

                          {/* Card Actions: Quick buttons */}
                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => markAvailability(d._id, 'Available')}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                            >
                              <CheckCircle2 size={13} /> Available
                            </button>
                            <button
                              type="button"
                              onClick={() => markAvailability(d._id, 'Not Available')}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 active:scale-95"
                            >
                              <XCircle size={13} /> Not Available
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* ── Monthly Duty Summary ── */}
              <Card>
                <SectionHeader
                  icon={<BarChart3 size={16} />}
                  title="Monthly Duty Summary"
                  subtitle="Month-wise breakdown of your duty status"
                />

                {/* Table View */}
                {effectiveView === 'table' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80">
                          {['Month', 'Total', 'Available', 'Not Available', 'Pending'].map(h => (
                            <th key={h} className="px-5 py-3 text-left text-xs font-bold tracking-wide whitespace-nowrap text-slate-400 uppercase">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {summary.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-16 text-center">
                              <div className="flex flex-col items-center gap-2 text-slate-400">
                                <BarChart3 size={32} className="opacity-30" />
                                <p className="text-sm font-medium">
                                  {loading ? 'Loading summary…' : 'No monthly summary available'}
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          summary.map((row, i) => (
                            <tr key={row.month} className={`transition-colors hover:bg-slate-50 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}>
                              <td className="px-5 py-3 font-bold text-slate-800">{row.month}</td>
                              <td className="px-5 py-3">
                                <Chip color="indigo">{row.total}</Chip>
                              </td>
                              <td className="px-5 py-3">
                                <Chip color="emerald">
                                  <CheckCircle2 size={10} />
                                  {row.available}
                                </Chip>
                              </td>
                              <td className="px-5 py-3">
                                <Chip color="rose">
                                  <XCircle size={10} />
                                  {row.notAvailable}
                                </Chip>
                              </td>
                              <td className="px-5 py-3">
                                <Chip color="amber">
                                  <AlertCircle size={10} />
                                  {row.pending}
                                </Chip>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cards View */}
                {effectiveView === 'cards' && (
                  <div className="space-y-3 p-3 sm:p-4 bg-slate-50/50">
                    {summary.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
                        <BarChart3 size={28} className="opacity-30" />
                        <p className="text-sm">{loading ? 'Loading summary…' : 'No monthly summary available'}</p>
                      </div>
                    ) : (
                      summary.map(row => (
                        <div key={row.month} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                          <p className="mb-3 font-bold text-slate-800">{row.month}</p>
                          <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="rounded-xl bg-indigo-50 p-3">
                              <p className="text-xl font-black text-indigo-700">{row.total}</p>
                              <p className="mt-0.5 font-semibold text-indigo-400 uppercase tracking-wide">Total</p>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-3">
                              <p className="text-xl font-black text-emerald-700">{row.available}</p>
                              <p className="mt-0.5 font-semibold text-emerald-500 uppercase tracking-wide">Avail</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 p-3">
                              <p className="text-xl font-black text-rose-700">{row.notAvailable}</p>
                              <p className="mt-0.5 font-semibold text-rose-400 uppercase tracking-wide">N/A</p>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-3">
                              <p className="text-xl font-black text-amber-700">{row.pending}</p>
                              <p className="mt-0.5 font-semibold text-amber-500 uppercase tracking-wide">Pending</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
