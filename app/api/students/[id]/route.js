// app/students/[id]/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";




// Cloudinary కాన్ఫిగరేషన్
cloudinary.config({
  cloud_name: "dlwxpzc83",
  api_key: 562792651785938,
  api_secret: "Dz79bpyfHvklgMfW6ufZihpCQ1Y",
  secure: true,
});



// మెరుగైన పబ్లిక్ ఐడీ ఎక్స్ట్రాక్షన్
function getPublicIdFromUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    if (pathParts.length >= 3) {
      const folder = pathParts[pathParts.length - 2];
      const filename = pathParts[pathParts.length - 1];
      return `${folder}/${filename.split(".")[0]}`;
    }
    return null;
  } catch (e) {
    return null;
  }
}





// ✅ Session + CollegeId ఆధారంగా చెక్ చేసే helper
async function getStudentByIdWithAuth(id) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: "Unauthorized", status: 401 };
  }

  await connectMongoDB();

  // ⚡️ ఇప్పుడు populate చేయండి
  const student = await Student.findOne({
    _id: id,
    collegeId: session.user.collegeId, // 🛡️ కాలేజీ ఫిల్టర్
  }).populate("collegeId", "name code"); // name, code మాత్రమే తీసుకుందాం

  if (!student) {
    return { error: "Student not found", status: 404 };
  }

  return { student, session };
}






// 📌 GET
export async function GET(req, { params }) {
  try {
    const { student, error, status } = await getStudentByIdWithAuth(params.id);
    if (error) return NextResponse.json({ message: error }, { status });
    return NextResponse.json({ status: "success", data: student });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}




// 📌 PUT
export async function PUT(req, { params }) {
  try {
    const { student: existingStudent, error, status } = await getStudentByIdWithAuth(params.id);

        

    if (error) return NextResponse.json({ message: error }, { status });

    let body = await req.json();

      // 🐞 Debug logs
    console.log("📥 Incoming body:", body);
    console.log("📅 Raw dateOfJoining value:", body.dateOfJoining);

    // 📅 dateOfJoining ఉంటే Date object గా మార్చడం
    if (body.dateOfJoining) {
      body.dateOfJoining = new Date(body.dateOfJoining);
    }


    console.log("📥 Incoming body:", body);
console.log("📅 dateOfJoining type:", typeof body.dateOfJoining, body.dateOfJoining);


    // 🖼️ ఫోటో మారితే పాత ఫోటోని Cloudinary లో డిలీట్ చేయడం
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

    // 🔄 Student update చేయడం
const updatedStudent = await Student.findOneAndUpdate(
  { _id: params.id, collegeId: existingStudent.collegeId },
  { $set: body },
  { new: true, runValidators: true }
);


    return NextResponse.json({ status: "success", data: updatedStudent });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



// 📌 DELETE
export async function DELETE(req, { params }) {
  try {
    const { student, error, status } = await getStudentByIdWithAuth(params.id);
    if (error) return NextResponse.json({ message: error }, { status });

    // Cloudinary నుండి ఫోటోని డిలీట్ చేయండి
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

    await Student.findByIdAndDelete(student._id);

    return NextResponse.json({
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
