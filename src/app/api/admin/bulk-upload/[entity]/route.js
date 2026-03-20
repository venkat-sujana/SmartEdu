import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import College from "@/models/College";
import Exam from "@/models/Exam";
import Lecturer from "@/models/Lecturer";
import Principal from "@/models/Principal";
import Student from "@/models/Student";
import { getAdminSession } from "@/lib/requireAdminSession";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

const SUBJECT_OPTIONS = new Set([
  "Maths",
  "Physics",
  "English",
  "Telugu",
  "Hindi",
  "Civics",
  "Zoology",
  "Botany",
  "Chemistry",
  "CET",
  "MLT",
  "Economics",
  "History",
  "Commerce",
  "MandAT",
  "GFC",
]);
const CASTE_OPTIONS = new Set(["OC", "OBC", "BC-A", "BC-B", "BC-C", "BC-D", "BC-E", "SC-A", "SC-B", "SC-C", "SC", "ST", "OTHER"]);
const GENDER_OPTIONS = new Set(["Male", "Female", "Other"]);
const YEAR_OPTIONS = new Set(["First Year", "Second Year"]);
const ATTENDANCE_STATUS_OPTIONS = new Set(["Present", "Absent"]);
const ATTENDANCE_SESSION_OPTIONS = new Set(["FN", "AN"]);
const EXAM_TYPE_OPTIONS = new Set(["UNIT-1", "UNIT-2", "UNIT-3", "UNIT-4", "QUARTERLY", "HALFYEARLY", "PRE-PUBLIC-1", "PRE-PUBLIC-2"]);
const GENERAL_STREAMS = new Set(["MPC", "BIPC", "CEC", "HEC"]);
const VOCATIONAL_STREAMS = new Set(["M&AT", "CET", "MLT"]);

function toText(value) {
  return String(value ?? "").trim();
}

