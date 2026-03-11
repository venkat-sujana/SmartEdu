
//app/api/students/test-promotion/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST() {
  try {
    await connectMongoDB();

    const dummyList = ["TESTF001", "TESTS002"];

    console.log("Safe test promotion: updating first year students...");
    const promoteDummy = await Student.updateMany(
      { admissionNo: "TESTF001", yearOfStudy: "First Year", status: "Active" },
      { $set: { yearOfStudy: "Second Year" } }
    );
    console.log("Safe test promotion: updated", promoteDummy.modifiedCount, "first year students");

    console.log("Safe test promotion: terminating second year students...");
    const terminateDummy = await Student.updateMany(
      { admissionNo: "TESTS002", yearOfStudy: "Second Year", status: "Active" },
      { $set: { status: "Terminated" } }
    );
    console.log("Safe test promotion: terminated", terminateDummy.modifiedCount, "second year students");

    return NextResponse.json({
      message: "SAFE TEST SUCCESS — Only dummy students affected!",
      promoted: promoteDummy.modifiedCount,
      terminated: terminateDummy.modifiedCount,
      ranAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("TEST Promotion Error:", error);
    return NextResponse.json(
      { error: "Server error during test promotion" },
      { status: 500 }
    );
  }
}
