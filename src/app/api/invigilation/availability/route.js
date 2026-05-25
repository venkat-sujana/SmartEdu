import { NextResponse }
from "next/server";

import {
  connectInvigilationDB,
} from "@/lib/mongodb-invigilation";

import LecturerAvailability
from "@/models/LecturerAvailability";

import {
  requireInvigilationAuth,
} from "@/lib/invigilation-api-guard";


// GET availability
export async function GET(req) {

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ["lecturer", "admin"]
    );

  if (error) return error;

  try {

    await connectInvigilationDB();

    const { searchParams } =
      new URL(req.url);

    const date =
      searchParams.get("date");

    const session =
      searchParams.get("session");

    const lecturerId =
      user.role === "lecturer"
        ? user._id
        : searchParams.get(
            "lecturerId"
          );

    const filter = {
      lecturerId,
    };

    if (user.collegeId) {
      filter.collegeId =
        user.collegeId;
    }

    if (date) {

      const start =
        new Date(date);

      const end =
        new Date(date);

      end.setDate(
        end.getDate() + 1
      );

      filter.date = {
        $gte: start,
        $lt: end,
      };
    }

    if (session) {
      filter.session =
        session;
    }

    const data =
      await LecturerAvailability
        .find(filter)
        .sort({
          date: 1,
        })
        .lean();

    return NextResponse.json({
      data,
    });

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          "Failed to load availability",
      },

      {
        status: 500,
      }
    );
  }
}



// CREATE / UPDATE availability
export async function POST(req) {

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ["lecturer"]
    );

  if (error) return error;

  try {

    await connectInvigilationDB();

    const body =
      await req.json();

    const {
      date,
      session,
      status,
      reason,
    } = body;

    if (
      !date ||
      !session
    ) {
      return NextResponse.json(
        {
          message:
            "Date and session are required",
        },

        {
          status: 400,
        }
      );
    }

    const updated =
      await LecturerAvailability
        .findOneAndUpdate(

          {
            lecturerId:
              user._id,

            date:
              new Date(date),

            session,
          },

          {
            lecturerId:
              user._id,

            date:
              new Date(date),

            session,

            status:
              status ||
              "NOT_AVAILABLE",

            reason:
              reason?.trim() ||
              "",

            collegeId:
              user.collegeId,

            createdBy:
              user._id,
          },

          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          }
        );

    return NextResponse.json({
      message:
        "Availability updated",

      data: updated,
    });

  } catch (err) {

    return NextResponse.json(
      {
        message:
          err.message ||
          "Failed to update availability",
      },

      {
        status: 500,
      }
    );
  }
}