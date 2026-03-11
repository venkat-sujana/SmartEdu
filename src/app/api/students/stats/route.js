import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET() {
  try {
    await connectMongoDB();

    const total = await Student.countDocuments({});
    const active = await Student.countDocuments({ status: "Active" });
    const terminated = await Student.countDocuments({ status: "Terminated" });

    return NextResponse.json({
      total,
      active,
      terminated,
    });
  } catch (error) {
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}
