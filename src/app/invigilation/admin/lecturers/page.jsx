//src/app/invigilation/admin/lecturers/page.jsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  UserPlus,
  GraduationCap,
  Phone,
  Shield,
  Plus,
  Users,
  Pencil,
  Trash2,
  FileDown,
} from 'lucide-react'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}
function CardHeader({ icon, title, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    slate: 'bg-slate-100 text-slate-600',
  }
}
function FormInput({ label, icon, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label ? <label className="text-xs font-semibold text-slate-500">{label}</label> : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-2.5 left-3 text-slate-400">{icon}</span>
        ) : null}
        <input
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 text-sm text-slate-700 placeholder-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none ${icon ? 'pl-9' : 'pl-3'}`}
          {...props}
        />
      </div>
    </div>
  )
}

function SubmitBtn({ children, color = 'blue', loading }) {
  const colors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
  }

  return (
    <button
      type="submit"
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${colors[color]}`}
      disabled={loading}
    >
      {children}
    </button>
  )
}

export default function LecturersPage() {
  const [lecturers, setLecturers] = useState([])

  const [loading, setLoading] = useState(false)
  const [editingLecturerId, setEditingLecturerId] = useState('')

  const [actionLoading, setActionLoading] = useState('')

  const [lecturerForm, setLecturerForm] = useState({
    name: '',
    subject: '',
    phone: '',
    password: '',
  })

  const onCreateLecturer = async e => {
    e.preventDefault()

    try {
      const isEditing = Boolean(editingLecturerId)

      const res = await fetch(
        isEditing
          ? `/api/invigilation/lecturers/${editingLecturerId}`
          : '/api/invigilation/lecturers',

        {
          method: isEditing ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(lecturerForm),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success(
        isEditing
          ? 'Lecturer updated'
          : `Lecturer added.
Login: ${data.loginId}
Pass: ${data.tempPassword}`
      )

      setLecturerForm({
        name: '',
        subject: '',
        phone: '',
        password: '',
      })

      setEditingLecturerId('')

      loadLecturers()
    } catch (err) {
      toast.error(err.message || 'Failed')
    }
  }

  const onEditLecturer = lecturer => {
    setEditingLecturerId(lecturer.id)

    setLecturerForm({
      name: lecturer.name || '',

      subject: lecturer.subject || lecturer.designation || '',

      phone: lecturer.phone || '',

      password: '',
    })
  }

  const onDeleteLecturer = async lecturer => {
    if (!window.confirm(`Delete ${lecturer.name}?`)) return

    setActionLoading(lecturer.id)

    try {
      const res = await fetch(`/api/invigilation/lecturers/${lecturer.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success('Lecturer deleted')

      loadLecturers()
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setActionLoading('')
    }
  }

  const loadLecturers = useCallback(async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/invigilation/lecturers', {
        cache: 'no-store',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      setLecturers(data.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load lecturers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLecturers()
  }, [loadLecturers])

  // exportPdf function — LecturersPage లో add చేయండి
  const exportPdf = () => {
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Invigilators List', 14, 15)

    autoTable(doc, {
      startY: 22,
      head: [['S.No', 'Name', 'Subject', 'Phone']],
      body: lecturers.map((item, index) => [
        index + 1,
        item.name,
        item.subject || item.designation,
        item.phone,
      ]),
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      styles: { fontSize: 10 },
    })

    doc.save('lecturers.pdf')
  }

  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Lecturer Management">
          <div className="p-6">
            <div className="grid gap-5 xl:grid-cols-[400px_1fr]">
              <Card>
                <CardHeader
                  icon={<UserPlus size={16} />}
                  title="Add Lecturer"
                  subtitle="Register a new invigilator"
                  color="blue"
                />

                <form onSubmit={onCreateLecturer} className="space-y-3 p-5">
                  <FormInput
                    label="Full Name"
                    icon={<GraduationCap size={14} />}
                    placeholder="e.g. Dr. K. Ramesh"
                    required
                    value={lecturerForm.name}
                    onChange={e =>
                      setLecturerForm(s => ({
                        ...s,
                        name: e.target.value,
                      }))
                    }
                  />

                  <FormInput
                    label="Subject"
                    icon={<Shield size={14} />}
                    placeholder="e.g. Mathematics"
                    required
                    value={lecturerForm.subject}
                    onChange={e =>
                      setLecturerForm(s => ({
                        ...s,
                        subject: e.target.value,
                      }))
                    }
                  />

                  <FormInput
                    label="Phone"
                    icon={<Phone size={14} />}
                    placeholder="10-digit mobile"
                    required
                    value={lecturerForm.phone}
                    onChange={e =>
                      setLecturerForm(s => ({
                        ...s,
                        phone: e.target.value,
                      }))
                    }
                  />

                  <FormInput
                    label="Password"
                    icon={<Shield size={14} />}
                    placeholder="Leave blank for auto"
                    type="password"
                    value={lecturerForm.password}
                    onChange={e =>
                      setLecturerForm(s => ({
                        ...s,
                        password: e.target.value,
                      }))
                    }
                  />

                  <SubmitBtn color="blue" loading={loading}>
                    <Plus size={15} />

                    {editingLecturerId ? 'Update Lecturer' : 'Add Lecturer'}
                  </SubmitBtn>
                </form>
              </Card>

              <Card>
                <CardHeader
                  icon={<Users size={16} />}
                  title="Lecturers"
                  subtitle="Registered invigilators"
                  color="indigo"
                />

                <button
                  type="button"
                  onClick={exportPdf}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  <FileDown size={15} />
                  Export PDF
                </button>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-3 text-left">S.No</th>
                        <th className="px-5 py-3 text-left">Name</th>
                        <th className="px-5 py-3 text-left">Subject</th>
                        <th className="px-5 py-3 text-left">Phone</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {lecturers.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-5 py-3 text-slate-500">{index + 1}</td>
                          <td className="px-5 py-3">{item.name}</td>
                          <td className="px-5 py-3">{item.subject || item.designation}</td>
                          <td className="px-5 py-3">{item.phone}</td>

                          <td className="px-5 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => onEditLecturer(item)}
                                className="rounded-lg bg-amber-500 p-2 text-white"
                              >
                                <Pencil size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteLecturer(item)}
                                disabled={actionLoading === item.id}
                                className="rounded-lg bg-red-600 p-2 text-white"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
