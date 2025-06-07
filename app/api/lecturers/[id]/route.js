// app/api/lecturers/[id]/route.js

import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Cloudinary config
cloudinary.config({
  cloud_name: "dlwxpzc83",
  api_key: 562792651785938,
  api_secret: "Dz79bpyfHvklgMfW6ufZihpCQ1Y",
  secure: true,
});

// Helper to extract public ID from URL
function getPublicIdFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split("/");
    const folder = parts[parts.length - 2];
    const filename = parts[parts.length - 1].split(".")[0];
    return `${folder}/${filename}`;
  } catch {
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const lecturer = await Lecturer.findById(params.id);

    return NextResponse.json({ lecturer }); // ✅ lecturer key ఉండాలి
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectMongoDB();
    const body = await req.json();
    const lecturer = await Lecturer.findById(params.id);

    if (!lecturer) {
      return NextResponse.json(
        { message: "Lecturer not found" },
        { status: 404 }
      );
    }

    // If photo changed, delete the old one
    if (body.photo && lecturer.photo !== body.photo) {
      const publicId = getPublicIdFromUrl(lecturer.photo);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const updated = await Lecturer.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ status: "success", data: updated });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const lecturer = await Lecturer.findById(params.id);
    if (!lecturer) {
      return NextResponse.json(
        { message: "Lecturer not found" },
        { status: 404 }
      );
    }

    // Delete Cloudinary image
    if (lecturer.photo) {
      const publicId = getPublicIdFromUrl(lecturer.photo);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await Lecturer.findByIdAndDelete(params.id);
    return NextResponse.json({
      status: "success",
      message: "Lecturer deleted",
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
