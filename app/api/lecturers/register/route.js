// app/api/lecturers/register/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
 
export async function POST(req) {
  try {
    await connectMongoDB();
    const { name, mobile, email, subject, password, collegeId } = await req.json();


    

    // ✅ Check all required fields
    if (!name || !mobile || !email || !subject || !password || !collegeId) {
      return NextResponse.json({ message: "All fields are required including collegeId" }, { status: 400 });
    }



    // ✅ Check duplicate email
    const existing = await Lecturer.findOne({ email });
    if (existing) {
      return NextResponse.json({ message: "Lecturer already registered" }, { status: 400 });
    }

 




    // ✅ Save with collegeId
    const newLecturer = new Lecturer({
      name,
      mobile,
      email,
      subject,
      password,
      collegeId, // 👈 newly added
    });

    await newLecturer.save();

    return NextResponse.json({ message: "Lecturer registered successfully" }, { status: 201 });
  } catch (err) {
    console.error("Lecturer Registration Error:", err);
    return NextResponse.json({ message: "Registration failed", error: err.message }, { status: 500 });
  }
}
