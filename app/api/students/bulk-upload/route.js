import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  await connectMongoDB();

  const session = await getServerSession(authOptions);
  const collegeId = session?.user?.collegeId;

  if (!collegeId) {
    return NextResponse.json(
      { message: "College ID missing in session" },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  // Read Excel buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uint8Array = new Uint8Array(buffer);
  const workbook = XLSX.read(uint8Array, { type: "array" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet);

  const finalData = excelData.map((row) => ({
    name: row.Name,
    fatherName: row.FatherName,
    mobile: row.Mobile ? row.Mobile.toString() : "",
    group: row.Group,
    caste: row.Caste,
    dob: row.DOB,
    gender: row.Gender,

    admissionNo: row.AdmissionNo ? row.AdmissionNo.toString() : "",
    yearOfStudy: row.YearOfStudy,
    admissionYear: row.AdmissionYear,
    dateOfJoining: row.dateOfJoining,
    address: row.Address,

    // IMPORTANT FIX
    password: "-",   // <- Mongoose accepts this (not empty)
    mustChangePassword: true,

    photo: "",
    collegeId,
    subjects: [],
    role: "student",
  }));

  await Student.insertMany(finalData);

  return NextResponse.json({
    message: `${finalData.length} students uploaded successfully!`,
  });
}
