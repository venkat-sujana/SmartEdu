import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectMongoDB from "@/lib/mongodb";
import AttendanceSmsLog from "@/models/AttendanceSmsLog";
import College from "@/models/College";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAttendanceShortageSummary } from "@/lib/attendanceShortage";
import { getSmsProviderMeta, sendSms } from "@/lib/sms";

function buildShortageMessage({ collegeName, studentName, parentName, percentage, totalPresent, totalWorking }) {
  const greetingTarget = parentName ? `${parentName}` : "Parent";
  return [
    `Dear ${greetingTarget}, ${studentName}'s attendance at ${collegeName} is ${percentage}% (${totalPresent}/${totalWorking}). It is below 75%. Please contact the college office.`,
    `ప్రియమైన ${greetingTarget}, ${collegeName} లో ${studentName} attendance ${percentage}% (${totalPresent}/${totalWorking}) మాత్రమే ఉంది. ఇది 75% కన్నా తక్కువ. దయచేసి కాలేజ్‌ను సంప్రదించండి.`,
  ].join(" ");
}

function isAllowedRole(role) {
  return role === "principal" || role === "admin";
}

function isValidIndianMobile(value) {
  return /^[6-9]\d{9}$/.test(String(value || "").trim());
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || !isAllowedRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId") || session.user.collegeId;
    const group = searchParams.get("group");
    const yearOfStudy = searchParams.get("yearOfStudy");
    const threshold = Number(searchParams.get("threshold") || 75);

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId required" }, { status: 400 });
    }

    const shortageStudents = await getAttendanceShortageSummary({
      collegeId,
      group,
      yearOfStudy,
      threshold,
    });

    const preview = shortageStudents.slice(0, 5).map((student) => ({
      studentId: student.studentId,
      name: student.name,
      parentName: student.fatherName || "",
      mobile: student.parentMobile || "",
      percentage: student.percentage,
    }));

    return NextResponse.json({
      data: {
        threshold,
        totalEligible: shortageStudents.length,
        validMobileCount: shortageStudents.filter((student) => isValidIndianMobile(student.parentMobile)).length,
        preview,
        contactSource: "student.parentMobile",
        note: "SMS will be sent to the stored parent mobile number.",
        sms: getSmsProviderMeta(),
      },
    });
  } catch (error) {
    console.error("Attendance SMS preview error:", error);
    return NextResponse.json({ error: "Failed to prepare SMS preview" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();

    const session = await getServerSession(authOptions);
    if (!session?.user || !isAllowedRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const threshold = Number(body.threshold || 75);
    const group = body.group || "";
    const yearOfStudy = body.yearOfStudy || "";
    const collegeId = body.collegeId || session.user.collegeId;

    if (!collegeId) {
      return NextResponse.json({ error: "collegeId required" }, { status: 400 });
    }

    const smsMeta = getSmsProviderMeta();
    if (!smsMeta.configured) {
      return NextResponse.json(
        {
          error: "SMS provider is not configured. Set FAST2SMS_API_KEY and SMS_PROVIDER before sending.",
          sms: smsMeta,
        },
        { status: 400 }
      );
    }

    const college = await College.findById(collegeId).select("name").lean();
    const collegeName = college?.name || session.user.collegeName || "Your College";

    const shortageStudents = await getAttendanceShortageSummary({
      collegeId,
      group,
      yearOfStudy,
      threshold,
    });

    const eligibleStudents = shortageStudents.filter((student) => isValidIndianMobile(student.parentMobile));
    const skippedStudents = shortageStudents.filter((student) => !isValidIndianMobile(student.parentMobile));

    const sent = [];
    const failed = [];
    const logs = [];

    for (const student of eligibleStudents) {
      const message = buildShortageMessage({
        collegeName,
        studentName: student.name,
        parentName: student.fatherName,
        percentage: student.percentage,
        totalPresent: student.totalPresent,
        totalWorking: student.totalWorking,
      });

      try {
        const providerResponse = await sendSms({
          to: student.parentMobile,
          message,
        });

        sent.push({
          studentId: student.studentId,
          name: student.name,
          mobile: student.parentMobile,
          providerResponse,
        });
        logs.push({
          collegeId,
          studentId: student.studentId,
          group: student.group,
          yearOfStudy: student.yearOfStudy,
          recipientName: student.fatherName || student.name,
          mobile: student.parentMobile,
          percentage: student.percentage,
          threshold,
          message,
          provider: smsMeta.provider,
          status: "sent",
          triggeredByRole: session.user.role,
          triggeredByName: session.user.name || "",
        });
      } catch (error) {
        failed.push({
          studentId: student.studentId,
          name: student.name,
          mobile: student.mobile,
          error: error.message || "SMS send failed",
        });
        logs.push({
          collegeId,
          studentId: student.studentId,
          group: student.group,
          yearOfStudy: student.yearOfStudy,
          recipientName: student.fatherName || student.name,
          mobile: student.mobile,
          percentage: student.percentage,
          threshold,
          message,
          provider: smsMeta.provider,
          status: "failed",
          error: error.message || "SMS send failed",
          triggeredByRole: session.user.role,
          triggeredByName: session.user.name || "",
        });
      }
    }

    skippedStudents.forEach((student) => {
      logs.push({
        collegeId,
        studentId: student.studentId,
        group: student.group,
        yearOfStudy: student.yearOfStudy,
        recipientName: student.fatherName || student.name,
        mobile: student.parentMobile,
        percentage: student.percentage,
        threshold,
        message: "",
        provider: smsMeta.provider,
        status: "skipped",
        error: "Invalid or missing mobile number",
        triggeredByRole: session.user.role,
        triggeredByName: session.user.name || "",
      });
    });

    if (logs.length) {
      await AttendanceSmsLog.insertMany(logs, { ordered: false });
    }

    return NextResponse.json({
      message: `SMS sending completed. Sent ${sent.length}, failed ${failed.length}, skipped ${skippedStudents.length}.`,
      data: {
        threshold,
        contactSource: "student.parentMobile",
        totalEligible: shortageStudents.length,
        sentCount: sent.length,
        failedCount: failed.length,
        skippedCount: skippedStudents.length,
        sent,
        failed,
        skipped: skippedStudents.map((student) => ({
          studentId: student.studentId,
          name: student.name,
          mobile: student.parentMobile,
          reason: "Invalid or missing mobile number",
        })),
      },
    });
  } catch (error) {
    console.error("Attendance SMS send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send attendance SMS" }, { status: 500 });
  }
}
