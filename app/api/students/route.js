// app/api/students/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(req) {
  try {
    await connectMongoDB();
    console.log("body:", req.body);
    const body = await req.json();
    console.log("body:", body);
    const student = await Student.create(body);
    console.log("student:", student);
    return Response.json({ status: "success", data: student }, { status: 201 });
  } catch (error) {
    console.log("error:", error.message);
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("GET /api/students");
    await connectMongoDB();
    console.log("connected to MongoDB");
    const students = await Student.find().sort({ createdAt: -1 });
    console.log("students:", students);
    return Response.json({ status: "success", data: students });
  } catch (error) {
    console.log("error:", error.message);
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}
