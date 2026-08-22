
//app/students/activate/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import bcrypt from "bcryptjs";

function normalizeAdmissionNo(value) {
  if (value == null) return "";
  return String(value).trim().toUpperCase();
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const { admissionNo, password } = await request.json();
    const normalizedAdmissionNo = normalizeAdmissionNo(admissionNo);

    if (!normalizedAdmissionNo || !password) {
      return Response.json({ error: "Admission No and Password are required" }, { status: 400 });
    }

    const student = await Student.findOne({ admissionNo: normalizedAdmissionNo });
    if (!student) {
      return Response.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.password) {
      const hasDefaultPassword = await bcrypt.compare("default123", student.password).catch(() => false);
      if (!hasDefaultPassword) {
        return Response.json({ error: "Account already activated. Please login." }, { status: 400 });
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    student.password = hashed;
    await student.save();

    return Response.json({ message: "Account activated successfully" }, { status: 200 });
  } catch (err) {
    console.error("Student activate error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
