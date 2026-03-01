import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

const adminName = process.env.INVIGILATION_ADMIN_NAME || "Invigilation Admin";
const adminEmail = process.env.INVIGILATION_ADMIN_EMAIL;
const adminPassword = process.env.INVIGILATION_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  console.error(
    "Set INVIGILATION_ADMIN_EMAIL and INVIGILATION_ADMIN_PASSWORD in .env.local before seeding."
  );
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  await mongoose.connect(uri);
  const email = adminEmail.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  const created = await User.create({
    name: adminName,
    email,
    password: hashed,
    role: "admin",
  });

  console.log("Invigilation admin created:", {
    id: String(created._id),
    name: created.name,
    email: created.email,
  });

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message || err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

