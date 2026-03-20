//app/api/students/bulk-upload/route.js
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import College from "@/models/College";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

const ALLOWED_CASTES = new Set([
  "OC",
  "OBC",
  "BC-A",
  "BC-B",
  "BC-C",
  "BC-D",
  "BC-E",
  "SC-A",
  "SC-B",
  "SC-C",
  "SC",
  "ST",
  "OTHER",
]);
const ALLOWED_GENDERS = new Set(["Male", "Female", "Other"]);
const ALLOWED_YEARS = new Set(["First Year", "Second Year"]);

function toText(value) {
  return String(value ?? "").trim();
}

function toDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(parsed.y, parsed.m - 1, parsed.d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toYear(value) {
  const text = toText(value);
  if (!text) return "";
  if (text === "1" || /^1st/i.test(text)) return "First Year";
  if (text === "2" || /^2nd/i.test(text)) return "Second Year";
  return text;
}

function normalizeGroup(value) {
  const text = toText(value);
  if (!text) return "";
  if (text.toUpperCase() === "BIPC") return "BIPC";
  return text;
}

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
  if (!mongoose.Types.ObjectId.isValid(collegeId)) {
    return NextResponse.json({ message: "Invalid college ID" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const uint8Array = new Uint8Array(buffer);
  const workbook = XLSX.read(uint8Array, { type: "array" });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (!excelData.length) {
    return NextResponse.json({ message: "Uploaded file has no rows" }, { status: 400 });
  }

  const collegeObjectId = new mongoose.Types.ObjectId(collegeId);
  const currentYear = new Date().getFullYear();
  const errors = [];
  const seenAdmissionNos = new Set();
  const parsedRows = [];
  const college = await College.findById(collegeObjectId).select("groups").lean();
  const allowedGroups = new Set(ensureCollegeGroups(college?.groups));

  for (let i = 0; i < excelData.length; i += 1) {
    const row = excelData[i];
    const rowNumber = i + 2;

    const name = toText(row.Name);
    const fatherName = toText(row.FatherName);
    const mobile = toText(row.Mobile);
    const parentMobile = toText(row.ParentMobile);
    const group = normalizeGroup(row.Group);
    const caste = toText(row.Caste).toUpperCase();
    const gender = toText(row.Gender);
    const admissionNo = toText(row.AdmissionNo);
    const yearOfStudy = toYear(row.YearOfStudy);
    const admissionYear = Number(toText(row.AdmissionYear));
    const dateOfJoiningRaw = toDate(row.dateOfJoining);
    const dateOfJoining = dateOfJoiningRaw || new Date();
    const address = toText(row.Address);

    const rowIssues = [];
    if (!name) rowIssues.push("Name is required");
    if (!fatherName) rowIssues.push("FatherName is required");
    if (!/^[6-9]\d{9}$/.test(mobile)) rowIssues.push("Mobile must be a valid 10-digit Indian number");
    if (!/^[6-9]\d{9}$/.test(parentMobile)) rowIssues.push("ParentMobile must be a valid 10-digit Indian number");
    if (!allowedGroups.has(group)) rowIssues.push(`Invalid Group: ${group || "(empty)"}`);
    if (!ALLOWED_CASTES.has(caste)) rowIssues.push(`Invalid Caste: ${caste || "(empty)"}`);
    if (!ALLOWED_GENDERS.has(gender)) rowIssues.push(`Invalid Gender: ${gender || "(empty)"}`);
    if (!admissionNo) rowIssues.push("AdmissionNo is required");
    if (!ALLOWED_YEARS.has(yearOfStudy)) rowIssues.push(`Invalid YearOfStudy: ${yearOfStudy || "(empty)"}`);
    if (!Number.isInteger(admissionYear) || admissionYear < 2000 || admissionYear > currentYear + 1) {
      rowIssues.push("AdmissionYear is invalid");
    }
    if (!address) rowIssues.push("Address is required");
    if (toText(row.dateOfJoining) && !dateOfJoiningRaw) rowIssues.push("dateOfJoining is invalid");

    if (seenAdmissionNos.has(admissionNo)) {
      rowIssues.push("Duplicate AdmissionNo in uploaded file");
    } else if (admissionNo) {
      seenAdmissionNos.add(admissionNo);
    }

    if (rowIssues.length) {
      errors.push({ row: rowNumber, admissionNo, issues: rowIssues });
      continue;
    }

    parsedRows.push({
      __row: rowNumber,
      name,
      fatherName,
      mobile,
      parentMobile,
      group,
      caste,
      gender,
      admissionNo,
      yearOfStudy,
      admissionYear,
      dateOfJoining,
      address,
      password: "-",
      mustChangePassword: true,
      photo: "",
      collegeId: collegeObjectId,
      subjects: [],
      role: "student",
    });
  }

  if (!parsedRows.length) {
    return NextResponse.json(
      { message: "No valid rows to upload", insertedCount: 0, skippedCount: excelData.length, errors },
      { status: 400 }
    );
  }

  const admissionNos = parsedRows.map((r) => r.admissionNo);
  const existingStudents = await Student.find({
    collegeId: collegeObjectId,
    admissionNo: { $in: admissionNos },
  })
    .select("admissionNo")
    .lean();

  const existingAdmissionSet = new Set(existingStudents.map((s) => s.admissionNo));
  const docsToInsert = [];

  for (const doc of parsedRows) {
    if (existingAdmissionSet.has(doc.admissionNo)) {
      errors.push({
        row: doc.__row,
        admissionNo: doc.admissionNo,
        issues: ["AdmissionNo already exists in this college"],
      });
      continue;
    }
    delete doc.__row;
    docsToInsert.push(doc);
  }

  if (!docsToInsert.length) {
    return NextResponse.json({
      message: "All rows were skipped (duplicates/invalid data)",
      insertedCount: 0,
      skippedCount: excelData.length,
      errors,
    });
  }

  const operations = docsToInsert.map((document) => ({
    insertOne: { document },
  }));

  let insertedCount = 0;
  try {
    const bulkResult = await Student.bulkWrite(operations, { ordered: false });
    insertedCount = bulkResult.insertedCount || 0;
  } catch (error) {
    insertedCount = error?.result?.insertedCount || 0;
    if (!insertedCount) throw error;
  }

  return NextResponse.json({
    message: `${insertedCount} students uploaded successfully`,
    insertedCount,
    skippedCount: excelData.length - insertedCount,
    errors,
  });
}


