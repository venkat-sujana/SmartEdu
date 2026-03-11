import { studentSchema } from "@/validations/studentValidation";
import { getStudentsService } from "@/services/studentService"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import connectMongoDB from "@/lib/mongodb"
import mongoose from "mongoose"
import { handleApiError } from "@/utils/errorHandler"
import { ApiError } from "@/errors/apiError"
export async function POST(req) {

  try {
    const body = await req.json();

    const result = studentSchema.safeParse(body);

    if (!result.success) {
      return handleApiError(new ApiError(400, "Invalid student data"));
    }

    // validated data
    const data = result.data;

    // create student logic

    return Response.json({ status: "success", data });

  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req) {

  try {

    await connectMongoDB()

    const session = await getServerSession(authOptions)

    if (!session?.user?.collegeId) {
      return Response.json(
        { status: "error", message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    const groupParam = searchParams.get("group")
    const yearParam = searchParams.get("year") || searchParams.get("yearOfStudy")
    const searchParam = (searchParams.get("search") || "").trim()

    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100)

    const result = await getStudentsService({
      collegeId: session.user.collegeId,
      groupParam,
      yearParam,
      searchParam,
      page,
      limit,
      session
    })

    return Response.json({
      status: "success",
      totalStudents: result.totalStudents,
      page,
      limit,
      totalPages: result.totalPages,
      data: result.students
    })

  } catch (error) {

    return handleApiError(error)

  }

}