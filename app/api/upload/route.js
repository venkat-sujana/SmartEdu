import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads");


  // const uploadDir = path.join(process.cwd(), "public", "uploads");
  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const fileUrl = `/uploads/${filename}`;
  return NextResponse.json({ success: true, url: fileUrl });
}
