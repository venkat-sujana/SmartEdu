// This file handles the API routes for managing exams in a school management system.
// It includes functions for creating, updating, and deleting exams.

// Import necessary modules
//app/api/exams/route.js

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

    // 👉 Filter subjects based on stream type
    let filteredSubjects = {};
    if (['MPC', 'BIPC', 'CEC', 'HEC'].includes(stream)) {
      // General stream → 6 subjects
      filteredSubjects = Object.entries(subjects)
        .slice(0, 6)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    } else if (['M&AT', 'CET', 'MLT'].includes(stream)) {
      // Vocational stream → 5 subjects
      filteredSubjects = Object.entries(subjects)
        .slice(0, 5)
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    }

    // 👉 Compute total and percentage from filtered subjects
    const subjectMarks = Object.values(filteredSubjects).map(Number).filter(n => !isNaN(n));
    const total = subjectMarks.reduce((sum, mark) => sum + mark, 0);
    const percentage = subjectMarks.length > 0 ? (total / subjectMarks.length).toFixed(2) : 0;

    // 👉 Prepare exam data
    const examData = {
      studentId,
      stream,
      academicYear,
      examType,
      examDate: new Date(examDate),
      total,
      percentage,
    };

    // 👉 Attach subjects based on stream
    if (['MPC', 'BIPC', 'CEC', 'HEC'].includes(stream)) {
      examData.generalSubjects = filteredSubjects;
    } else if (['M&AT', 'CET', 'MLT'].includes(stream)) {
      examData.vocationalSubjects = filteredSubjects;
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
    const exams = await Exam.find().populate('studentId', 'name');

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