function normalizeKey(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getCell(row, aliases) {
  const wanted = aliases.map(normalizeKey);
  for (const [key, value] of Object.entries(row || {})) {
    if (wanted.includes(normalizeKey(key))) return value;
  }
  return "";
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

function normalizeExamStream(value) {
  const group = normalizeGroup(value);
  if (group === "BiPC") return "BIPC";
  return group;
}

function normalizeEmail(value) {
  return toText(value).toLowerCase();
}

function formatErrors(errors) {
  return errors.slice(0, 50);
}

function parseGroups(value) {
  return toText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveCollege(row, defaultCollegeId, collegesById, collegesByCode) {
  const collegeId = toText(getCell(row, ["collegeId", "college id"]));
  const collegeCode = toText(getCell(row, ["collegeCode", "college code"])).toUpperCase();

  if (collegeId && collegesById.has(collegeId)) return collegesById.get(collegeId);
  if (collegeCode && collegesByCode.has(collegeCode)) return collegesByCode.get(collegeCode);
  if (defaultCollegeId && collegesById.has(defaultCollegeId)) return collegesById.get(defaultCollegeId);
  return null;
}

function resolveStudent(row, college, studentsById, studentsByAdmissionKey) {
  const studentId = toText(getCell(row, ["studentId", "student id"]));
  const admissionNo = toText(getCell(row, ["studentAdmissionNo", "student admission no", "admissionNo", "admission no"])).toUpperCase();
  const collegeKey = String(college._id);

  if (studentId && studentsById.has(studentId)) {
    const student = studentsById.get(studentId);
    if (String(student.collegeId) === collegeKey) return student;
  }

  if (admissionNo) {
    return studentsByAdmissionKey.get(`${collegeKey}:${admissionNo}`) || null;
  }

  return null;
}

function parseSubjectMarks(value) {
  const text = toText(value);
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const normalized = {};
    Object.entries(parsed).forEach(([key, mark]) => {
      const subject = toText(key);
      const numeric = Number(mark);
      if (subject && Number.isFinite(numeric)) {
        normalized[subject] = numeric;
      }
    });

    return Object.keys(normalized).length ? normalized : null;
  } catch {
    const entries = text.split(",").map((item) => item.trim()).filter(Boolean);
    if (!entries.length) return null;

    const normalized = {};
    for (const entry of entries) {
      const [subject, mark] = entry.split(":");
      const subjectName = toText(subject);
      const numeric = Number(toText(mark));
      if (!subjectName || !Number.isFinite(numeric)) {
        return null;
      }
      normalized[subjectName] = numeric;
    }

    return Object.keys(normalized).length ? normalized : null;
  }
}

function calculateExamResult(subjects) {
  const values = Object.values(subjects || {});
  const total = values.reduce((sum, mark) => sum + Number(mark || 0), 0);
  const percentage = values.length ? Number((total / values.length).toFixed(2)) : 0;
  return { total, percentage };
}

export async function POST(req, context) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { entity } = await context.params;
    if (!["colleges", "students", "lecturers", "principals", "attendance", "exams"].includes(entity)) {
      return NextResponse.json({ error: "Unsupported entity" }, { status: 400 });
    }

    await connectMongoDB();

    const formData = await req.formData();
    const file = formData.get("file");
    const defaultCollegeId = toText(formData.get("collegeId"));
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(bytes), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json({ error: "Uploaded file has no rows" }, { status: 400 });
    }

    const colleges = await College.find({}).select("_id name code groups").lean();
    const collegesById = new Map(colleges.map((college) => [String(college._id), college]));
    const collegesByCode = new Map(colleges.map((college) => [String(college.code).toUpperCase(), college]));
    const students = await Student.find({}).select("_id collegeId admissionNo group yearOfStudy").lean();
    const studentsById = new Map(students.map((student) => [String(student._id), student]));
    const studentsByAdmissionKey = new Map(
      students.map((student) => [`${String(student.collegeId)}:${String(student.admissionNo || "").toUpperCase()}`, student])
    );
    const currentYear = new Date().getFullYear();
    const docs = [];
    const errors = [];
    const seen = new Set();

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rowNumber = index + 2;

      if (entity === "colleges") {
        const name = toText(getCell(row, ["name", "college name"]));
        const code = toText(getCell(row, ["code", "college code"])).toUpperCase();
        const address = toText(getCell(row, ["address"]));
        const district = toText(getCell(row, ["district"]));
        const contactEmail = normalizeEmail(getCell(row, ["contactEmail", "contact email", "email"]));
        const contactPhone = toText(getCell(row, ["contactPhone", "contact phone", "phone"]));
        const groups = parseGroups(getCell(row, ["groups", "group list"]));
        const issues = [];
        if (!name) issues.push("Name is required");
        if (!code) issues.push("Code is required");
        if (seen.has(code)) issues.push("Duplicate college code in file");
        if (code) seen.add(code);
        if (issues.length) {
          errors.push({ row: rowNumber, issues });
          continue;
        }
        docs.push({ name, code, address, district, contactEmail, contactPhone, groups: ensureCollegeGroups(groups) });
        continue;
      }

      const college = resolveCollege(row, defaultCollegeId, collegesById, collegesByCode);
      if (!college) {
        errors.push({ row: rowNumber, issues: ["Valid collegeId or collegeCode is required"] });
        continue;
      }

      if (entity === "lecturers") {
        const name = toText(getCell(row, ["name"]));
        const email = normalizeEmail(getCell(row, ["email"]));
        const password = toText(getCell(row, ["password"]));
        const subject = toText(getCell(row, ["subject"]));
        const photo = toText(getCell(row, ["photo", "photo url"]));
        const issues = [];
        if (!name) issues.push("Name is required");
        if (!email) issues.push("Email is required");
        if (!password || password.length < 6) issues.push("Password with at least 6 characters is required");
        if (!SUBJECT_OPTIONS.has(subject)) issues.push(`Invalid subject: ${subject || "(empty)"}`);
        if (seen.has(email)) issues.push("Duplicate email in file");
        if (email) seen.add(email);
        if (issues.length) {
          errors.push({ row: rowNumber, email, issues });
          continue;
        }
        docs.push({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          subject,
          photo,
          collegeId: college._id,
          collegeName: college.name,
          role: "lecturer",
        });
        continue;
      }

      if (entity === "principals") {
        const name = toText(getCell(row, ["name"]));
        const email = normalizeEmail(getCell(row, ["email"]));
        const password = toText(getCell(row, ["password"]));
        const photo = toText(getCell(row, ["photo", "photo url"]));
        const dateOfJoining = toDate(getCell(row, ["dateOfJoining", "date of joining"]));
        const issues = [];
        if (!name) issues.push("Name is required");
        if (!email) issues.push("Email is required");
        if (!password || password.length < 6) issues.push("Password with at least 6 characters is required");
        if (toText(getCell(row, ["dateOfJoining", "date of joining"])) && !dateOfJoining) issues.push("Invalid dateOfJoining");
        if (seen.has(email)) issues.push("Duplicate email in file");
        if (email) seen.add(email);
        if (issues.length) {
          errors.push({ row: rowNumber, email, issues });
          continue;
        }
        docs.push({
          name,
          email,
          password: await bcrypt.hash(password, 10),
          photo,
          dateOfJoining: dateOfJoining || new Date(),
          collegeId: college._id,
          role: "principal",
        });
        continue;
      }

      if (entity === "attendance") {
        const student = resolveStudent(row, college, studentsById, studentsByAdmissionKey);
        const date = toDate(getCell(row, ["date", "attendance date"]));
        const sessionValue = toText(getCell(row, ["session"])).toUpperCase() || "FN";
        const status = toText(getCell(row, ["status"]));
        const lecturerName = toText(getCell(row, ["lecturerName", "lecturer name"]));
        const issues = [];

        if (!student) issues.push("Valid studentAdmissionNo or studentId is required");
        if (toText(getCell(row, ["date", "attendance date"])) && !date) issues.push("Invalid date");
        if (!date) issues.push("Date is required");
        if (!ATTENDANCE_SESSION_OPTIONS.has(sessionValue)) issues.push(`Invalid session: ${sessionValue || "(empty)"}`);
        if (!ATTENDANCE_STATUS_OPTIONS.has(status)) issues.push(`Invalid status: ${status || "(empty)"}`);

        const uniqueKey = student ? `${String(student._id)}:${date?.toISOString()}:${sessionValue}` : "";
        if (uniqueKey && seen.has(uniqueKey)) issues.push("Duplicate attendance row in file");
        if (uniqueKey) seen.add(uniqueKey);

        if (issues.length) {
          errors.push({ row: rowNumber, issues });
          continue;
        }

        docs.push({
          studentId: student._id,
          collegeId: college._id,
          date,
          session: sessionValue,
          status,
          group: student.group,
          yearOfStudy: student.yearOfStudy,
          lecturerName,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          markedAt: new Date(),
        });
        continue;
      }

      if (entity === "exams") {
        const student = resolveStudent(row, college, studentsById, studentsByAdmissionKey);
        const academicYear = toText(getCell(row, ["academicYear", "academic year"]));
        const examType = toText(getCell(row, ["examType", "exam type"]));
        const examDate = toDate(getCell(row, ["examDate", "exam date"]));
        const subjects = parseSubjectMarks(getCell(row, ["subjects", "subjectMarks", "subject marks"]));
        const stream = student ? normalizeExamStream(student.group) : "";
        const issues = [];

        if (!student) issues.push("Valid studentAdmissionNo or studentId is required");
        if (!academicYear) issues.push("AcademicYear is required");
        if (!EXAM_TYPE_OPTIONS.has(examType)) issues.push(`Invalid examType: ${examType || "(empty)"}`);
        if (toText(getCell(row, ["examDate", "exam date"])) && !examDate) issues.push("Invalid examDate");
        if (!examDate) issues.push("ExamDate is required");
        if (!subjects) issues.push("Subjects must be valid JSON or subject:marks pairs");
        if (student && !GENERAL_STREAMS.has(stream) && !VOCATIONAL_STREAMS.has(stream)) {
          issues.push(`Unsupported group for exams: ${student.group || "(empty)"}`);
        }

        const uniqueKey = student ? `${String(student._id)}:${academicYear}:${examType}:${examDate?.toISOString()}` : "";
        if (uniqueKey && seen.has(uniqueKey)) issues.push("Duplicate exam row in file");
        if (uniqueKey) seen.add(uniqueKey);

        if (issues.length) {
          errors.push({ row: rowNumber, issues });
          continue;
        }

        const { total, percentage } = calculateExamResult(subjects);
        docs.push({
          studentId: student._id,
          collegeId: college._id,
          stream,
          yearOfStudy: student.yearOfStudy,
          academicYear,
          examType,
          examDate,
          generalSubjects: GENERAL_STREAMS.has(stream) ? subjects : undefined,
          vocationalSubjects: VOCATIONAL_STREAMS.has(stream) ? subjects : undefined,
          total,
          percentage,
        });
        continue;
      }

      const name = toText(getCell(row, ["name"]));
      const fatherName = toText(getCell(row, ["fatherName", "father name"]));
      const mobile = toText(getCell(row, ["mobile"]));
      const parentMobile = toText(getCell(row, ["parentMobile", "parent mobile"]));
      const admissionNo = toText(getCell(row, ["admissionNo", "admission no"])).toUpperCase();
      const password = toText(getCell(row, ["password"]));
      const group = normalizeGroup(getCell(row, ["group"]));
      const yearOfStudy = toYear(getCell(row, ["yearOfStudy", "year of study"]));
      const gender = toText(getCell(row, ["gender"]));
      const caste = toText(getCell(row, ["caste"])).toUpperCase();
      const admissionYear = Number(toText(getCell(row, ["admissionYear", "admission year"])));
      const dob = toDate(getCell(row, ["dob"]));
      const dateOfJoining = toDate(getCell(row, ["dateOfJoining", "date of joining"]));
      const photo = toText(getCell(row, ["photo", "photo url"]));
      const address = toText(getCell(row, ["address"]));
      const allowedGroups = new Set(ensureCollegeGroups(college.groups));
      const issues = [];

      if (!name) issues.push("Name is required");
      if (!fatherName) issues.push("FatherName is required");
      if (!/^[6-9]\d{9}$/.test(mobile)) issues.push("Mobile must be a valid 10-digit Indian number");
      if (!/^[6-9]\d{9}$/.test(parentMobile)) issues.push("ParentMobile must be a valid 10-digit Indian number");
      if (!admissionNo) issues.push("AdmissionNo is required");
      if (!password || password.length < 6) issues.push("Password with at least 6 characters is required");
      if (!allowedGroups.has(group)) issues.push(`Invalid Group: ${group || "(empty)"}`);
      if (!YEAR_OPTIONS.has(yearOfStudy)) issues.push(`Invalid YearOfStudy: ${yearOfStudy || "(empty)"}`);
      if (!GENDER_OPTIONS.has(gender)) issues.push(`Invalid Gender: ${gender || "(empty)"}`);
      if (!CASTE_OPTIONS.has(caste)) issues.push(`Invalid Caste: ${caste || "(empty)"}`);
      if (!Number.isInteger(admissionYear) || admissionYear < 2000 || admissionYear > currentYear + 1) issues.push("AdmissionYear is invalid");
      if (!address) issues.push("Address is required");
      if (toText(getCell(row, ["dob"])) && !dob) issues.push("Invalid DOB");
      if (toText(getCell(row, ["dateOfJoining", "date of joining"])) && !dateOfJoining) issues.push("Invalid dateOfJoining");
      if (seen.has(admissionNo)) issues.push("Duplicate admission number in file");
      if (admissionNo) seen.add(admissionNo);

      if (issues.length) {
        errors.push({ row: rowNumber, admissionNo, issues });
        continue;
      }

      docs.push({
        name,
        fatherName,
        mobile,
        parentMobile,
        admissionNo,
        password: await bcrypt.hash(password, 10),
        group,
        yearOfStudy,
        gender,
        caste,
        admissionYear,
        dob: dob || undefined,
        dateOfJoining: dateOfJoining || undefined,
        photo,
        address,
        collegeId: college._id,
        subjects: [],
        role: "student",
        status: "Active",
      });
    }

    if (!docs.length) {
      return NextResponse.json({
        message: "No valid rows to upload",
        insertedCount: 0,
        skippedCount: rows.length,
        errors: formatErrors(errors),
      }, { status: 400 });
    }

    if (entity === "colleges") {
      const codes = docs.map((doc) => doc.code);
      const existing = await College.find({ code: { $in: codes } }).select("code").lean();
      const existingCodes = new Set(existing.map((item) => item.code));
      const filteredDocs = docs.filter((doc) => {
        if (existingCodes.has(doc.code)) {
          errors.push({ code: doc.code, issues: ["College code already exists"] });
          return false;
        }
        return true;
      });
      if (!filteredDocs.length) {
        return NextResponse.json({ message: "All rows were skipped", insertedCount: 0, skippedCount: rows.length, errors: formatErrors(errors) }, { status: 400 });
      }
      await College.insertMany(filteredDocs, { ordered: false });
      return NextResponse.json({
        message: `${filteredDocs.length} colleges uploaded successfully`,
        insertedCount: filteredDocs.length,
        skippedCount: rows.length - filteredDocs.length,
        errors: formatErrors(errors),
      });
    }

    if (entity === "attendance") {
      const existing = await Attendance.find({
        $or: docs.map((doc) => ({ studentId: doc.studentId, date: doc.date, session: doc.session })),
      }).select("studentId date session").lean();
      const existingSet = new Set(
        existing.map((item) => `${String(item.studentId)}:${new Date(item.date).toISOString()}:${item.session}`)
      );

      const filteredDocs = docs.filter((doc) => {
        const key = `${String(doc.studentId)}:${new Date(doc.date).toISOString()}:${doc.session}`;
        if (existingSet.has(key)) {
          errors.push({ studentId: String(doc.studentId), issues: ["Attendance already exists"] });
          return false;
        }
        return true;
      });

      if (!filteredDocs.length) {
        return NextResponse.json({ message: "All rows were skipped", insertedCount: 0, skippedCount: rows.length, errors: formatErrors(errors) }, { status: 400 });
      }

      await Attendance.insertMany(filteredDocs, { ordered: false });

      return NextResponse.json({
        message: `${filteredDocs.length} attendance records uploaded successfully`,
        insertedCount: filteredDocs.length,
        skippedCount: rows.length - filteredDocs.length,
        errors: formatErrors(errors),
      });
    }

    if (entity === "exams") {
      await Exam.insertMany(docs, { ordered: false });

      return NextResponse.json({
        message: `${docs.length} exams uploaded successfully`,
        insertedCount: docs.length,
        skippedCount: rows.length - docs.length,
        errors: formatErrors(errors),
      });
    }

    const Model = entity === "students" ? Student : entity === "lecturers" ? Lecturer : Principal;
    const uniqueField = entity === "students" ? "admissionNo" : "email";
    const uniqueValues = docs.map((doc) => doc[uniqueField]);
    const existing = await Model.find({ [uniqueField]: { $in: uniqueValues } }).select(uniqueField).lean();
    const existingSet = new Set(existing.map((item) => item[uniqueField]));
    const filteredDocs = docs.filter((doc) => {
      if (existingSet.has(doc[uniqueField])) {
        errors.push({ [uniqueField]: doc[uniqueField], issues: [`${uniqueField} already exists`] });
        return false;
      }
      return true;
    });

    if (!filteredDocs.length) {
      return NextResponse.json({ message: "All rows were skipped", insertedCount: 0, skippedCount: rows.length, errors: formatErrors(errors) }, { status: 400 });
    }

    await Model.insertMany(filteredDocs, { ordered: false });

    return NextResponse.json({
      message: `${filteredDocs.length} ${entity} uploaded successfully`,
      insertedCount: filteredDocs.length,
      skippedCount: rows.length - filteredDocs.length,
      errors: formatErrors(errors),
    });
  } catch (error) {
    console.error("Admin bulk upload error:", error);
    return NextResponse.json({ error: error.message || "Bulk upload failed" }, { status: 500 });
  }
}


