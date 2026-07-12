# Lecturer Management Module

## Purpose

This module manages all lecturer-related functionality.

It is responsible for authentication, attendance access,
timetable access, invigilation duties and dashboards.

Never redesign this module without understanding all dependent modules.

---

# Features

- Lecturer Registration
- Lecturer Login
- Lecturer Profile
- Lecturer Dashboard
- Lecturer Attendance
- Group-wise Attendance
- Lecturer Timetable
- Lecturer Availability
- Invigilation Availability
- Invigilation Duty Assignment
- Lecturer Statistics

---

# Primary Models

Lecturer

LecturerProfile

LecturerAvailability

---

# Related Modules

Attendance

Timetable

Invigilation

Dashboard

Authentication

---

# Important APIs

/api/lecturers

/api/lecturers/[id]

/api/lecturers/profile

/api/lecturers/active

/api/register/lecturer

/api/invigilation/lecturers

/api/timetable/lecturers

---

# Responsibilities

Every lecturer belongs to a college.

Every lecturer may handle multiple groups.

Every lecturer may teach multiple subjects.

Every lecturer may receive invigilation duties.

---

# Timetable Rules

Never break

- Lecturer mapping
- Subject mapping
- Workload calculation
- Availability matrix
- Substitute recommendation

---

# Attendance Rules

Lecturer attendance pages should always respect:

- Group permissions
- Assigned subjects
- College scope

---

# Dashboard Rules

Dashboard should display only authorized information.

Never expose another lecturer's private data.

---

# AI Rules

Before modifying

Read

Lecturer Model

↓

Lecturer APIs

↓

Lecturer Services

↓

Dashboard Components

↓

Timetable Components

Modify only the affected layer.

---

# Never Break

Lecturer Login

Dashboard

Attendance

Timetable

Availability

Invigilation

Profile

Permissions