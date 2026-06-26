//src/app/api/admin/office-staff/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectMongoDB from '@/lib/mongodb'
import OfficeStaff from '@/models/OfficeStaff'
import College from '@/models/College'
import { getAdminSession } from '@/lib/requireAdminSession'

export async function GET(req) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectMongoDB()
    const { searchParams } = new URL(req.url)
    const collegeId = searchParams.get('collegeId')
    const search = (searchParams.get('search') || '').trim()
    const page = Math.max(Number(searchParams.get('page') || 1), 1)
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 10), 1), 100)
    const skip = (page - 1) * limit
    const query = {}

    if (collegeId) query.collegeId = collegeId
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ]
    }

    const [officeStaff, total] = await Promise.all([
      OfficeStaff.find(query)
        .populate('collegeId', 'name')
        .sort({
          designation: 1,
          name: 1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      OfficeStaff.countDocuments(query),
    ])

    return NextResponse.json({
      data: officeStaff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    })
  } catch (error) {
    console.error('Admin Office Staff GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch Office Staff' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectMongoDB()
    const body = await req.json()
    const requiredFields = ['employeeId', 'name', 'email', 'password', 'designation', 'collegeId']
    const missing = requiredFields.filter(field => !String(body[field] || '').trim())
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const exists = await OfficeStaff.findOne({ email: body.email.trim().toLowerCase() })
    if (exists) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    const employeeExists = await OfficeStaff.findOne({
      employeeId: body.employeeId.trim(),
    })

    if (employeeExists) {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
    }

    const college = await College.findById(body.collegeId).lean()
    if (!college) {
      return NextResponse.json({ error: 'Invalid college' }, { status: 400 })
    }

    const officeStaff = await OfficeStaff.create({
      employeeId: body.employeeId.trim(),
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: await bcrypt.hash(body.password.trim(), 10),

      designation: body.designation,

      mobile: body.mobile || '',

      photo: body.photo || '',

      collegeId: body.collegeId,

      createdBy: session.user.id,

      status: body.status || 'Active',
    })

    const created = await OfficeStaff.findById(officeStaff._id).populate('collegeId', 'name').lean()

    return NextResponse.json(
      {
        message: 'Office Staff created successfully',
        data: created,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin office staff  POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create office staff ' },
      { status: 500 }
    )
  }
}
