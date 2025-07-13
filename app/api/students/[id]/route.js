import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary కాన్ఫిగరేషన్
cloudinary.config({ 
  cloud_name: 'dlwxpzc83',
  api_key: 562792651785938,
  api_secret: 'Dz79bpyfHvklgMfW6ufZihpCQ1Y',
  secure: true
});

// మెరుగైన పబ్లిక్ ఐడీ ఎక్స్ట్రాక్షన్
function getPublicIdFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    if (pathParts.length >= 3) {
      const folder = pathParts[pathParts.length - 2];
      const filename = pathParts[pathParts.length - 1];
      return `${folder}/${filename.split('.')[0]}`;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const student = await Student.findById(params.id);
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ status: "success", data: student });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const existingStudent = await Student.findById(params.id);
    if (!existingStudent) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // ఫోటో మారినట్లయితే పాత ఫోటోని డిలీట్ చేయండి
    if (body.photo && existingStudent.photo !== body.photo) {
      const publicId = getPublicIdFromUrl(existingStudent.photo);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Failed to delete old image:", e);
        }
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      params.id, 
      body, 
      { new: true, runValidators: true }
    );

    return NextResponse.json({ status: "success", data: updatedStudent });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const student = await Student.findById(params.id);
    
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // ఫోటోని Cloudinary నుండి డిలీట్ చేయండి
    if (student.photo) {
      const publicId = getPublicIdFromUrl(student.photo);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (e) {
          console.error("Failed to delete image:", e);
        }
      }
    }

    await Student.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      status: "success", 
      message: "Student deleted successfully" 
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}


