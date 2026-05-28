// src/app/api/invigilation/availability/[id]/route.js
import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import LecturerAvailability from '@/models/LecturerAvailability'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

// GET — admin: all records | lecturer: own records
export async function GET(req, { params }) {
  const { user, error } = await requireInvigilationAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const { searchParams } = new URL(req.url)

    const filter = {}
    if (user.role === 'lecturer') {
      filter.lecturerId = user._id
    } else {
      // admin filters
      if (searchParams.get('lecturerId')) filter.lecturerId = searchParams.get('lecturerId')
      if (searchParams.get('date'))       filter.date = new Date(searchParams.get('date'))
      if (searchParams.get('session'))    filter.session = searchParams.get('session')
      if (searchParams.get('status'))     filter.status = searchParams.get('status')
    }

    const records = await LecturerAvailability.find(filter)
      .populate('lecturerId', 'name')
      .sort({ date: 1, session: 1 })
      .lean()

    return NextResponse.json({ data: records })
  } catch (err) {
    return NextResponse.json({ message: err.message || 'Failed' }, { status: 500 })
  }
}

// POST — lecturer submits / updates availability (upsert)
export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const body = await req.json()
    const { date, session, status, reason } = body

    if (!date || !session || !status) {
      return NextResponse.json({ message: 'date, session, status are required' }, { status: 400 })
    }

    // Lecturer can only update own records; admin can update any
    const lecturerId = user.role === 'admin'
      ? (body.lecturerId || user._id)
      : user._id

    const record = await LecturerAvailability.findOneAndUpdate(
      { lecturerId, date: new Date(date), session },
      { lecturerId, date: new Date(date), session, status, reason: reason || '' },
      { upsert: true, new: true }
    )

    return NextResponse.json({ message: 'Availability saved', data: record })
  } catch (err) {
    return NextResponse.json({ message: err.message || 'Failed' }, { status: 500 })
  }
}

// ── PUT ─────────────────────────────────────
export async function PUT(
  req,
  { params }
) {

  const {
    user,
    error,
  } = await requireInvigilationAuth(
    req,
    ['admin']
  )

  if (error) return error

  try {

    await connectInvigilationDB()

    const { id } =await params

    const body = await req.json()

    const record =
      await LecturerAvailability.findById(id)

    if (!record) {

      return NextResponse.json(
        {
          message:
            'Availability record not found',
        },
        {
          status: 404,
        }
      )
    }

    // Update
    record.status =
      body.status

    record.reason =
      body.reason || ''

    await record.save()

    return NextResponse.json({

      message:
        'Availability updated successfully',

      data: record,
    })

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          'Failed to update availability',
      },
      {
        status: 500,
      }
    )
  }
}

// ── DELETE ──────────────────────────────────
export async function DELETE(
  req,
  { params }
) {

  const {
    user,
    error,
  } = await requireInvigilationAuth(
    req,
    ['admin']
  )

  if (error) return error

  try {

    await connectInvigilationDB()

    const { id } = await params

    const record =
      await LecturerAvailability.findById(id)

    if (!record) {

      return NextResponse.json(
        {
          message:
            'Availability record not found',
        },
        {
          status: 404,
        }
      )
    }

    await LecturerAvailability.findByIdAndDelete(
      id
    )

    return NextResponse.json({

      message:
        'Availability deleted successfully',
    })

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          'Failed to delete availability',
      },
      {
        status: 500,
      }
    )
  }
}