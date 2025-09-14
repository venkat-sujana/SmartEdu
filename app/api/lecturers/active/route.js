// app/api/lecturers/active/route.js
import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Lecturer from '@/models/Lecturer';

// Hypothetical: ఇక్కడ మీరు session store, Redis లేదా DB లో కాలేజ్ active lecturers ను ఫెచ్ చేస్తారు
// ఇక్కడ సింపుల్ గా మూడల్ నుంచి lecturers fetch చేసి సంబంధించిన లాజిక్ చేయండి.

export async function GET(req) {
  await connectMongoDB();

  // Example: అది మీ session tracking పై ఆధారపడి ఉంటుంది
  // For demo: అన్ని lecturers fetch చేసి, మీరు ఏదైనా filter చేసుకోవచ్చు logged in అయితే
  const lecturers = await Lecturer.find({ /*filter logged-in based on your session tracking*/ });

  // మీకు కావలసిన name + subject
  const activeLecturers = lecturers.map(l => ({
    name: l.name,
    subject: l.subject,
  }));

  return NextResponse.json({ data: activeLecturers });
}
