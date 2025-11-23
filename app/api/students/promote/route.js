//app/api/students/promote/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST() {
  try {
    await connectMongoDB();

    console.log("Promoting students...");
    // 1️⃣ First Year → Second Year Promotion
    const promoteFirstYear = await Student.updateMany(
      { yearOfStudy: "First Year", status: "Active" },
      { $set: { yearOfStudy: "Second Year" } }
    );
    console.log("Promoted", promoteFirstYear.modifiedCount, "First Year students");

    console.log("Terminating Second Year students...");
    // 2️⃣ Second Year → Terminate
    const terminateSecondYear = await Student.updateMany(
      { yearOfStudy: "Second Year", status: "Active" },
      { $set: { status: "Terminated" } }
    );
    console.log("Terminated", terminateSecondYear.modifiedCount, "Second Year students");

    console.log("Sending promotion time...");
    // 3️⃣ Send Promotion Time (for UI display)
    const ranAt = new Date().toISOString();

    return NextResponse.json({
      message: "Promotion & termination completed successfully",
      promoted: promoteFirstYear.modifiedCount,
      terminated: terminateSecondYear.modifiedCount,
      ranAt,
    });
  } catch (error) {
    console.error("Promotion Error:", error);
    return NextResponse.json(
      { error: "Server error while promoting students" },
      { status: 500 }
    );
  }
}
