//app/api/students/promote/route.js
import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import { runYearPromotion } from "@/lib/yearPromotion";
import PromotionRun from "@/models/PromotionRun";

export async function POST() {
  try {
    await connectMongoDB();
    const result = await runYearPromotion();
    const year = new Date().getFullYear();
    await PromotionRun.findOneAndUpdate(
      { year },
      { $set: { ...result, mode: "MANUAL", ranAt: new Date(result.ranAt) } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Promotion & termination completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("Promotion Error:", error);
    return NextResponse.json(
      { error: "Server error while promoting students" },
      { status: 500 }
    );
  }
}
