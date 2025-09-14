import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Attendance from '@/models/Attendance';
import { ObjectId } from 'mongodb';

// Same isHoliday and publicHolidays logic from your monthly summary

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url)
    const group = searchParams.get('group')
    const yearOfStudy = searchParams.get('yearOfStudy')
    const collegeId = searchParams.get('collegeId')

    // Filter students as desired
    const studentQuery = {};
    if (group) studentQuery.group = group;
    if (collegeId) studentQuery.collegeId = new ObjectId(collegeId);
    if (yearOfStudy) studentQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, 'i');

    const students = await Student.find(studentQuery);

    // Attendance records (bulk loaded)
    const attendanceQuery = {};
    if (group) attendanceQuery.group = group;
    if (collegeId) attendanceQuery.collegeId = new ObjectId(collegeId);
    if (yearOfStudy) attendanceQuery.yearOfStudy = new RegExp(`^${yearOfStudy}$`, 'i');

    const attendance = await Attendance.find(attendanceQuery);

    // Process each student for annual percentage
    const summary = students.map(student => {
      let totalPresent = 0;
      let totalWorking = 0;
      const doj = student.dateOfJoining ? new Date(student.dateOfJoining) : null;
      attendance.forEach(r => {
        if (r.studentId.toString() === student._id.toString()) {
          const recordDate = new Date(r.date);
          // Same DOJ & holiday skip logic as before
          if (student.yearOfStudy?.toLowerCase().includes('first') && doj && recordDate < doj) return;
          // if (isHoliday(recordDate)) return; // Use if needed
          totalWorking++;
          if (r.status === 'Present') totalPresent++;
        }
      });
      const percentage = totalWorking > 0 ? ((totalPresent / totalWorking) * 100) : 0;

      return {
        name: student.name,
        yearOfStudy: student.yearOfStudy,
        group: student.group,
        percentage,
      }
    });

    // Only <75% students
    const filtered = summary.filter(s => s.percentage < 75);

    return NextResponse.json({ data: filtered }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate shortage summary' }, { status: 500 });
  }
}
