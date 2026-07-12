# Timetable Management Module

## Purpose

This module manages academic timetable planning and execution.

It supports manual timetable creation, automatic timetable generation,
lecturer workload calculation and substitute recommendations.

Never redesign this module without understanding timetable dependencies.

---

# Features

- Manual Timetable
- Auto Timetable
- Timetable Builder
- Lecturer Timetable
- Student Timetable
- Lecturer Availability Matrix
- Lecturer Workload Report
- Substitute Recommendation
- Subject Mapping
- Practical/Theory Sessions

---

# Primary Models

TimeTable

TimetableSubject

TimetableSlot

TimetableLecturer

---

# Related Modules

Lecturers

Students

Attendance

Dashboard

Reports

---

# Important APIs

/api/timetable

/api/timetable/manual

/api/timetable/auto

/api/timetable/subjects

/api/timetable/lecturers

/api/timetable/lecturer-summary

/api/timetable-builder

/api/timetable-builder/auto

/api/timetable-builder/conflicts

---

# Business Rules

Every timetable belongs to one academic year.

Every subject must be mapped to a lecturer.

A lecturer cannot teach two classes in the same period.

Theory and Practical sessions must remain distinguishable.

Break and Lunch periods must never be assigned as teaching periods.

---

# Workload Rules

Workload is calculated per lecturer.

Preserve:

- Theory count
- Practical count
- Total periods
- Subject-wise workload

Never reset workload calculations without instruction.

---

# Availability Rules

Availability matrix must always remain accurate.

A lecturer marked as occupied cannot be recommended as a substitute.

---

# Substitute Recommendation

Recommendations should consider:

- Lecturer availability
- Subject compatibility
- Current workload
- Group relevance

Never recommend unavailable lecturers.

---

# AI Rules

Before editing

Read

Timetable Models

↓

Timetable APIs

↓

Timetable Utilities

↓

Timetable Components

↓

Workload Calculation

↓

Availability Logic

Modify only the affected layer.

---

# Never Break

Manual Timetable

Auto Timetable

Workload Report

Availability Matrix

Substitute Recommendation

Student Timetable

Lecturer Timetable

PDF Export