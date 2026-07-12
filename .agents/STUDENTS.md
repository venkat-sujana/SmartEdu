# Student Management Module

## Purpose

This module manages the complete lifecycle of a student.

The module starts from admission and ends with promotion,
termination or completion.

Never redesign this module without understanding the complete
student workflow.

---

# Student Lifecycle

Admission

↓

Registration

↓

Attendance

↓

Examinations

↓

Reports

↓

Promotion

↓

Second Year

↓

Completion

---

# Features

- Student Registration
- Student Edit
- Student Activation
- Student Profile
- Student Search
- Student Filters
- Bulk Upload
- Student Promotion
- Auto Promotion
- Student Restore
- Student Termination
- Student Statistics
- Student Dashboard
- Individual Student Reports

---

# Primary Model

Student

---

# Important APIs

/api/students

/api/students/[id]

/api/students/register

/api/students/promote

/api/students/promote/auto

/api/students/restore

/api/students/activate

/api/students/bulk-upload

/api/students/stats

/api/students/count

---

# Related Modules

Attendance

Examinations

Fee

Dashboard

Timetable

---

# Validation

Always validate

- Admission Number
- Student Name
- Father Name
- Mobile Number
- Group
- Year
- Gender
- Caste
- Status

Reuse existing validation.

---

# Search

Support

- Admission Number
- Student Name
- Mobile Number
- Group
- Year

Never fetch everything and filter in React.

Prefer server-side filtering.

---

# Pagination

Always support

- 25
- 50
- 100

records per page.

---

# UI Rules

Prefer

Search

Filters

Pagination

Responsive Cards

Responsive Tables

Export

---

# AI Rules

Before editing

Read

Student Model

↓

Student APIs

↓

Student Service

↓

Student Components

↓

Validation

Modify only affected layer.

---

# Never Break

Registration

Promotion

Bulk Upload

Attendance Mapping

Student Reports

Statistics

Dashboard

API Compatibility