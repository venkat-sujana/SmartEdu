// app/api/students/route.js
export const dynamic = "force-dynamic";

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectMongoDB from '@/lib/mongodb'
import Student from '@/models/Student'
import cloudinary from '@/lib/cloudinary'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    await connectMongoDB()

    const session = await getServerSession(authOptions)

    const lecturer = session?.user

    if (!lecturer?.collegeId || (!lecturer?.subject && !lecturer?.group)) {
      return Response.json(
        { status: 'error', message: 'Unauthorized: Missing College ID or Subject/Group' },
        { status: 401 }
      )
    }

    const collegeName = lecturer.collegeName

    const formData = await req.formData()
    const fields = Object.fromEntries(formData.entries())
    const file = formData.get('photo')

    let photoUrl = ''
    if (file && typeof file === 'object') {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: 'students',
      })
      photoUrl = cloudinaryResponse.secure_url
    }

    const requiredFields = [
      'name',
      'fatherName',
      'mobile',
      'group',
      'caste',
      'dob',
      'gender',
      'admissionNo',
      'yearOfStudy',
      'admissionYear',
      'dateOfJoining',
      'address',
    ]

    for (const field of requiredFields) {
      if (!fields[field]) {
        return Response.json(
          { status: 'error', message: `Missing field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Check password field; if not present, assign default password
    const plainPassword =
      fields.password && fields.password.trim() !== '' ? fields.password.trim() : 'Welcome@2025'

    // Hash the password using bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds)

    // Create student with hashed password and other fields
    const student = await Student.create({
      ...fields,
      password: hashedPassword,
      collegeId: new mongoose.Types.ObjectId(lecturer.collegeId),
      collegeName,
      subjects: lecturer.group ? [] : [lecturer.subject],
      photo: photoUrl,
    })

    return Response.json({ status: 'success', data: student }, { status: 201 })
  } catch (error) {
    return Response.json({ status: 'error', message: error.message }, { status: 500 })
  }
}



export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    console.log('SESSION IN /api/students:', session);

    if (!session?.user?.collegeId) {
      return Response.json({ status: 'error', message: 'College ID లేదు' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupParam = searchParams.get('group'); // Group from URL

    console.log('🔍 Params:', { groupParam, sessionCollegeId: session.user.collegeId });

    // Base filter
    let filter = {
      collegeId: new mongoose.Types.ObjectId(session.user.collegeId),
      status: "Active"
    };

    // ✅ GROUP PARAM has HIGHEST PRIORITY
    if (groupParam) {
      filter.group = groupParam;
      console.log(`🎯 GROUP FILTER Applied: ${groupParam}`);
    } 
    // Fallback: session-based filtering
    else if (session.user.stream === 'Vocational' && session.user.group) {
      filter.group = session.user.group;
    }
    else if (session.user.stream === 'General' && session.user.subject) {
      filter.subjects = { $in: [session.user.subject] };
    }

    console.log('📊 Final MongoDB Filter:', JSON.stringify(filter));

    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Total Students Found: ${students.length}`);

    return Response.json({
      status: 'success',
      totalStudents: students.length,
      data: students
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return Response.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
