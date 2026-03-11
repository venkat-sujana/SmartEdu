// app/api/exams/failures/route.js
import { NextResponse } from "next/server"
import connectMongoDB from "@/lib/mongodb"
import Exam from "@/models/Exam"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


export async function GET(req) {
  try {
    await connectMongoDB()
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const collegeId = session.user.collegeId

    // 🔹 examType query తీసుకోవడం
    const { searchParams } = new URL(req.url)
    const examType = searchParams.get("examType") // UNIT-1, UNIT-2 etc.

    if (!examType) {
      return NextResponse.json({ success: false, message: "examType required" }, { status: 400 })
    }

    // 🔹 Pass mark fix (example: < 35 fail)
    const PASS_MARK = 35

    const exams = await Exam.find({ collegeId, examType }).populate("studentId", "name stream yearOfStudy")

    const failedStudents = exams.filter((exam) => exam.percentage < PASS_MARK).map((exam) => ({
      name: exam.studentId?.name || "Unknown",
      stream: exam.stream,
      yearOfStudy: exam.yearOfStudy,
      percentage: exam.percentage,
    }))

    return NextResponse.json({
      success: true,
      examType,
      failedCount: failedStudents.length,
      failedStudents,
    })
  } catch (error) {
    console.error("Error fetching failures:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
