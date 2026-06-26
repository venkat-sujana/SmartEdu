import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectMongoDB from '@/lib/mongodb'
import OfficeStaff from '@/models/OfficeStaff'
import College from '@/models/College'

export async function POST(req) {
  await connectMongoDB()

  try {
    const {
      employeeId,
      name,
      email,
      password,
      designation,
      mobile,
      photo,
      collegeId,
    } = await req.json()

    const requiredFields = ['employeeId', 'name', 'email', 'password', 'designation', 'collegeId']
    const payload = { employeeId, name, email, password, designation, collegeId }
    const missing = requiredFields.filter(field => !String(payload[field] || '').trim())

    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedEmployeeId = employeeId.trim()

    const existingEmail = await OfficeStaff.findOne({ email: normalizedEmail })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    const existingEmployee = await OfficeStaff.findOne({ employeeId: trimmedEmployeeId })
    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
    }

    const college = await College.findById(collegeId).lean()
    if (!college) {
      return NextResponse.json({ error: 'Invalid college' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password.trim(), 10)

    await OfficeStaff.create({
      employeeId: trimmedEmployeeId,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      designation: designation.trim(),
      mobile: String(mobile || '').trim(),
      photo: String(photo || '').trim(),
      collegeId,
      status: 'Active',
    })

    return NextResponse.json(
      { message: 'Office staff registered successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Office register error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
