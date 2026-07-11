import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongoDB from "@/lib/mongodb";
import SystemSettings from "@/models/SystemSettings";

// GET
export async function GET(req) {
  await connectMongoDB();

  try {
    const { searchParams } = new URL(req.url);
    let collegeId = searchParams.get("collegeId");

    if (!collegeId) {
      const session = await getServerSession(authOptions);
      collegeId = session?.user?.collegeId || null;
    }

    const settings = collegeId
      ? await SystemSettings.findOne({ collegeId })
      : null;

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load settings",
      },
      {
        status: 500,
      }
    );
  }
}

// POST - Save / Update Settings

export async function POST(req) {
  await connectMongoDB();

  try {
    const body = await req.json();
    console.log("Received settings data:", body);

    const { collegeId, modules } = body;
    let resolvedCollegeId = collegeId;

    if (!resolvedCollegeId) {
      const session = await getServerSession(authOptions);
      resolvedCollegeId = session?.user?.collegeId || null;
    }

    if (!resolvedCollegeId) {
      return NextResponse.json(
        {
          success: false,
          message: "collegeId is required",
        },
        {
          status: 400,
        }
      );
    }

    const updateDoc = {
      collegeId: resolvedCollegeId,
      "modules.fee.enabled": modules?.fee?.enabled ?? true,
      "modules.fee.mode": modules?.fee?.mode || "automatic",
      "modules.fee.startDate": modules?.fee?.startDate || "",
      "modules.fee.endDate": modules?.fee?.endDate || "",
      "modules.admissions.enabled": modules?.admissions?.enabled ?? true,
      "modules.admissions.mode": modules?.admissions?.mode || "automatic",
      "modules.admissions.startDate": modules?.admissions?.startDate || "",
      "modules.admissions.endDate": modules?.admissions?.endDate || "",
      "modules.attendance.enabled": modules?.attendance?.enabled ?? true,
      "modules.exams.enabled": modules?.exams?.enabled ?? true,
      "modules.timetable.enabled": modules?.timetable?.enabled ?? true,
    };

    const settings = await SystemSettings.findOneAndUpdate(
      {
        collegeId: resolvedCollegeId,
      },
      { $set: updateDoc },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    console.log("Saved Settings:", settings);

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
      data: settings,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save settings",
      },
      {
        status: 500,
      }
    );

  }
}
