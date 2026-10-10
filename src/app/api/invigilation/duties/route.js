//src/app/api/invigilation/duties/route.js
import { connectInvigilationDB } from '@/lib/mongodb-invigilation'
import { requireOsraAuth } from "@/lib/osra-api-guard"
import { getDuties, assignDuty } from '@/app/invigilation/services/duty.service'
import { filterDuties } from '@/app/invigilation/lib/filter-duties'
import { validateDutyAssignment } from '@/app/invigilation/validators/duty.validator'
import { successResponse, errorResponse } from '@/app/invigilation/lib/api-response'
import { buildDutyFilter } from '@/app/invigilation/lib/build-duty-filter'
import LecturerUserMapping from "@/models/LecturerUserMapping";
import User from "@/models/User";
// GET /api/invigilation/duties



export async function GET(req) {
  const { user, error } = await requireOsraAuth(req, [
    "admin",
    "lecturer",
  ]);

  if (error) return error;

  await connectInvigilationDB();

  const { searchParams } = new URL(req.url);

  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const lecturerId = searchParams.get("lecturerId");
  const session = searchParams.get("session");

  let dutyUser = user;

  if (user.role === "lecturer") {
    const accountFilters = [];
    if (user.email) {
      accountFilters.push({
        email: user.email.trim().toLowerCase(),
      });
    }
    if (user.name?.trim()) {
      accountFilters.push({ name: user.name.trim() });
    }

    const [mappings, matchingUsers] = await Promise.all([
      LecturerUserMapping.find({
        $or: [
          { lecturerId: user.id },
          { userId: user.id },
        ],
      }).lean(),
      accountFilters.length > 0
        ? User.find({
            role: "lecturer",
            ...(user.collegeId ? { collegeId: user.collegeId } : {}),
            $or: accountFilters,
          })
            .select("_id")
            .lean()
        : [],
    ]);

    const lecturerIds = [
      user.id,
      ...matchingUsers.map((matchingUser) => matchingUser._id.toString()),
      ...mappings.flatMap((mapping) => [
        mapping.lecturerId?.toString(),
        mapping.userId?.toString(),
      ]),
    ].filter(Boolean);

    const uniqueLecturerIds = [...new Set(lecturerIds)];

    dutyUser = {
      ...user,
      // Duties created before and after lecturer-account mapping can reference
      // either related account id. Limit results to only this lecturer's ids.
      id: uniqueLecturerIds[0],
      _id:
        uniqueLecturerIds.length === 1
          ? uniqueLecturerIds[0]
          : { $in: uniqueLecturerIds },
    };
  }

  const filter = buildDutyFilter(dutyUser, lecturerId);

  const duties = await getDuties(filter);

  const filtered = filterDuties(duties, {
    fromDate,
    toDate,
    session,
  });

  return successResponse(filtered);
}





// POST /api/invigilation/duties
export async function POST(req) {
  const { user, error } = await requireOsraAuth(req, ['admin'])

  if (error) return error

  try {
    await connectInvigilationDB()

    const body = await req.json()

    const validationError = validateDutyAssignment(body)

    if (validationError) {
      return errorResponse(validationError, 400)
    }

    const created = await assignDuty({
      ...body,
      assignedBy: user._id,
    })

    return successResponse(created, 'Duty assigned', 201)
  } catch (err) {
    if (String(err.message || '').includes('duplicate key')) {
      return errorResponse('Duty already assigned to this lecturer', 409)
    }

    return errorResponse(err.message || 'Failed to assign duty', 500)
  }
}
