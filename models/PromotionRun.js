import mongoose from "mongoose";

const promotionRunSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true, index: true },
    mode: { type: String, enum: ["AUTO", "MANUAL"], default: "AUTO" },
    promoted: { type: Number, default: 0 },
    terminated: { type: Number, default: 0 },
    ranAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.PromotionRun || mongoose.model("PromotionRun", promotionRunSchema);
