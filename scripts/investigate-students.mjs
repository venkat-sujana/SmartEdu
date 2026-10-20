import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing in .env.local");
  process.exit(1);
}

const studentSchema = new mongoose.Schema(
  {
    group: String,
    status: String,
    yearOfStudy: String,
    collegeId: mongoose.Schema.Types.ObjectId,
    name: String,
  },
  { timestamps: true, collection: "students" }
);

const lecturerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    collegeId: mongoose.Schema.Types.ObjectId,
    subject: String,
  },
  { timestamps: true, collection: "lecturers" }
);

const caretakerGroupMappingSchema = new mongoose.Schema(
  {
    collegeId: mongoose.Schema.Types.ObjectId,
    lecturerId: mongoose.Schema.Types.ObjectId,
    groups: [String],
  },
  { timestamps: true, collection: "caretakergroupmappings" }
);

const collegeSchema = new mongoose.Schema(
  {
    name: String,
    groups: [String],
  },
  { timestamps: true, collection: "colleges" }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
const Lecturer = mongoose.models.Lecturer || mongoose.model("Lecturer", lecturerSchema);
const CaretakerGroupMapping = mongoose.models.CaretakerGroupMapping || mongoose.model("CaretakerGroupMapping", caretakerGroupMappingSchema);
const College = mongoose.models.College || mongoose.model("College", collegeSchema);

function normalizeAttendanceGroup(value) {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!normalized) return "";

  if (normalized === "BIPC") return "BiPC";
  if (normalized === "MPC") return "MPC";
  if (normalized === "CEC") return "CEC";
  if (normalized === "HEC") return "HEC";
  if (normalized === "CET") return "CET";
  if (normalized === "MLT") return "MLT";
  if (normalized === "M&AT" || normalized === "M@AT" || normalized === "MANDAT") {
    return "M&AT";
  }

  return String(value || "").trim();
}

