import { NextResponse } from "next/server";
import AuditLog from "@/models/AuditLog";
import connectMongoDB from "@/lib/mongodb";
import { getAdminSession } from "@/lib/requireAdminSession";

export async function GET(req) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const entity = (searchParams.get("entity") || "").trim();
    const action = (searchParams.get("action") || "").trim();
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 8), 1), 50);
    const skip = (page - 1) * limit;
    const query = {};

    if (entity) query.entity = entity;
    if (action) query.action = action;
    if (search) {
      query.$or = [
        { actorName: { $regex: search, $options: "i" } },
        { actorEmail: { $regex: search, $options: "i" } },
        { actorRole: { $regex: search, $options: "i" } },
        { entity: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    console.error("Admin audit log GET error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
