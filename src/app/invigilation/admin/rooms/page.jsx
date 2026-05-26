//src/app/invigilation/admin/rooms/page.jsx

'use client'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import InvigilationGuard from '@/app/invigilation/components/InvigilationGuard'
import InvigilationShell from '@/app/invigilation/components/InvigilationShell'

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [roomForm, setRoomForm] = useState({
    name: '',
    block: '',
    capacity: '',
  })
  const [editingRoomId, setEditingRoomId] = useState('')
  const [roomLoading, setRoomLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState('')
  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/invigilation/rooms', {
        cache: 'no-store',
      })
  const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      setRooms(data.data || [])
    } catch (err) {
      toast.error(err.message || 'Failed to load rooms')
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  const onCreateRoom = async e => {
    e.preventDefault()

    setRoomLoading(true)

    try {
      const isEditing = Boolean(editingRoomId)

      const res = await fetch(
        isEditing ? `/api/invigilation/rooms/${editingRoomId}` : '/api/invigilation/rooms',

        {
          method: isEditing ? 'PUT' : 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(roomForm),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success(isEditing ? 'Room updated' : 'Room created')

      setRoomForm({
        name: '',
        block: '',
        capacity: '',
      })

      setEditingRoomId('')

      loadRooms()
    } catch (err) {
      toast.error(err.message || 'Failed')
    } finally {
      setRoomLoading(false)
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
      const res = await fetch(`/api/invigilation/rooms/${room._id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message)
      }

      toast.success(
        `Room deleted${
          data.deletedSchedules ? ` | Schedules removed: ${data.deletedSchedules}` : ''
        }`
      )

      if (editingRoomId === room._id) {
        setEditingRoomId('')

        setRoomForm({
          name: '',
          block: '',
          capacity: '',
        })
      }

      loadRooms()
    } catch (err) {
      toast.error(err.message || 'Failed to delete room')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <InvigilationGuard allowRoles={['admin']}>
      {user => (
        <InvigilationShell user={user} title="Room Management">
          <div className="space-y-6 p-6">
            <form onSubmit={onCreateRoom} className="space-y-4">
              <div className="rounded-xl border bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold">{editingRoomId ? 'Edit Room' : 'Create Room'}</h2>

                <p className="mt-1 text-sm text-slate-500">Manage invigilation rooms</p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Room Name"
                    required
                    value={roomForm.name}
                    onChange={e =>
                      setRoomForm(s => ({
                        ...s,
                        name: e.target.value.toUpperCase(),
                      }))
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="text"
                    placeholder="Block"
                    required
                    value={roomForm.block}
                    onChange={e =>
                      setRoomForm(s => ({
                        ...s,
                        block: e.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Capacity"
                    required
                    value={roomForm.capacity}
                    onChange={e =>
                      setRoomForm(s => ({
                        ...s,
                        capacity: e.target.value,
                      }))
                    }
                    className="rounded-lg border px-3 py-2"
                  />
                </div>

                <button
                  type="submit"
                  disabled={roomLoading}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  {roomLoading ? 'Saving...' : editingRoomId ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold">Existing Rooms</h2>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="p-3 text-left">Room</th>

                      <th className="p-3 text-left">Block</th>

                      <th className="p-3 text-left">Capacity</th>

                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rooms.map(room => (
                      <tr key={room._id} className="border-b">
                        <td className="p-3">{room.name}</td>

                        <td className="p-3">{room.block}</td>

                        <td className="p-3">{room.capacity}</td>

                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onEditRoom(room)}
                              className="rounded bg-amber-500 px-3 py-1 text-xs text-white"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteRoom(room)}
                              disabled={actionLoading === `room-delete-${room._id}`}
                              className="rounded bg-red-600 px-3 py-1 text-xs text-white"
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
            </div>
          </div>
        </InvigilationShell>
      )}
    </InvigilationGuard>
  )
}
