import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Helper: Extract Cloudinary public_id from photo URL
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const filename = parts.pop(); // last part (e.g., name.jpg)
    const folder = parts.pop();   // folder (e.g., students)
    const publicId = filename.split(".")[0]; // remove extension
    return `${folder}/${publicId}`;
  } catch (e) {
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", data: student });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const body = await req.json();

    const existingStudent = await Student.findById(params.id);
    if (!existingStudent) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // If photo changed, remove old photo from Cloudinary
    if (body.photo && existingStudent.photo && body.photo !== existingStudent.photo) {
      const publicId = getPublicIdFromUrl(existingStudent.photo);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ status: "success", data: updatedStudent });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Delete photo from Cloudinary
    if (student.photo) {
      const publicId = getPublicIdFromUrl(student.photo);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Student.findByIdAndDelete(params.id);

    return NextResponse.json({ status: "success", message: "Student deleted" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
