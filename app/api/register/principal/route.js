//app/api/register/principal/route.js
import connectMongoDB from "@/lib/mongodb";
import Principal from "@/models/Principal";
import bcrypt from "bcrypt";

export async function POST(request) {
  try {
    await connectMongoDB();

    const body = await request.json();
    const { name, email, password, collegeId, photo } = body;

    if (!name || !email || !password || !collegeId) {
      return Response.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = await Principal.findOne({ email });
    if (existing) {
      return Response.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create principal
    const principal = await Principal.create({
      name,
      email,
      password: hashedPassword,
      collegeId,
      role: "principal",
      photo: photo || null,
      dateOfJoining: new Date(),
    });

    return Response.json(
      {
        message: "Principal registered successfully",
        principal: {
          _id: principal._id,
          name: principal.name,
          email: principal.email,
          collegeId: principal.collegeId,
          role: principal.role,
          photo: principal.photo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Principal register error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
