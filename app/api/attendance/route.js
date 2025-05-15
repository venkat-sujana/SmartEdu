// app/api/attendance/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Attendance from "@/models/Attendance";
import connectMongoDB  from "@/lib/mongodb";
import Student from "@/models/Student";



// 🔽 POST Attendance
export async function POST(req) {
  await connectMongoDB();

  try {
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
        month,
        year,
      };
    });

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
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const group = searchParams.get("group");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const filter = {};

    if (date) {
      filter.date = new Date(date);
    }

    if (group) {
      filter.group = group;
    }

    if (month) {
      filter.month = month;
    }

    if (year) {
      filter.year = Number(year);
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name group")
      .sort({ date: -1 });

    return NextResponse.json({ data: records, status: "success" });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json({ message: "Error fetching attendance", status: "error" }, { status: 500 });
  }
}
