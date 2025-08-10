// app/api/students/count/route.js
import connectMongoDB from "@/lib/mongodb";
import Student from '@/models/Student';

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return new Response(JSON.stringify({ error: 'Missing collegeId' }), {
        status: 400,
      });
    }

    const count = await Student.countDocuments({ collegeId });
    return Response.json({ count });
  } catch (err) {
    console.error('Error in student count API:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}




