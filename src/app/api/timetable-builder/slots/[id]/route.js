// app/api/timetable-builder/slots/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import TimetableSlot from "@/models/TimetableSlot";

// ── PUT — ఒక slot update చేయడం ──────────────────────────────────────
export async function PUT(req, context) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ Next.js 15+ await
  if (!id)
    return NextResponse.json({ message: "ID అవసరం" }, { status: 400 });

  const body = await req.json();
  const { subject, lecturerName, lecturerId, subjectColor, isLocked, isPractical } = body;

  try {
    const updated = await TimetableSlot.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(subject      !== undefined && { subject }),
          ...(lecturerName !== undefined && { lecturerName }),
          ...(lecturerId   !== undefined && { lecturerId }),
          ...(subjectColor !== undefined && { subjectColor }),
          ...(isLocked     !== undefined && { isLocked }),
          ...(isPractical  !== undefined && { isPractical }),
        },
      },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ message: "Slot not found" }, { status: 404 });

    return NextResponse.json({ message: "Updated ✅", data: updated });

  } catch (err) {
    console.error("PUT slot error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ── DELETE — ఒక slot clear చేయడం (subject తీసేయడం) ─────────────────
export async function DELETE(req, context) {
  await connectMongoDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.collegeId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // ✅ Next.js 15+ await
  if (!id)
    return NextResponse.json({ message: "ID అవసరం" }, { status: 400 });

  try {
    // Delete కాదు — subject clear చేయడం (slot structure ఉంచాలి)
    const cleared = await TimetableSlot.findByIdAndUpdate(
      id,
      {
        $set: {
          subject:      "",
          lecturerName: "",
          lecturerId:   null,
          subjectColor: "#e2e8f0",
          isPractical:  false,
        },
      },
      { new: true }
    );

    if (!cleared)
      return NextResponse.json({ message: "Slot not found" }, { status: 404 });

    return NextResponse.json({ message: "Slot cleared ✅", data: cleared });

  } catch (err) {
    console.error("DELETE slot error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
