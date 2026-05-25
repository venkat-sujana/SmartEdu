//src/app/api/invigilation/duties/route.js
import { connectInvigilationDB } from "@/lib/mongodb-invigilation";

import {
  requireInvigilationAuth,
} from "@/lib/invigilation-api-guard";

import {
  getDuties,
  assignDuty,
} from "@/app/invigilation/services/duty.service";

import {
  filterDuties,
} from "@/app/invigilation/lib/filter-duties";

import {
  validateDutyAssignment,
} from "@/app/invigilation/validators/duty.validator";

import {
  successResponse,
  errorResponse,
} from "@/app/invigilation/lib/api-response";

import {
  buildDutyFilter,
} from "@/app/invigilation/lib/build-duty-filter";



// GET /api/invigilation/duties
export async function GET(req) {

  const { user, error } =
  await requireInvigilationAuth(
    req,
    ["admin", "lecturer"]
  );

  if (error) return error;

  await connectInvigilationDB();

  const { searchParams } =
    new URL(req.url);

  const date =
    searchParams.get("date");

  const lecturerId =
    searchParams.get("lecturerId");

  const session =
    searchParams.get("session");

  const filter =
    buildDutyFilter(
      user,
      lecturerId
    );

  const duties =
    await getDuties(filter);

  const filtered =
    filterDuties(duties, {
      date,
      session,
    });

  return successResponse(filtered);
}



// POST /api/invigilation/duties
export async function POST(req) {

  const { user, error } =
    await requireInvigilationAuth(
      req,
      ["admin"]
    );

  if (error) return error;

  try {

    await connectInvigilationDB();

    const body =
      await req.json();

    const validationError =
      validateDutyAssignment(body);

    if (validationError) {
      return errorResponse(
        validationError,
        400
      );
    }

    const created =
      await assignDuty({
        ...body,
        assignedBy: user._id,
      });

    return successResponse(
      created,
      "Duty assigned",
      201
    );

  } catch (err) {

    if (
      String(err.message || "")
        .includes("duplicate key")
    ) {
      return errorResponse(
        "Duty already assigned to this lecturer",
        409
      );
    }

    return errorResponse(
      err.message ||
      "Failed to assign duty",
      500
    );
  }
}