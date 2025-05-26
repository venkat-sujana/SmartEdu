// app/api/lecturers/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";

export async function GET() {
  await connectMongoDB();
  const lecturers = await Lecturer.find();
  return NextResponse.json(lecturers); // return array
}