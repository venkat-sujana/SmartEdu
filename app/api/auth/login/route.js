// app/api/auth/login/route.js
import bcrypt from "bcrypt";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(req) {
  try {
    await connectMongoDB();
    const { identifier, password } = await req.json();

    const student = await Student.findOne({ admissionNo: identifier });
    if (!student) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    // Login success response including mustChangePassword
    const responseData = {
      message: "Login successful",
      mustChangePassword: student.mustChangePassword,
      // add token or session info here if needed
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
