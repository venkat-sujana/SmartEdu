
// app/api/lecturers/active/route.js
import { NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Lecturer from '@/models/Lecturer'

export async function GET(req) {
  await connectMongoDB()

  const { searchParams } = new URL(req.url)
  const collegeId = searchParams.get('collegeId')

  console.log("Incoming collegeId:", collegeId)

  // 🔎 Fetch all lecturers
  const allLecturers = await Lecturer.find({})
  console.log("All Lecturers:", allLecturers)

  // 🔎 Filter lecturers by collegeId
  const lecturers = await Lecturer.find({ collegeId })
  console.log("Filtered Lecturers by collegeId:", lecturers)

  // 🔎 Map lecturers to active lecturers
  const activeLecturers = lecturers.map(l => ({
    name: l.name,
    subject: l.subject,
  }))
  console.log("Active Lecturers:", activeLecturers)

  return NextResponse.json(activeLecturers)
}

