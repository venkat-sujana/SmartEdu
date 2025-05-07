// app/api/students/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from "@/models/Student";
import cloudinary from "@/lib/cloudinary";
import { writeFile } from "fs/promises";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};



// export async function POST(req) {
//   try {
//     await connectMongoDB();
//     console.log("body:", req.body);
//     const body = await req.json();
//     console.log("body:", body);
//     const student = await Student.create(body);
//     console.log("student:", student);
//     return Response.json({ status: "success", data: student }, { status: 201 });
//   } catch (error) {
//     console.log("error:", error.message);
//     return Response.json({ status: "error", message: error.message }, { status: 500 });
//   }
// }

// app/api/students/route.js






export const dynamic = "force-dynamic"; // Edge runtime డిసేబుల్

export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const fields = Object.fromEntries(formData.entries());

    const file = formData.get("photo");
    let photoUrl = "";

    if (file && typeof file === "object") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

      // Upload to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "students",
      });

      photoUrl = cloudinaryResponse.secure_url;
    }

    const student = await Student.create({
      ...fields,
      photo: photoUrl,
    });

    return Response.json({ status: "success", data: student }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}





export async function GET() {
  try {
    console.log("GET /api/students");
    await connectMongoDB();
    console.log("connected to MongoDB");
    const students = await Student.find().sort({ createdAt: -1 });
    console.log("students:", students);
    return Response.json({ status: "success", data: students });
  } catch (error) {
    console.log("error:", error.message);
    return Response.json({ status: "error", message: error.message }, { status: 500 });
  }
}
