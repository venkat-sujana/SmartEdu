// /app/api/exams/route.js (POST handler)
import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Exam from '@/models/Exam';

export async function POST(req) {
  try {
    await connectMongoDB();
    const body = await req.json();

    const {
      studentId,
      stream,
      academicYear,
      examType,
      examDate,
      subjects,
    } = body;

    // 👉 Compute total and percentage from subjects
    const subjectMarks = Object.values(subjects).map(Number).filter(n => !isNaN(n));
const total = subjectMarks.reduce((sum, mark) => sum + mark, 0);
const percentage = subjectMarks.length > 0 ? (total / subjectMarks.length).toFixed(2) : 0;


    // 👉 Prepare exam data with total & percentage
    const examData = {
      studentId,
      stream,
      academicYear,
      examType,
      examDate: new Date(examDate),
      total,
      percentage,
    };

    // Add subject-wise data
    if (['MPC', 'BIPC', 'CEC', 'HEC'].includes(stream)) {
      examData.generalSubjects = subjects;
    } else if (['M&AT', 'CET', 'MLT'].includes(stream)) {
      examData.vocationalSubjects = subjects;
    }

    // 👉 Save to MongoDB
    const exam = new Exam(examData);
    await exam.save();

    return NextResponse.json({ success: true, data: exam });
  } catch (error) {
    console.error('Error saving exam:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectMongoDB();
    const exams = await Exam.find().populate('studentId', 'name'); // 👈 Populate only the name

    // Transform data to include `student` field with name
    const examsWithNames = exams.map((exam) => ({
      ...exam._doc,
      student: {
        name: exam.studentId?.name || 'Unknown',
      },
    }));

    return NextResponse.json({ success: true, data: examsWithNames });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}



