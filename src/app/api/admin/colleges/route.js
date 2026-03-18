import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import College from "@/models/College";
import { getAdminSession } from "@/lib/requireAdminSession";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { code: { $regex: search, $options: "i" } },
            { district: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const colleges = await College.find(query).sort({ name: 1 }).lean();
    return NextResponse.json({ data: colleges });
  } catch (error) {
    console.error("Admin colleges GET error:", error);
    return NextResponse.json({ error: "Failed to fetch colleges" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();
    const body = await req.json();
    const requiredFields = ["name", "code"];
    const missing = requiredFields.filter((field) => !String(body[field] || "").trim());
    if (missing.length) {
      return NextResponse.json({ error: `Missing required fields: ${missing.join(", ")}` }, { status: 400 });
    }

    const exists = await College.findOne({ code: body.code.trim() });
    if (exists) {
      return NextResponse.json({ error: "College already exists with this code." }, { status: 409 });
    }

    const college = await College.create({
      name: body.name.trim(),
      code: body.code.trim(),
      address: body.address?.trim() || "",
      district: body.district?.trim() || "",
      contactEmail: body.contactEmail?.trim() || "",
      contactPhone: body.contactPhone?.trim() || "",
      groups: ensureCollegeGroups(body.groups),
    });

    return NextResponse.json({ message: "College created", data: college }, { status: 201 });
  } catch (error) {
    console.error("Admin colleges POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create college" }, { status: 500 });
  }
}
