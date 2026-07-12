# DATABASE.md

# Database Guidelines

## Database

OSRA uses MongoDB with Mongoose ODM.

All persistence must go through existing models and repositories where available.

---

# General Rules

Always:

- Reuse existing models.
- Reuse existing repositories.
- Keep schema backward compatible.
- Validate incoming data.
- Use async/await.

Never:

- Duplicate schemas.
- Rename existing fields without instruction.
- Remove fields used by existing APIs.
- Break existing collections.

---

# Model Responsibilities

Each model represents one business entity.

Examples:

- Student
- Attendance
- Lecturer
- User
- Principal
- OfficeStaff
- Exam
- Fee
- College
- TimeTable
- TimetableSubject
- TimetableSlot
- DutyAssignment
- InvigilationRoom
- LecturerAvailability
- AuditLog
- AttendanceSmsLog
- SystemSettings

---

# Relationships

Prefer ObjectId references.

Populate only when necessary.

Avoid unnecessary nested documents.

---

# Queries

Prefer:

- indexed fields
- projections
- pagination
- sorting

Avoid:

- full collection scans
- unnecessary populate()
- duplicate queries

---

# Validation

Validate:

- required fields
- enum values
- ObjectId
- dates
- unique constraints

Use existing validation utilities whenever possible.

---

# Updates

Use atomic updates where possible.

Avoid overwriting entire documents if only one field changes.

---

# Deletes

Prefer soft-delete if the feature already supports restore.

Never permanently delete production data unless explicitly requested.

---

# Performance

Prefer:

- lean()
- select()
- indexes
- aggregation only when necessary

Avoid:

- N+1 queries
- duplicate database calls

---

# AI Instructions

Before changing a model:

1. Search for every API using that model.
2. Search for every service using that model.
3. Search for every component depending on that API.
4. Preserve compatibility.

If unsure:

Do not modify the schema.

Ask for clarification instead.