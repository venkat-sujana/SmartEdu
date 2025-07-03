// app/api/attendance/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import connectMongoDB from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route"; // adjust path if needed

// 🔽 POST Attendance
export async function POST(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);
    console.log("SESSION:", session);

    if (!session || !session.user?.collegeId) {
      console.log("Missing collegeId in session");
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;

    const records = await req.json();

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ message: "Invalid data", status: "error" }, { status: 400 });
    }

    const processedRecords = records.map((record) => {
     

      const dateObj = new Date(record.date);
      const month = dateObj.toLocaleString("default", { month: "long" });
      const year = dateObj.getFullYear();

      return {
        ...record,
        collegeId, // ✅ attach lecturer's collegeId
        month,
        year,
      };
    });

     console.log("Processed Records:", processedRecords);

    await Attendance.insertMany(processedRecords);

    return NextResponse.json({ message: "Attendance submitted", status: "success" });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ message: "Error submitting attendance", status: "error" }, { status: 500 });
  }
}

// 🔽 GET Attendance Records
export async function GET(req) {
  await connectMongoDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.collegeId) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const collegeId = session.user.collegeId;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter = { collegeId }; // ✅ restrict to current lecturer's college

    if (date) filter.date = new Date(date);
    if (group) filter.group = group;
    if (month) filter.month = month;
    if (year) filter.year = Number(year);

    const records = await Attendance.find(filter)
      .populate("studentId", "name group")
      .sort({ date: -1 });

    return NextResponse.json({ data: records, status: "success" });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json({ message: "Error fetching attendance", status: "error" }, { status: 500 });
  }
}
