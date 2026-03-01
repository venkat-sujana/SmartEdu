import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import User from "@/models/User";
import LecturerProfile from "@/models/LecturerProfile";
import { hashPassword } from "@/lib/invigilation-auth";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function GET(req) {
  const { error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  await connectInvigilationDB();
  const lecturers = await User.find({ role: "lecturer" }).sort({ createdAt: -1 }).lean();
  const profiles = await LecturerProfile.find({
    userId: { $in: lecturers.map((l) => l._id) },
  }).lean();
  const profileByUser = new Map(profiles.map((p) => [String(p.userId), p]));

  const data = lecturers.map((l) => ({
    id: l._id,
    name: l.name,
    role: l.role,
    designation:
      profileByUser.get(String(l._id))?.designation ||
      profileByUser.get(String(l._id))?.department ||
      "",
    institutionName: profileByUser.get(String(l._id))?.institutionName || "",
    phone: profileByUser.get(String(l._id))?.phone || "",
    loginId: l.email,
  }));

  return NextResponse.json({ data });
}

export async function POST(req) {
  const { user: admin, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { name, designation, institutionName, phone, password } = await req.json();
    if (!name || !designation || !institutionName || !phone) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const normalizedPhone = String(phone).replace(/\D/g, "");
    const baseLoginId = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, ".")}.${normalizedPhone.slice(-4) || "0000"}@invig.local`;
    let loginId = baseLoginId;
    let suffix = 1;
    while (await User.findOne({ email: loginId })) {
      suffix += 1;
      loginId = `${baseLoginId.replace("@invig.local", "")}.${suffix}@invig.local`;
    }

    const existing = await LecturerProfile.findOne({
      designation: designation.trim(),
      institutionName: institutionName.trim(),
      phone: phone.trim(),
    });
    if (existing) {
      return NextResponse.json({ message: "Lecturer already exists" }, { status: 409 });
    }

    const rawPassword = password?.trim() || phone.slice(-6) || "welcome123";
    const lecturerUser = await User.create({
      name: name.trim(),
      email: loginId,
      password: await hashPassword(rawPassword),
      role: "lecturer",
      createdBy: admin._id,
    });

    await LecturerProfile.create({
      userId: lecturerUser._id,
      designation: designation.trim(),
      institutionName: institutionName.trim(),
      phone: phone.trim(),
    });

    return NextResponse.json({
      message: "Lecturer added successfully",
      lecturer: {
        id: lecturerUser._id,
        name: lecturerUser.name,
        designation,
        institutionName,
        phone,
      },
      loginId: lecturerUser.email,
      tempPassword: rawPassword,
    });
  } catch (error2) {
    return NextResponse.json({ message: error2.message || "Failed to add lecturer" }, { status: 500 });
  }
}
