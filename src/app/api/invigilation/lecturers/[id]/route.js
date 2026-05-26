//src/app/api/invigilation/lecturers/[id]/route.js

import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import User from '@/models/User'
import LecturerProfile from '@/models/LecturerProfile'
import { hashPassword } from '@/lib/invigilation-auth'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'


export async function PUT(req, { params }) {
  const { user: admin, error } = await requireInvigilationAuth(req, ['admin'])

  if (error) return error
  try {
    await connectInvigilationDB()
    const { id } = await  params
    const body = await req.json()
    const lecturer = await User.findById(id)
    if (!lecturer) {
      return NextResponse.json(
        {
          message: 'Lecturer not found',
        },
        { status: 404 }
      )
    }

    lecturer.name = body.name?.trim()
    await lecturer.save()
    const profile = await LecturerProfile.findOne({
      userId: lecturer._id,
    })

    if (profile) {
      profile.designation = body.designation?.trim()
      profile.institutionName = body.institutionName?.trim()
      profile.phone = body.phone?.trim()
      await profile.save()
    }

    if (body.password?.trim()) {
      lecturer.password = await hashPassword(body.password.trim())
      await lecturer.save()
    }
    return NextResponse.json({
      message: 'Lecturer updated',
    })
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || 'Failed to update lecturer',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req, { params }) {
  const { user: admin, error } = await requireInvigilationAuth(req, ['admin'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const { id } = await  params
    const lecturer = await User.findById(id)

    if (!lecturer) {
      return NextResponse.json(
        {
          message: 'Lecturer not found',
        },
        { status: 404 }
      )
    }

    await LecturerProfile.deleteOne({
      userId: lecturer._id,
    })
    await User.deleteOne({
      _id: lecturer._id,
    })
    return NextResponse.json({
      message: 'Lecturer deleted',
    })
  } catch (err) {
    return NextResponse.json(
      {
        message: err.message || 'Failed to delete lecturer',
      },
      { status: 500 }
    )
  }
}
