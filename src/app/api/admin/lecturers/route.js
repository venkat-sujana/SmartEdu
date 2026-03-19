import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import College from "@/models/College";
import { getAdminSession } from "@/lib/requireAdminSession";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 100);
    const skip = (page - 1) * limit;
    const query = {};

    if (collegeId) query.collegeId = collegeId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const [lecturers, total] = await Promise.all([
      Lecturer.find(query)
        .populate("collegeId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lecturer.countDocuments(query),
    ]);

    return NextResponse.json({
      data: lecturers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Admin lecturers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const body = await req.json();
    const requiredFields = ["name", "email", "password", "subject", "collegeId"];
    const missing = requiredFields.filter((field) => !String(body[field] || "").trim());
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const exists = await Lecturer.findOne({ email: body.email.trim().toLowerCase() });
    if (exists) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const college = await College.findById(body.collegeId).lean();
    if (!college) {
      return NextResponse.json({ error: "Invalid college" }, { status: 400 });
    }

    const lecturer = await Lecturer.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      password: await bcrypt.hash(body.password.trim(), 10),
      subject: body.subject,
      collegeId: body.collegeId,
      collegeName: college.name,
      photo: body.photo || "",
      role: "lecturer",
    });

    const created = await Lecturer.findById(lecturer._id).populate("collegeId", "name").lean();
    return NextResponse.json({ message: "Lecturer created", data: created }, { status: 201 });
  } catch (error) {
    console.error("Admin lecturers POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create lecturer" }, { status: 500 });
  }
}

