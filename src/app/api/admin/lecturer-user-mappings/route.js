
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import Lecturer from "@/models/Lecturer";
import User from "@/models/User";
import LecturerUserMapping from "@/models/LecturerUserMapping";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const { lecturerId, userId } = await req.json();

    if (!lecturerId || !userId) {
      return NextResponse.json(
        { message: "lecturerId and userId are required" },
        { status: 400 }
      );
    }

    const lecturer = await Lecturer.findById(lecturerId).lean();
    if (!lecturer) {
      return NextResponse.json(
        { message: "OSRA lecturer not found" },
        { status: 404 }
      );
    }

    const invigilationUser = await User.findOne({
      _id: userId,
      role: "lecturer",
    }).lean();

    if (!invigilationUser) {
      return NextResponse.json(
        { message: "Invigilation lecturer not found" },
        { status: 404 }
      );
    }

    const existingLecturerMapping =
      await LecturerUserMapping.findOne({ lecturerId }).lean();

    if (existingLecturerMapping) {
      return NextResponse.json(
        { message: "This OSRA lecturer is already mapped" },
        { status: 409 }
      );
    }

    const existingUserMapping =
      await LecturerUserMapping.findOne({ userId }).lean();

    if (existingUserMapping) {
      return NextResponse.json(
        { message: "This Invigilation lecturer is already mapped" },
        { status: 409 }
      );
    }

    const mapping = await LecturerUserMapping.create({
        
      lecturerId,
      userId,
      mappedBy: session.user.id,
      
    });

console.log("CREATED MAPPING:", mapping.toObject());

    return NextResponse.json(
      {
        message: "Lecturer mapping created successfully",
        data: {
          id: mapping._id,
          lecturerId: mapping.lecturerId,
          userId: mapping.userId,
          mappedBy: mapping.mappedBy,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lecturer mapping POST error:", error);

    return NextResponse.json(
      { message: error.message || "Failed to create lecturer mapping" },
      { status: 500 }
    );
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectMongoDB();

    const [lecturers, invigilationUsers, mappings] = await Promise.all([
      Lecturer.find({})
        .select("_id name email collegeId collegeName subject")
        .sort({ name: 1 })
        .lean(),

      User.find({ role: "lecturer" })
        .select("_id name email role")
        .sort({ name: 1 })
        .lean(),

      LecturerUserMapping.find({})
        .select("lecturerId userId mappedBy createdAt")
        .lean(),
    ]);

    return NextResponse.json({
      data: {
        lecturers,
        invigilationUsers,
        mappings,
      },
    });
  } catch (error) {
    console.error("Lecturer mapping GET error:", error);

    return NextResponse.json(
      { message: "Failed to fetch lecturer mappings" },
      { status: 500 }
    );
  }
}
