import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import PromotionRun from "@/models/PromotionRun";
import { runYearPromotion } from "@/lib/yearPromotion";

function getPromotionDateForYear(year) {
  const month = Number(process.env.PROMOTION_MONTH || 6); // June
  const day = Number(process.env.PROMOTION_DAY || 1);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export async function POST() {
  try {
    await connectMongoDB();

    const now = new Date();
    const year = now.getFullYear();
    const promotionDate = getPromotionDateForYear(year);

    const existingRun = await PromotionRun.findOne({ year }).lean();
    if (existingRun) {
      return NextResponse.json({
        skipped: true,
        reason: "Already promoted for this year",
        ...existingRun,
      });
    }

    if (now < promotionDate) {
      return NextResponse.json({
        skipped: true,
        reason: "Promotion date not reached",
        year,
        promotionDate: promotionDate.toISOString(),
      });
    }

    const result = await runYearPromotion();
    const created = await PromotionRun.create({
      year,
      mode: "AUTO",
      promoted: result.promoted,
      terminated: result.terminated,
      ranAt: new Date(result.ranAt),
    });

    return NextResponse.json({
      skipped: false,
      message: "Automatic promotion completed successfully",
      year,
      ...result,
      mode: created.mode,
    });
  } catch (error) {
    console.error("Auto Promotion Error:", error);
    return NextResponse.json({ error: "Auto promotion failed" }, { status: 500 });
  }
}
