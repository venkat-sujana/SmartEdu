//src/app/api/invigilation/rooms/route.js
import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import InvigilationRoom from "@/models/InvigilationRoom";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

export async function GET(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin", "lecturer"]);
  if (error) return error;

  await connectInvigilationDB();

  const filter = user.collegeId
    ? {
        $or: [
          { collegeId: user.collegeId },
          { collegeId: { $exists: false } },
          { collegeId: null },
        ],
      }
    : {};

  const rooms = await InvigilationRoom.find(filter)
    .sort({ name: 1 })
    .populate("createdBy", "name role")
    .lean();

  return NextResponse.json({ role: user.role, data: rooms });
}

export async function POST(req) {
  const { user, error } = await requireInvigilationAuth(req, ["admin"]);
  if (error) return error;

  try {
    await connectInvigilationDB();
    const { name, block, capacity, collegeId } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ message: "Room name is required" }, { status: 400 });
    }

    const resolvedCollegeId = user.collegeId || collegeId || undefined;
    const normalizedName = name.trim().toUpperCase();

    const existingRoom = await InvigilationRoom.findOne(
      resolvedCollegeId
        ? {
            name: normalizedName,
            $or: [
              { collegeId: resolvedCollegeId },
              { collegeId: { $exists: false } },
              { collegeId: null },
            ],
          }
        : { name: normalizedName }
    ).lean();

    if (existingRoom) {
      return NextResponse.json({ message: "Room already exists" }, { status: 409 });
    }

    const created = await InvigilationRoom.create({
      name: normalizedName,
      block: block?.trim() || "",
      ...(capacity ? { capacity: Number(capacity) } : {}),
      ...(resolvedCollegeId ? { collegeId: resolvedCollegeId } : {}),
      createdBy: user._id,
    });

    return NextResponse.json({ message: "Room created", data: created });
  } catch (err) {
    return NextResponse.json({ message: err.message || "Failed to create room" }, { status: 500 });
  }
}
