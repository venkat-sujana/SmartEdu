// src/app/api/invigilation/availability/route.js
import { NextResponse } from 'next/server'
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import LecturerAvailability from '@/models/LecturerAvailability'
import { requireOsraAuth } from "@/lib/osra-api-guard"
import LecturerUserMapping from "@/models/LecturerUserMapping";
import User from "@/models/User";

async function getLecturerAccountIds(user) {
  const [mappings, matchingUser] = await Promise.all([
    LecturerUserMapping.find({
      $or: [{ lecturerId: user.id }, { userId: user.id }],
    }).lean(),
    user.email
      ? User.findOne({
          email: user.email.trim().toLowerCase(),
          role: "lecturer",
        })
          .select("_id")
          .lean()
      : null,
  ]);

  return [
    user.id,
    matchingUser?._id?.toString(),
    ...mappings.flatMap((mapping) => [
      mapping.lecturerId?.toString(),
      mapping.userId?.toString(),
    ]),
  ].filter(Boolean);
}

async function getAvailabilityOwnerId(user) {
  const mapping = await LecturerUserMapping.findOne({
    lecturerId: user.id,
  }).lean();

  if (mapping?.userId) return mapping.userId.toString();

  if (user.email) {
    const matchingUser = await User.findOne({
      email: user.email.trim().toLowerCase(),
      role: "lecturer",
    })
      .select("_id")
      .lean();
    if (matchingUser?._id) return matchingUser._id.toString();
  }

  return user.id;
}

export async function GET(req) {
  const { user, error } = await requireOsraAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()

    const filter = {}

if (user.role === 'lecturer') {
  filter.lecturerId = { $in: [...new Set(await getLecturerAccountIds(user))] };
} else {
      if (user.collegeId) filter.collegeId = user.collegeId
      const { searchParams } = new URL(req.url)
      if (searchParams.get('lecturerId')) filter.lecturerId = searchParams.get('lecturerId')
      if (searchParams.get('session'))    filter.session    = searchParams.get('session')
      if (searchParams.get('status'))     filter.status     = searchParams.get('status')
      if (searchParams.get('date')) {
        const d = new Date(searchParams.get('date'))
        d.setHours(0, 0, 0, 0)
        const end = new Date(d)
        end.setHours(23, 59, 59, 999)
        filter.date = { $gte: d, $lte: end }
      }
    }

    const records = await LecturerAvailability.find(filter)
      .populate('lecturerId', 'name')
      .sort({ date: 1, session: 1 })
      .lean()

    return NextResponse.json({ data: records })

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  const { user, error } = await requireOsraAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const { date, session, status, reason, lecturerId: bodyLid } = await req.json()

    if (!date || !session || !status) {
      return NextResponse.json(
        { message: 'date, session, status are required' },
        { status: 400 }
      )
    }

let lecturerId;

if (user.role === 'admin') {
  lecturerId = bodyLid || user._id;
} else {
  lecturerId = await getAvailabilityOwnerId(user);
}

    const record = await LecturerAvailability.findOneAndUpdate(
      { lecturerId, date: new Date(date), session },
      { lecturerId, date: new Date(date), session, status, reason: reason || '' },
      { upsert: true, new: true }
    )

    return NextResponse.json({ message: 'Saved', data: record })

  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed to save' },
      { status: 500 }
    )
  }
}

export async function PUT(req) {
  const { user, error } = await requireOsraAuth(req, ['admin', 'lecturer'])
  if (error) return error

  try {
    await connectInvigilationDB()
    const { records } = await req.json()

    if (!records?.length) {
      return NextResponse.json({ message: 'No records', data: [] })
    }

    const ops = records.map(({ lecturerId, date, session, status }) => {
      const filter = { lecturerId, date: new Date(date), session }
      if (!status || status === 'notset') {
        return {
          deleteOne: { filter },
        }
      }
      return {
        updateOne: {
          filter,
          update: { $set: { lecturerId, date: new Date(date), session, status, reason: '' } },
          upsert: true,
        },
      }
    })

    await LecturerAvailability.bulkWrite(ops)

    return NextResponse.json({ message: 'Saved', count: ops.length })
  } catch (err) {
    return NextResponse.json(
      { message: err.message || 'Failed' },
      { status: 500 }
    )
  }
}
