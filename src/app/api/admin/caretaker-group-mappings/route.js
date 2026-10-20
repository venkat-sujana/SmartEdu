//src/app/api/admin/caretaker=group-mapping/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoDB from "@/lib/mongodb";
import College from "@/models/College";
import Lecturer from "@/models/Lecturer";
import CaretakerGroupMapping from "@/models/CaretakerGroupMapping";
import { getAdminSession } from "@/lib/requireAdminSession";
import { normalizeAttendanceGroup } from "@/utils/attendanceGroup";
import { ensureCollegeGroups } from "@/utils/collegeGroups";

function isValidId(value) {
  return (
    typeof value === "string" &&
    mongoose.Types.ObjectId.isValid(value) &&
    String(new mongoose.Types.ObjectId(value)) === value
  );
}

function normalizeGroupList(groups) {
  if (!Array.isArray(groups)) return [];

  return [
    ...new Set(
      groups
        .map((group) => normalizeAttendanceGroup(group))
        .filter(Boolean)
    ),
  ];
}

function errorResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");

    if (!isValidId(collegeId)) {
      return errorResponse("A valid collegeId is required.");
    }

    await connectMongoDB();


    const college = await College.findById(collegeId)
      .select("_id name groups")
      .lean();



    if (!college) {
      return errorResponse("College not found.", 404);
    }

    const [lecturers, mappings] = await Promise.all([
      Lecturer.find({ collegeId: college._id })
        .select("_id name email subject collegeId")
        .sort({ name: 1 })
        .lean(),

      CaretakerGroupMapping.find({ collegeId: college._id })
        .select("lecturerId groups updatedAt")
        .lean(),
    ]);

    const mappingByLecturer = new Map(
      mappings.map((mapping) => [
        String(mapping.lecturerId),
        mapping,
      ])
    );

    const lecturerData = lecturers.map((lecturer) => {
      const mapping = mappingByLecturer.get(String(lecturer._id));

      return {
        _id: String(lecturer._id),
        name: lecturer.name,
        email: lecturer.email,
        subject: lecturer.subject,
        groups: mapping ? mapping.groups : [],
        isMapped: Boolean(mapping && mapping.groups.length > 0),
        updatedAt: mapping?.updatedAt || null,
      };
    });

    return NextResponse.json({
      success: true,
      college: {
        _id: String(college._id),
        name: college.name,
        groups: normalizeGroupList(
  ensureCollegeGroups(college.groups)
),
      },
      lecturers: lecturerData,
    });
  } catch (error) {
    console.error("Caretaker mapping GET error:", error);
    return NextResponse.json(
      { error: "Failed to load caretaker group mappings." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return errorResponse("Forbidden", 403);
    }

    const body = await req.json();
    const { collegeId, lecturerId } = body;
    const requestedGroups = body.groups;

    if (!isValidId(collegeId) || !isValidId(lecturerId)) {
      return errorResponse("Valid collegeId and lecturerId are required.");
    }

    if (!Array.isArray(requestedGroups)) {
      return errorResponse("Groups must be provided as an array.");
    }

    const groups = normalizeGroupList(requestedGroups);

    if (groups.length === 0) {
      return errorResponse(
        "Assign at least one group to this lecturer."
      );
    }

    await connectMongoDB();

    const [college, lecturer] = await Promise.all([
      College.findById(collegeId).select("_id name groups").lean(),
      Lecturer.findOne({
        _id: lecturerId,
        collegeId,
      })
        .select("_id name collegeId")
        .lean(),
    ]);

    if (!college) {
      return errorResponse("College not found.", 404);
    }

    if (!lecturer) {
      return errorResponse(
        "The lecturer does not belong to the selected college.",
        403
      );
    }

    const allowedGroups = normalizeGroupList(
  ensureCollegeGroups(college.groups)
);


    const allowedByNormalizedName = new Map(
      allowedGroups.map((group) => [
        normalizeAttendanceGroup(group).toUpperCase(),
        group,
      ])
    );

    const invalidGroups = groups.filter(
      (group) =>
        !allowedByNormalizedName.has(
          normalizeAttendanceGroup(group).toUpperCase()
        )
    );

    if (invalidGroups.length > 0) {
      return errorResponse(
        `Invalid groups for this college: ${invalidGroups.join(", ")}`
      );
    }

    // Store the college's canonical group names.
    const canonicalGroups = [
      ...new Set(
        groups.map((group) =>
          allowedByNormalizedName.get(
            normalizeAttendanceGroup(group).toUpperCase()
          )
        )
      ),
    ];

    const updatedBy = isValidId(String(session.user.id || ""))
      ? new mongoose.Types.ObjectId(String(session.user.id))
      : null;

    const mapping = await CaretakerGroupMapping.findOneAndUpdate(
      { collegeId, lecturerId },
      {
        $set: {
          groups: canonicalGroups,
          updatedBy,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      message: "Caretaker group mapping saved successfully.",
      data: {
        collegeId: String(mapping.collegeId),
        lecturerId: String(mapping.lecturerId),
        groups: mapping.groups,
        updatedAt: mapping.updatedAt,
      },
    });
  } catch (error) {
    console.error("Caretaker mapping PUT error:", error);
    return NextResponse.json(
      { error: "Failed to save caretaker group mapping." },
      { status: 500 }
    );
  }
}
