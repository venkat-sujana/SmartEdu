// app/api/colleges/route.js

import { NextResponse } from "next/server";
import College from "@/models/College";
import connectMongoDB from "@/lib/mongodb";

// ✅ POST: Create a new college
export async function POST(req) {
  try {
    await connectMongoDB();
    const data = await req.json();

    const existing = await College.findOne({ code: data.code });
    if (existing) {
      return NextResponse.json({ error: "College already exists with this code." }, { status: 400 });
    }

    const newCollege = await College.create(data);
    return NextResponse.json(newCollege, { status: 201 });
  } catch (error) {
    console.error("POST College Error:", error);
    return NextResponse.json({ error: "Failed to register college." }, { status: 500 });
  }
}

// ✅ GET: Return only required fields (_id, name) for dropdowns
export async function GET() {
  try {
    await connectMongoDB();

    const colleges = await College.find({}, "_id name").sort({ name: 1 });
    return NextResponse.json(colleges, { status: 200 });
  } catch (error) {
    console.error("GET Colleges Error:", error);
    return NextResponse.json({ error: "Failed to fetch colleges." }, { status: 500 });
  }
}
