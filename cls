warning: in the working copy of 'src/app/api/invigilation/duties/route.js', LF will be replaced by CRLF the next time Git touches it
[1mdiff --git a/src/app/api/invigilation/duties/route.js b/src/app/api/invigilation/duties/route.js[m
[1mindex 2d8287f..746b264 100644[m
[1m--- a/src/app/api/invigilation/duties/route.js[m
[1m+++ b/src/app/api/invigilation/duties/route.js[m
[36m@@ -1,6 +1,6 @@[m
 //src/app/api/invigilation/duties/route.js[m
 import { connectInvigilationDB } from '@/lib/mongodb-invigilation'[m
[31m-import { requireInvigilationAuth } from '@/lib/invigilation-api-guard'[m
[32m+[m[32mimport { requireOsraAuth } from "@/lib/osra-api-guard"[m
 import { getDuties, assignDuty } from '@/app/invigilation/services/duty.service'[m
 import { filterDuties } from '@/app/invigilation/lib/filter-duties'[m
 import { validateDutyAssignment } from '@/app/invigilation/validators/duty.validator'[m
[36m@@ -9,7 +9,7 @@[m [mimport { buildDutyFilter } from '@/app/invigilation/lib/build-duty-filter'[m
 [m
 // GET /api/invigilation/duties[m
 export async function GET(req) {[m
[31m-  const { user, error } = await requireInvigilationAuth(req, ['admin', 'lecturer'])[m
[32m+[m[32m  const { user, error } = await requireOsraAuth(req, ['admin', 'lecturer'])[m
 [m
   if (error) return error[m
   await connectInvigilationDB()[m
[36m@@ -38,7 +38,7 @@[m [mconst filtered = filterDuties(duties, {[m
 [m
 // POST /api/invigilation/duties[m
 export async function POST(req) {[m
[31m-  const { user, error } = await requireInvigilationAuth(req, ['admin'])[m
[32m+[m[32m  const { user, error } = await requireOsraAuth(req, ['admin'])[m
 [m
   if (error) return error[m
 [m
