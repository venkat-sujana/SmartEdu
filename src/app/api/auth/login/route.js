import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import User from "@/models/User";
import LecturerProfile from "@/models/LecturerProfile";
import {
  comparePassword,
  setInvigilationAuthCookie,
  signInvigilationToken,
} from "@/lib/invigilation-auth";

export async function POST(req) {
  try {
    await connectInvigilationDB();
    const { email, identifier, password } = await req.json();
    const loginInput = String(identifier || email || "").trim();

    if (!loginInput || !password) {
      return NextResponse.json({ message: "Login ID and password are required" }, { status: 400 });
    }

    let user = null;
    if (loginInput.includes("@")) {
      user = await User.findOne({ email: loginInput.toLowerCase() });
    } else {
      const profile = await LecturerProfile.findOne({
        designation: { $regex: `^${loginInput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      }).lean();
      if (profile?.userId) {
        user = await User.findById(profile.userId);
      }
    }

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const ok = await comparePassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = signInvigilationToken({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
    setInvigilationAuthCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message || "Login failed" }, { status: 500 });
  }
}
