# Invigilation Management Module

## Purpose

This module manages examination invigilation.

It assigns lecturers to examination rooms and sessions.

Supports manual assignment and automatic assignment.

Never redesign this module without understanding examination workflow.

---

# Features

- Exam Creation
- Room Management
- Lecturer Availability
- Manual Duty Assignment
- Auto Duty Assignment
- Monthly Summary
- Duty Load Analytics
- Exam Analytics
- Reports

---

# Primary Models

Exam

ExamSchedule

DutyAssignment

InvigilationRoom

LecturerAvailability

---

# Related Modules

Lecturers

Examinations

Dashboard

Authentication

Reports

---

# Important APIs

/api/invigilation/exams

/api/invigilation/rooms

/api/invigilation/lecturers

/api/invigilation/availability

/api/invigilation/duties

/api/invigilation/duties/auto-assign

/api/invigilation/reports

---

# Business Rules

Each room belongs to one exam schedule.

Each lecturer can have only one duty in the same session.

Unavailable lecturers must never be assigned.

Duty assignments should be conflict-free.

---

# Availability Rules

Availability is mandatory before assignment.

Availability must always be respected.

Never ignore lecturer availability.

---

# Auto Assignment Rules

Prefer

- Available lecturers
- Balanced workload
- Conflict-free schedule

Avoid

- Double assignment
- Room conflicts
- Lecturer conflicts

---

# Dashboard Rules

Dashboard should show

- Total Duties
- Pending Duties
- Availability Status
- Workload
- Analytics

---

# AI Rules

Before editing

Read

Exam Models

↓

Invigilation APIs

↓

Duty Services

↓

Availability Logic

↓

Dashboard Components

Modify only the required layer.

---

# Never Break

Availability

Duty Assignment

Auto Assignment

Reports

Analytics

Monthly Summary

Room Allocation