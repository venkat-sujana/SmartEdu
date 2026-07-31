//src/app/api/auth/register-admin/route.js
import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import User from "@/models/User";
import { hashPassword } from "@/lib/invigilation-auth";

export async function GET() {
  try {
    await connectInvigilationDB();
    const admins = await User.countDocuments({ role: "admin" });
    return NextResponse.json({ hasAdmins: admins > 0, totalAdmins: admins });
  } catch (error) {
    return NextResponse.json({ message: error.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectInvigilationDB();
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const setupKey = String(body?.setupKey || "").trim();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const admins = await User.countDocuments({ role: "admin" });
    const configuredSetupKey = String(process.env.ADMIN_SETUP_KEY || "").trim();

    // Allow setup to proceed when no setup key is configured.
    // Only enforce the key when the project owner explicitly configured one.
    if (admins > 0 && configuredSetupKey && setupKey !== configuredSetupKey) {
      return NextResponse.json({ message: "Forbidden: invalid setup key" }, { status: 403 });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "Email already exists" }, { status: 409 });
    }

    const user = await User.create({
      name,
      email,
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
