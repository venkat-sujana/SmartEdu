// src/app/api/invigilation/availability/route.js
import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import LecturerAvailability from '@/models/LecturerAvailability'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()

    const filter = {}

    if (user.role === 'lecturer') {
      filter.lecturerId = user._id
    } else {
      if (user.collegeId) filter.collegeId = user.collegeId
      const { searchParams } = new URL(req.url)
      if (searchParams.get('lecturerId')) filter.lecturerId = searchParams.get('lecturerId')
      if (searchParams.get('session'))    filter.session    = searchParams.get('session')
      if (searchParams.get('status'))     filter.status     = searchParams.get('status')
      if (searchParams.get('date')) {
        const d = new Date(searchParams.get('date'))
        d.setHours(0, 0, 0, 0)
        const end = new Date(d)
        end.setHours(23, 59, 59, 999)
        filter.date = { $gte: d, $lte: end }
      }
    }

    const records = await LecturerAvailability.find(filter)
      .populate('lecturerId', 'name')
      .sort({ date: 1, session: 1 })
      .lean()

    return NextResponse.json({ data: records })

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const { date, session, status, reason, lecturerId: bodyLid } = await req.json()

    if (!date || !session || !status) {
      return NextResponse.json(
        { message: 'date, session, status are required' },
        { status: 400 }
      )
    }

    const lecturerId = user.role === 'admin'
      ? (bodyLid || user._id)
      : user._id

    const record = await LecturerAvailability.findOneAndUpdate(
      { lecturerId, date: new Date(date), session },
      { lecturerId, date: new Date(date), session, status, reason: reason || '' },
      { upsert: true, new: true }
    )

    return NextResponse.json({ message: 'Saved', data: record })

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed to save' },
      { status: 500 }
    )
  }
}