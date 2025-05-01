// app/api/students/[id]/route.js
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";


export async function GET() {
  try {
    await connectDB();
    const students = await Student.find();
    return Response.json(students); // ← Should return array directly
  } catch (error) {
    return new Response("Error fetching students", { status: 500 });
  }
}

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const body = await req.json();
    const student = await Student.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", data: student });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    const deleted = await Student.findByIdAndDelete(params.id);
    if (!deleted) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", message: "Student deleted" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
