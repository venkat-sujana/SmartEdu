import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const existing = await College.findOne({ code: data.code });
    if (existing) {
      return NextResponse.json({ error: "College already exists with this code." }, { status: 400 });
    }

    const newCollege = await College.create({
      ...data,
      groups: ensureCollegeGroups(data.groups),
    });
    return NextResponse.json(newCollege, { status: 201 });
  } catch (error) {
    console.error("POST College Error:", error);
    return NextResponse.json({ error: "Failed to register college." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const colleges = await College.find({}, "_id name groups").sort({ name: 1 });
    return NextResponse.json(colleges, { status: 200 });
  } catch (error) {
    console.error("GET Colleges Error:", error);
    return NextResponse.json({ error: "Failed to fetch colleges." }, { status: 500 });
  }
}
