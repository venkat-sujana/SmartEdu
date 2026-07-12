# Attendance Module

## Purpose

This module manages complete student attendance.

It is one of the core modules of OSRA.

Never rewrite this module without understanding the complete flow.

---

## Features

- Daily Attendance
- FN / AN Sessions
- Attendance Editing
- Individual Attendance
- Attendance Calendar
- Monthly Summary
- Group Summary
- Group Performance
- Attendance Trend
- Attendance Health Score
- Attendance Alerts
- Consecutive Absentees
- Attendance SMS
- Parent Notification
- Shortage Summary
- Late Entry Register
- Student Late Coming
- AI Attendance

---

## Primary Models

Attendance

Student

AttendanceSmsLog

---

## Important APIs

/api/attendance

/api/attendance/today

/api/attendance/monthly-summary

/api/attendance/group-performance

/api/attendance/student/[id]

/api/attendance/reason

/api/attendance/trend

/api/attendance/late-register

/api/attendance/summary

---

## Services

attendanceService

aiAttendanceService

---

## Important Components

AttendanceForm

AttendanceTable

IndividualReport

TodayAbsenteesTable

GroupAttendanceSummary

AttendanceHealthScoreCard

AttendanceAlertsCard

AttendanceTrendCard

---

## AI Rules

Before editing

Read

Existing API

↓

Service

↓

Component

↓

Validation

Never modify all together.

Modify only required layer.

---

## Never Break

Attendance History

Monthly Reports

Calendar

SMS

Reasons

Statistics

Late Register

Analytics
