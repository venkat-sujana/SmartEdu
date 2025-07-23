import connectMongoDB from '@/lib/mongodb';
import Principal from '@/models/Principal';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  await connectMongoDB();

  const body = await request.json();
  const { name, email, password, collegeId, photo } = body;

  const existing = await Principal.findOne({ email });
  if (existing) {
    return Response.json({ error: 'Email already exists' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const principal = await Principal.create({
    name,
    email,
    password: hashedPassword,
    collegeId,
    role: 'principal',
    photo
  });

  return Response.json({ success: true, principal }, { status: 201 });
}
