# PROJECT_CONTEXT.md

# OSRA - Open Source Record Assistant

Version: 1.0

---

# Project Summary

OSRA is an Enterprise College ERP System developed for Government Junior Colleges.

The application manages the complete academic lifecycle including student administration, attendance, timetable, examinations, invigilation, dashboards and reports.

This repository is production-oriented.

The primary objective is to preserve stability while continuously adding new features.

---

# Technology Stack

Framework

Next.js 16 (App Router)

Frontend

React 19

JavaScript

Tailwind CSS

Backend

Next.js Route Handlers

Database

MongoDB

Mongoose

Authentication

NextAuth

PDF

jsPDF

jspdf-autotable

Icons

Lucide React

Deployment

Vercel

---

# Project Philosophy

Always

- Preserve existing architecture
- Reuse existing components
- Reuse services
- Reuse repositories
- Reuse utilities
- Maintain backward compatibility
- Keep UI responsive
- Generate production-ready code

Never

- Rewrite working modules
- Duplicate business logic
- Break APIs
- Break database schema
- Rename files unnecessarily
- Add unnecessary packages

---

# Architecture

Presentation Layer

↓

Pages

↓

Components

↓

Services

↓

Repositories

↓

Models

↓

MongoDB

Business logic belongs inside Services.

Database logic belongs inside Repositories.

Models contain schema only.

Components contain UI only.

---

# Major Modules

Student Management

Attendance Management

Attendance Analytics

Attendance Calendar

Attendance Alerts

Attendance SMS

AI Attendance

Timetable Management

Timetable Builder

Lecturer Management

Principal Dashboard

Office Dashboard

Student Dashboard

Examination Management

Invigilation Management

Fee Management

Reports

Certificates

Settings

Authentication

Analytics

---

# Core Models

Student

Attendance

Lecturer

User

Principal

OfficeStaff

Exam

Fee

College

TimeTable

TimetableSubject

TimetableSlot

DutyAssignment

InvigilationRoom

LecturerAvailability

AuditLog

AttendanceSmsLog

SystemSettings

---

# Coding Rules

Prefer

Small reusable components

Meaningful variable names

Async/Await

Reusable utilities

Reusable services

Readable code

Avoid

Duplicate logic

Huge components

Magic numbers

Unused imports

---

# UI Rules

Tailwind CSS only

Responsive

Desktop

Tablet

Mobile

Consistent spacing

Consistent colors

Consistent cards

Consistent buttons

---

# Attendance Rules

Never break

Attendance History

Attendance Calendar

Attendance Alerts

Attendance Statistics

Attendance SMS

Attendance Reports

Late Entry Register

Attendance Trends

Attendance Reasons

Attendance AI

---

# Student Rules

Never break

Registration

Promotion

Termination

Restore

Bulk Upload

Student Dashboard

Student Reports

Student Statistics

---

# Lecturer Rules

Never break

Login

Profile

Attendance

Timetable

Availability

Dashboard

Invigilation

---

# Timetable Rules

Preserve

Manual Timetable

Auto Timetable

Lecturer Availability

Workload Calculation

Substitute Recommendation

Theory

Practical

Break

Lunch

PDF Export

---

# Examination Rules

Preserve

Exam Creation

Marks

Result Calculation

Failure Reports

Statistics

Dashboard

---

# Invigilation Rules

Preserve

Availability

Duty Assignment

Auto Assignment

Rooms

Reports

Analytics

---

# Dashboard Rules

Dashboards must

Load quickly

Use reusable cards

Show summary only

Use optimized APIs

Remain responsive

---

# API Rules

Always

Validate inputs

Validate permissions

Handle errors

Return proper HTTP status

Return consistent JSON

Never expose internal errors.

---

# Database Rules

Reuse models.

Reuse repositories.

Never duplicate schema.

Never rename existing fields.

Never remove production fields.

---

# Performance Rules

Prefer

Pagination

Memoization

Lazy Loading

Aggregation

Indexes

Avoid

Duplicate API calls

Large payloads

Repeated database queries

---

# Security Rules

Always

Validate sessions

Validate roles

Validate permissions

Validate inputs

Never expose secrets.

---

# AI Instructions

Whenever modifying code

1. Understand the requested feature.

2. Read related module.

3. Reuse existing architecture.

4. Modify only affected files.

5. Preserve backward compatibility.

6. Return production-ready code.

7. Explain important changes briefly.

---

# Response Format

Always

Explain root cause

Explain approach

Return complete updated files

Preserve formatting

Avoid unnecessary explanations

---

# Development Goal

OSRA should remain

Fast

Maintainable

Modular

Scalable

Secure

Production Ready

Enterprise Ready

AI Friendly

---

# End of Context