// src/app/api/invigilation/lecturers/route.js
import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import User from '@/models/User'
import LecturerProfile from '@/models/LecturerProfile'
import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'

export async function GET(req) {
  const { user: admin, error } = await requireInvigilationAuth(req, ['admin'])
  if (error) return error

  try {
    await connectInvigilationDB()

    const filter = { role: 'lecturer' }
    if (admin?.collegeId) filter.collegeId = admin.collegeId

    // ✅ Lecturers మాత్రమే return చేయాలి
    const lecturers = await User.find(filter).lean()

    // Profile data కూడా కావాలంటే
    const profiles = await LecturerProfile.find({
      userId: { $in: lecturers.map(l => l._id) },
    }).lean()

    const profileMap = {}
    profiles.forEach(p => { profileMap[String(p.userId)] = p })

    const data = lecturers.map(l => ({
      id:              String(l._id),
      _id:             String(l._id),
      name:            l.name,
      loginId:         l.loginId,
      designation:     profileMap[String(l._id)]?.designation  || '',
      institutionName: profileMap[String(l._id)]?.institutionName || '',
      phone:           profileMap[String(l._id)]?.phone || '',
    }))

    return NextResponse.json({ data })

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed to fetch lecturers' },
      { status: 500 }
    )
  }
}