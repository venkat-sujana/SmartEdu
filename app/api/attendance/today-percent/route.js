
//app/api/attendance/today-percent/route.js
import connectMongoDB  from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get("collegeId");

    if (!collegeId) {
      console.log("❌ Missing collegeId in request");
      return new Response(JSON.stringify({ error: "Missing collegeId" }), {
        status: 400,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log("📅 Date range:", today, "to", tomorrow);
    console.log("🏫 College ID:", collegeId);

    // Fetch today's attendance
    const todayRecords = await Attendance.find({
      collegeId,
      date: { $gte: today, $lt: tomorrow },
    });

    console.log("🟢 Today's Attendance Records:", todayRecords.length);

    // Count 'Present'
    const presentCount = todayRecords.filter(
      (rec) => rec.status === "Present"
    ).length;

    console.log("✅ Present Count:", presentCount);

    const totalStudents = await Student.countDocuments({ collegeId });

    console.log("👥 Total Students:", totalStudents);

    const percent =
      totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

    return new Response(JSON.stringify({ percent }), { status: 200 });
  } catch (err) {
    console.error("🔥 Error in attendance percent API:", err);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
    });
  }
}
