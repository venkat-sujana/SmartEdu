# Dashboard Module

## Purpose

This module provides dashboards for different users.

Dashboards should display summarized information.

Never place heavy business logic inside dashboard components.

---

# Dashboards

- Admin Dashboard
- Principal Dashboard
- Lecturer Dashboard
- Student Dashboard
- Office Dashboard
- Attendance Dashboard
- Group Dashboard

---

# Responsibilities

Every dashboard should

- show summary
- show statistics
- load quickly
- be mobile responsive

---

# Data Sources

Dashboards read data from

- Attendance
- Students
- Lecturers
- Examinations
- Timetable
- Invigilation
- Fee

Never duplicate calculations.

---

# Performance

Prefer

- Aggregation
- Pagination
- Lazy Loading
- Memoization

Avoid

- Duplicate API calls
- Heavy rendering
- Fetching unnecessary data

---

# AI Rules

Before editing

Read

Dashboard Components

↓

Dashboard APIs

↓

Related Service

↓

Related Module

Modify only affected components.

---

# Never Break

Dashboard Cards

Statistics

Charts

Navigation

Permissions