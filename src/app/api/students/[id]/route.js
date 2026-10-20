// app/students/[id]/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import { getCaretakerLecturerGroupAccess } from "@/lib/caretakerGroupAccess";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";

function normalizeAdmissionNo(value) {
  if (value == null) return "";
  return String(value).trim().toUpperCase();
}

// ✅ Session + CollegeId ఆధారంగా చెక్ చేసే helper
async function getStudentByIdWithAuth(id) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.collegeId) {
    return { error: "Unauthorized", status: 401 };
  }

  await connectMongoDB();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { error: "Invalid student ID", status: 400 };
  }

  const student = await Student.findOne({
    _id: id,
    collegeId: session.user.collegeId,
  }).populate("collegeId", "name code");

  if (!student) {
    return { error: "Student not found", status: 404 };
  }

  if (session.user.role === "lecturer") {
    const access = await getCaretakerLecturerGroupAccess(session);

    if (
      !access.authorized ||
      !access.groups.length ||
      String(access.collegeId) !== String(session.user.collegeId)
    ) {
      return { error: "Forbidden: no authorized group mapping", status: 403 };
    }

    const normalize = (value) => normalizeAttendanceGroup(value);

    const allowedGroups = access.groups.map(normalize);
    const studentGroup = normalize(student.group);

    if (!allowedGroups.includes(studentGroup)) {
      return { error: "Forbidden: student group access denied", status: 403 };
    }
  }

  return { student, session };
}






// 📌 GET
export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const { student, error, status } = await getStudentByIdWithAuth(id);
    if (error) return NextResponse.json({ message: error }, { status });
    return NextResponse.json({ status: "success", data: student });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}




// 📌 PUT
export async function PUT(req, context) {
  try {
  
    const { id } = await context.params;
    const {
  student: existingStudent,
  error,
  status,
  session,
} = await getStudentByIdWithAuth(id);

    if (error) return NextResponse.json({ message: error }, { status });

    let body = await req.json();

    // Restrict lecturer updates to permitted student fields.
if (existingStudent && error === undefined) {
  // The helper above has already verified the lecturer's group access.
}

// Lecturers can update only these fields.
// Other roles retain the existing update behavior.
if (existingStudent && (await getServerSession(authOptions))?.user?.role === "lecturer") {
  const allowedFields = [
    "name",
    "fatherName",
    "mobile",
    "parentMobile",
    "caste",
    "dob",
    "gender",
    "address",
    "photo",
  ];

  body = Object.fromEntries(
    Object.entries(body).filter(([key]) => allowedFields.includes(key))
  );
}



      // 📅 dateOfJoining ఉంటే Date object గా మార్చడం
    if (body.dateOfJoining) {
      body.dateOfJoining = new Date(body.dateOfJoining);
    }

    if (body.dob) {
      body.dob = new Date(body.dob);
    } else if (body.dob === null || body.dob === "") {
      body.dob = null;
    }

    if (body.password === undefined || body.password === "") {
      delete body.password;
    }

    if (body.admissionNo !== undefined) {
      const normalizedAdmissionNo = normalizeAdmissionNo(body.admissionNo);
      body.admissionNo = normalizedAdmissionNo;

      if (normalizedAdmissionNo) {
        const duplicateStudent = await Student.findOne({
          _id: { $ne: id },
          admissionNo: normalizedAdmissionNo,
          collegeId: existingStudent.collegeId,
        }).select("_id");

        if (duplicateStudent) {
          return NextResponse.json(
            { message: "Admission number already exists" },
            { status: 409 }
          );
        }
      }
    }


    // 🔄 Student update చేయడం
const updatedStudent = await Student.findOneAndUpdate(
  { _id: id, collegeId: existingStudent.collegeId },
  { $set: body },
  { new: true, runValidators: true }
);


    return NextResponse.json({ status: "success", data: updatedStudent });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



// 📌 DELETE
export async function DELETE(req, context) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

if (session?.user?.role === "lecturer") {
  return NextResponse.json(
    { message: "Lecturers are not allowed to delete students." },
    { status: 403 }
  );
}
    const { student, error, status } = await getStudentByIdWithAuth(id);
    if (error) return NextResponse.json({ message: error }, { status });

    await Student.findByIdAndDelete(student._id);

    return NextResponse.json({
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
