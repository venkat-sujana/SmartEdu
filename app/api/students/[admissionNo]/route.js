import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { admissionNo } = params;

    const student = await Student.findOne({ admissionNo });

    if (!student) {
      return new Response(JSON.stringify({ error: "Student not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(student), { status: 200 });
  } catch (error) {
    console.error("Error fetching student:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
