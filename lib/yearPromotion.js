import Student from "@/models/Student";

export async function runYearPromotion() {
  const firstYearIds = await Student.find(
    { yearOfStudy: "First Year", status: "Active" },
    { _id: 1 }
  ).lean();
  const secondYearIds = await Student.find(
    { yearOfStudy: "Second Year", status: "Active" },
    { _id: 1 }
  ).lean();

  const promoteFirstYear = await Student.updateMany(
    { _id: { $in: firstYearIds.map((s) => s._id) } },
    { $set: { yearOfStudy: "Second Year" } }
  );

  const terminateSecondYear = await Student.updateMany(
    { _id: { $in: secondYearIds.map((s) => s._id) } },
    { $set: { status: "Terminated" } }
  );

  return {
    promoted: promoteFirstYear.modifiedCount,
    terminated: terminateSecondYear.modifiedCount,
    ranAt: new Date().toISOString(),
  };
}
