import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

const shouldApply = process.argv.includes("--apply");

const studentSchema = new mongoose.Schema(
  {
    group: String,
  },
  { timestamps: true, collection: "students" }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);

async function main() {
  await mongoose.connect(uri);

  const fromValue = "BiPC";
  const toValue = "BIPC";

  const currentCount = await Student.countDocuments({ group: fromValue });
  console.log(`Found ${currentCount} student record(s) with group='${fromValue}'.`);

  if (!shouldApply) {
    console.log("Dry run only. No updates performed.");
    console.log("Run with --apply to update records.");
    await mongoose.disconnect();
    return;
  }

  if (currentCount === 0) {
    console.log("Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  const result = await Student.updateMany(
    { group: fromValue },
    { $set: { group: toValue } }
  );

  console.log("Migration complete:", {
    matched: result.matchedCount,
    modified: result.modifiedCount,
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Migration failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
