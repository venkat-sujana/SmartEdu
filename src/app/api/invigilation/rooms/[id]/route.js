//src/app/api/invigilation/rooms/[id]/route.js
import { NextResponse } from "next/server";
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";
import InvigilationRoom from "@/models/InvigilationRoom";
import ExamSchedule from "@/models/ExamSchedule";
import DutyAssignment from "@/models/DutyAssignment";
import { requireInvigilationAuth } from "@/lib/invigilation-api-guard";

function canAccessByCollege(doc, user) {
  if (!doc) return false;
  if (!user.collegeId) return true;
  if (!doc.collegeId) return true;
  return String(doc.collegeId) === String(user.collegeId);
}

function buildScheduleScopeFilter(user) {
  if (!user.collegeId) return {};
  return {
    $or: [
      { collegeId: user.collegeId },
      { collegeId: { $exists: false } },
      { collegeId: null },
    ],
  };
}

export async function PUT(
  req,
  context
) {
  const { id } =
    await context.params;

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ["admin"]
    );

  if (error) return error;

  try {
    await connectInvigilationDB();

    const body =
      await req.json();

    const existingRoom =
      await InvigilationRoom.findById(id);

    if (
      !existingRoom ||
      !canAccessByCollege(
        existingRoom,
        user
      )
    ) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        { status: 404 }
      );
    }

    const previousName =
      existingRoom.name;

    const update = {
      name: body.name
        ?.trim()
        ?.toUpperCase(),

      block:
        body.block?.trim() || "",

      capacity: body.capacity
        ? Number(body.capacity)
        : undefined,
    };

    if (!update.name) {
      return NextResponse.json(
        {
          message:
            "Room name is required",
        },
        { status: 400 }
      );
    }

    existingRoom.name =
      update.name;

    existingRoom.block =
      update.block;

    existingRoom.capacity =
      update.capacity;

    await existingRoom.save();

    await ExamSchedule.updateMany(
      {
        $and: [
          {
            $or: [
              {
                roomId:
                  existingRoom._id,
              },
              {
                hallNo:
                  previousName,
              },
              {
                hallNo:
                  update.name,
              },
            ],
          },

          buildScheduleScopeFilter(
            user
          ),
        ],
      },

      {
        $set: {
          hallNo: update.name,
          roomId:
            existingRoom._id,
        },
      }
    );

    return NextResponse.json({
      message: "Room updated",
      data: existingRoom,
    });

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          "Failed to update room",
      },
      { status: 500 }
    );
  }
}





export async function DELETE(
  req,
  context
) {

  const { id } =
    await context.params;

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ["admin"]
    );

  if (error) return error;

  try {

    await connectInvigilationDB();

    const room =
      await InvigilationRoom.findById(id)
        .lean();

    if (
      !room ||
      !canAccessByCollege(
        room,
        user
      )
    ) {
      return NextResponse.json(
        {
          message: "Room not found",
        },
        { status: 404 }
      );
    }

    const linkedSchedules =
      await ExamSchedule.find({
        $and: [
          {
            $or: [
              { roomId: id },
              { hallNo: room.name },
            ],
          },

          buildScheduleScopeFilter(
            user
          ),
        ],
      })
        .select("_id")
        .lean();

    const scheduleIds =
      linkedSchedules.map(
        (item) => item._id
      );

    // delete linked duties
    if (scheduleIds.length > 0) {

      await DutyAssignment.deleteMany({
        examScheduleId: {
          $in: scheduleIds,
        },
      });

      // delete linked schedules
      await ExamSchedule.deleteMany({
        _id: {
          $in: scheduleIds,
        },
      });
    }

    // delete room
    await InvigilationRoom.deleteOne({
      _id: id,
    });

    return NextResponse.json({
      success: true,
      message: "Room deleted",
      deletedSchedules:
        scheduleIds.length,
    });

  } catch (err) {

    return NextResponse.json(
      {
        success: false,
        message:
          err.message ||
          "Failed to delete room",
      },
      { status: 500 }
    );
  }
}