import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import { ObjectId } from 'mongodb';

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const group = searchParams.get('group');
    const yearOfStudy = searchParams.get('yearOfStudy');
    const collegeId = searchParams.get('collegeId');

    if (!collegeId) {
      return NextResponse.json({ error: 'collegeId required' }, { status: 400 });
    }

    // Student query
    const studentQuery = {};
    if (ObjectId.isValid(collegeId)) {
      studentQuery.collegeId = new ObjectId(collegeId);
    } else {
      studentQuery.collegeId = collegeId;
    }
    if (group) studentQuery.group = group;
    if (yearOfStudy) studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, 'i');

    const students = await Student.find(studentQuery);

    // Attendance query
    const attendanceQuery = {};
    if (ObjectId.isValid(collegeId)) {
      attendanceQuery.collegeId = new ObjectId(collegeId);
    } else {
      attendanceQuery.collegeId = collegeId;
    }
    if (group) attendanceQuery.group = group;
    if (yearOfStudy) attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, 'i');

    const attendanceRecords = await Attendance.find(attendanceQuery);

    // Process each student for attendance percentage
    const summary = students.map((student) => {
      let totalPresent = 0;
      let totalWorking = 0;
      const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;

      attendanceRecords.forEach((record) => {
        if (record.studentId.toString() === student._id.toString()) {
          const recordDate = new Date(record.date);
          if (doj && recordDate < doj) return;
          totalWorking++;
          if (record.status === 'Present') totalPresent++;
        }
      });

      const percentage = totalWorking > 0 ? (totalPresent / totalWorking) * 100 : 0;

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        group: student.group,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    const filtered = summary.filter((s) => s.percentage < 75);
    return NextResponse.json(filtered, { status: 200 });
  } catch (err) {
    console.error('Error in shortage-summary API:', err);
    return NextResponse.json({ error: 'Failed to generate shortage summary' }, { status: 500 });
  }
}
