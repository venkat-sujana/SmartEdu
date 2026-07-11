//src/app/admin-panel/settings/page.jsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'

const defaultSettings = {
  modules: {
    fee: {
      enabled: true,
      mode: 'automatic',
      startDate: '',
      endDate: '',
    },
    attendance: {
      enabled: true,
      mode: 'automatic',
      startDate: '',
      endDate: '',
    },
    exams: {
      enabled: true,
      mode: 'automatic',
      startDate: '',
      endDate: '',
    },
    admissions: {
      enabled: true,
      mode: 'automatic',
      startDate: '',
      endDate: '',
    },
    timetable: {
      enabled: true,
    },
  },
}

export default function SystemSettingsPage() {
  const { data: session, status } = useSession()
  const sessionCollegeId = session?.user?.collegeId || ''
  const isAdmin = session?.user?.role === 'admin'
  const [colleges, setColleges] = useState([])
  const [selectedCollegeId, setSelectedCollegeId] = useState('')
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ type: '', text: '' })
  const [settings, setSettings] = useState(defaultSettings)

  const effectiveCollegeId = useMemo(
    () => sessionCollegeId || selectedCollegeId,
    [sessionCollegeId, selectedCollegeId]
  )

  const handleChange = (module, field, value) => {
    setSettings(prev => ({
      ...prev,
      modules: {
        ...prev.modules,
        [module]: {
          ...prev.modules[module],
          [field]: value,
        },
      },
    }))
  }

  useEffect(() => {
    if (!isAdmin) return

    const loadColleges = async () => {
      try {
        const res = await fetch('/api/colleges')
        const data = await res.json()
        const nextColleges = Array.isArray(data) ? data : []
        setColleges(nextColleges)

        if (!sessionCollegeId && nextColleges.length > 0) {
          setSelectedCollegeId(prev => prev || nextColleges[0]._id)
        }
      } catch (error) {
        console.error(error)
        setFeedback({ type: 'error', text: 'Unable to load colleges.' })
      }
    }

    loadColleges()
  }, [isAdmin, sessionCollegeId])

  useEffect(() => {
    const loadSystemSettings = async () => {
      if (!effectiveCollegeId) {
        setSettings(defaultSettings)
        return
      }

      try {
        setLoadingSettings(true)
        setFeedback({ type: '', text: '' })

        const res = await fetch(`/api/settings?collegeId=${effectiveCollegeId}`)
        const data = await res.json()

        if (data.success && data.data?.modules) {
          setSettings({
            modules: {
              ...defaultSettings.modules,
              ...data.data.modules,
            },
          })
        } else {
          setSettings(defaultSettings)
        }
      } catch (error) {
        console.error(error)
        setFeedback({ type: 'error', text: 'Unable to load settings.' })
      } finally {
        setLoadingSettings(false)
      }
    }

    loadSystemSettings()
  }, [effectiveCollegeId])

  const saveSettings = async () => {
    if (status === 'loading') {
      setFeedback({ type: 'error', text: 'Please wait. Session is still loading.' })
      return
    }

    if (!effectiveCollegeId) {
      setFeedback({ type: 'error', text: 'Please select a college first.' })
      return
    }

    try {
      setSaving(true)
      setFeedback({ type: '', text: '' })

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collegeId: effectiveCollegeId,
          modules: settings.modules,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setFeedback({ type: 'success', text: 'Settings saved successfully.' })
      } else {
        setFeedback({ type: 'error', text: data.message || 'Unable to save settings.' })
      }
    } catch (error) {
      console.error(error)
      setFeedback({ type: 'error', text: 'Server error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">System Settings</h1>

      {isAdmin && !sessionCollegeId ? (
        <div className="mb-6 rounded-xl border bg-white p-4 shadow">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Select College</label>
          <select
            value={selectedCollegeId}
            onChange={event => setSelectedCollegeId(event.target.value)}
            className="w-full max-w-md rounded-lg border border-slate-300 p-3 outline-none"
          >
            <option value="">Select College</option>
            {colleges.map(college => (
              <option key={college._id} value={college._id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {feedback.text ? (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      <div className="rounded-xl border bg-white shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Fee Collection Settings</h2>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <label className="font-medium">Enable Fee Module</label>
            <input
              type="checkbox"
              checked={settings.modules.fee.enabled}
              onChange={e => handleChange('fee', 'enabled', e.target.checked)}
              disabled={loadingSettings}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Mode</label>
            <select
              className="w-64 rounded-lg border p-2"
              value={settings.modules.fee.mode}
              onChange={e => handleChange('fee', 'mode', e.target.value)}
              disabled={loadingSettings}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Start Date</label>
            <input
              type="date"
              className="rounded-lg border p-2"
              value={settings.modules.fee.startDate}
              onChange={e => handleChange('fee', 'startDate', e.target.value)}
              disabled={loadingSettings}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">End Date</label>
            <input
              type="date"
              className="rounded-lg border p-2"
              value={settings.modules.fee.endDate}
              onChange={e => handleChange('fee', 'endDate', e.target.value)}
              disabled={loadingSettings}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow">
        <div className="border-b p-4">
          <h2 className="text-xl font-semibold">Admissions Settings</h2>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <label className="font-medium">Enable Admissions Module</label>
            <input
              type="checkbox"
              checked={settings.modules.admissions.enabled}
              onChange={e => handleChange('admissions', 'enabled', e.target.checked)}
              disabled={loadingSettings}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Mode</label>
            <select
              className="w-64 rounded-lg border p-2"
              value={settings.modules.admissions.mode}
              onChange={e => handleChange('admissions', 'mode', e.target.value)}
              disabled={loadingSettings}
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">Admission Start Date</label>
            <input
              type="date"
              className="rounded-lg border p-2"
              value={settings.modules.admissions.startDate}
              onChange={e => handleChange('admissions', 'startDate', e.target.value)}
              disabled={loadingSettings}
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">Admission End Date</label>
            <input
              type="date"
              className="rounded-lg border p-2"
              value={settings.modules.admissions.endDate}
              onChange={e => handleChange('admissions', 'endDate', e.target.value)}
              disabled={loadingSettings}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={status === 'loading' || !effectiveCollegeId || saving || loadingSettings}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
