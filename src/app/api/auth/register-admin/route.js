import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import User from "@/models/User";
import { hashPassword } from "@/lib/invigilation-auth";

export async function POST(req) {
  try {
    await connectInvigilationDB();
    const { name, email, password, setupKey } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const admins = await User.countDocuments({ role: "admin" });
    const configuredSetupKey = process.env.ADMIN_SETUP_KEY;
    if (admins > 0 && (!configuredSetupKey || setupKey !== configuredSetupKey)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const exists = await User.findOne({ email: email.trim().toLowerCase() });
    if (exists) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await hashPassword(password),
      role: "admin",
    });

    return NextResponse.json({
      message: "Admin created",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Failed" }, { status: 500 });
  }
}