async function main() {
  await mongoose.connect(uri);

  console.log("=== COLLEGE GROUP CONFIGURATIONS ===");
  const colleges = await College.find({}).select("name groups").lean();
  for (const college of colleges) {
    console.log(`College: ${college.name} (${college._id})`);
    console.log(`  Configured groups: ${JSON.stringify(college.groups)}`);
  }

  console.log("\n=== LECTURER GROUP MAPPINGS ===");
  const mappings = await CaretakerGroupMapping.find({}).lean();
  for (const mapping of mappings) {
    const lecturer = await Lecturer.findById(mapping.lecturerId).select("name email collegeId subject").lean();
    const college = await College.findById(mapping.collegeId).select("name").lean();
    if (lecturer && college) {
      const normalizedGroups = mapping.groups.map(g => normalizeAttendanceGroup(g));
      console.log(`Lecturer: ${lecturer.name} (${lecturer.email})`);
      console.log(`  College: ${college.name} (${college._id})`);
      console.log(`  Subject: ${lecturer.subject}`);
      console.log(`  Mapped groups (raw): ${JSON.stringify(mapping.groups)}`);
      console.log(`  Mapped groups (normalized): ${JSON.stringify(normalizedGroups)}`);
    }
  }

  console.log("\n=== STUDENT GROUP VALUE DISTRIBUTION (all colleges) ===");
  const groupDistribution = await Student.aggregate([
    { $group: { _id: "$group", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  for (const g of groupDistribution) {
    console.log(`  ${g._id}: ${g.count}`);
  }

  console.log("\n=== STUDENT STATUS DISTRIBUTION (all colleges) ===");
  const statusDistribution = await Student.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  for (const s of statusDistribution) {
    console.log(`  ${s._id}: ${s.count}`);
  }

  console.log("\n=== STUDENT YEAR OF STUDY DISTRIBUTION (all colleges) ===");
  const yearDistribution = await Student.aggregate([
    { $group: { _id: "$yearOfStudy", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  for (const y of yearDistribution) {
    console.log(`  ${y._id}: ${y.count}`);
  }

  console.log("\n=== DETAILED STUDENT COUNTS BY COLLEGE, GROUP, STATUS, YEAR ===");
  const detailedCounts = await Student.aggregate([
    {
      $group: {
        _id: { collegeId: "$collegeId", group: "$group", status: "$status", yearOfStudy: "$yearOfStudy" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.collegeId": 1, "_id.group": 1, "_id.status": 1, "_id.yearOfStudy": 1 } }
  ]);

  for (const d of detailedCounts) {
    const college = await College.findById(d._id.collegeId).select("name").lean();
    const collegeName = college ? college.name : "Unknown";
    console.log(`  College: ${collegeName} (${d._id.collegeId}) | Group: ${d._id.group} | Status: ${d._id.status || "null"} | Year: ${d._id.yearOfStudy} => ${d.count}`);
  }

  console.log("\n=== SIMULATING LECTURER API QUERY FOR EACH MAPPED LECTURER ===");
  for (const mapping of mappings) {
    const lecturer = await Lecturer.findById(mapping.lecturerId).select("name email collegeId subject").lean();
    const college = await College.findById(mapping.collegeId).select("name").lean();
    if (!lecturer || !college) continue;

    const normalizedGroups = mapping.groups.map(g => normalizeAttendanceGroup(g)).filter(Boolean);
    const uniqueNormalizedGroups = [...new Set(normalizedGroups)];

    // Build group aliases like the service does
    const groupAliases = uniqueNormalizedGroups.flatMap((group) => {
      const normalized = normalizeAttendanceGroup(group);
      return normalized === "BiPC" ? ["BiPC", "BIPC"] : [normalized];
    });
    const uniqueAliases = [...new Set(groupAliases)];

    console.log(`\n--- Lecturer: ${lecturer.name} (${lecturer.email}) ---`);
    console.log(`  College: ${college.name}`);
    console.log(`  Mapped groups (normalized): ${JSON.stringify(uniqueNormalizedGroups)}`);
    console.log(`  Query aliases: ${JSON.stringify(uniqueAliases)}`);

    // Count with Active status only (what the API does)
    const activeCount = await Student.countDocuments({
      collegeId: mapping.collegeId,
      status: "Active",
      group: { $in: uniqueAliases }
    });
    console.log(`  Active students in mapped groups: ${activeCount}`);

    // Count with all statuses
    const allStatusCount = await Student.countDocuments({
      collegeId: mapping.collegeId,
      group: { $in: uniqueAliases }
    });
    console.log(`  All students in mapped groups (any status): ${allStatusCount}`);

    // Count by status
    for (const status of ["Active", "Terminated", null]) {
      const query = { collegeId: mapping.collegeId, group: { $in: uniqueAliases } };
      if (status) query.status = status;
      const cnt = await Student.countDocuments(query);
      console.log(`  ${status || "(no status)"}: ${cnt}`);
    }

    // Count by year
    for (const year of ["First Year", "Second Year"]) {
      const cnt = await Student.countDocuments({
        collegeId: mapping.collegeId,
        status: "Active",
        group: { $in: uniqueAliases },
        yearOfStudy: year
      });
      console.log(`  ${year} (Active): ${cnt}`);
    }

    // Show actual group values in DB for this college
    const dbGroups = await Student.aggregate([
      { $match: { collegeId: mapping.collegeId } },
      { $group: { _id: "$group", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log(`  DB group values in this college:`);
    for (const g of dbGroups) {
      const normalized = normalizeAttendanceGroup(g._id);
      const matches = uniqueAliases.some(a => a.toLowerCase() === normalized.toLowerCase());
      console.log(`    ${g._id} (normalized: ${normalized}) => ${g.count} ${matches ? "✓ MATCHES" : "✗ NO MATCH"}`);
    }
  }

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Investigation failed:", err.message || err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});