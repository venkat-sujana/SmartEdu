import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectMongoDB from '@/lib/mongodb'
import Lecturer from '@/models/Lecturer'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await connectMongoDB()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'lecturer') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('photo')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'No photo file provided' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 }
      )
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Photo must be less than 5MB' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const lecturer = await Lecturer.findByIdAndUpdate(
      session.user.id,
      { photo: dataUri },
      { new: true }
    ).select('photo')

    if (!lecturer) {
      return NextResponse.json({ success: false, message: 'Lecturer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photo updated successfully',
      photo: lecturer.photo,
    })
  } catch (error) {
    console.error('Lecturer photo upload error:', error)
    return NextResponse.json({ success: false, message: 'Failed to upload photo' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await connectMongoDB()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'lecturer') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const lecturer = await Lecturer.findByIdAndUpdate(
      session.user.id,
      { photo: '' },
      { new: true }
    ).select('photo')

    if (!lecturer) {
      return NextResponse.json({ success: false, message: 'Lecturer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Photo removed successfully',
      photo: '',
    })
  } catch (error) {
    console.error('Lecturer photo delete error:', error)
    return NextResponse.json({ success: false, message: 'Failed to remove photo' }, { status: 500 })
  }
}
