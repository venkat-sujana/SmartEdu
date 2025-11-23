// /app/api/students/terminated/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";


export async function GET() {
await connectMongoDB();
const data = await Student.find({ status: "Terminated" }).sort({ name: 1 });
return NextResponse.json(data);
}