// app/api/upload/route.js
import cloudinary  from "@/lib/cloudinary"; // ✅
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import os from "os"; // ✅ OS-specific tmp dir
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Use OS-specific tmp directory (works on Windows, Linux, Mac)
    const tempDir = path.join(os.tmpdir(), "uploads");
    await mkdir(tempDir, { recursive: true }); // Create directory if not exists

    const tempFilename = `${randomUUID()}.jpg`;
    const tempFilePath = path.join(tempDir, tempFilename);

    await writeFile(tempFilePath, buffer);

    const uploaded = await cloudinary.uploader.upload(tempFilePath, {
      folder: "osra_uploads",
    });

    return NextResponse.json({ success: true, url: uploaded.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { success: false, message: "Upload failed", error: err.message },
      { status: 500 }
    );
  }
}

