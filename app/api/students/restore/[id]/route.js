// /app/api/students/restore/[id]/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";


export async function PUT(req, { params }) {
await connectMongoDB();
const id = params.id;


await Student.findByIdAndUpdate(id, {
status: "Active",
});


return NextResponse.json({ success: true });
}