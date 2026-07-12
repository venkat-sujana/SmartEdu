# Authentication & Authorization Module

## Purpose

This module manages user authentication and role-based authorization.

All protected pages and APIs must respect authentication rules.

Never bypass authentication or authorization checks.

---

# Authentication Provider

- NextAuth

---

# Supported Roles

- Admin
- Principal
- Office Staff
- Lecturer
- Student

---

# Responsibilities

Authentication is responsible for

- Login
- Logout
- Session Validation
- User Identity

Authorization is responsible for

- Role Validation
- Permission Checks
- Module Access
- API Protection

---

# Protected Resources

Protect

- Admin Pages
- Dashboard Pages
- Attendance
- Student Management
- Timetable
- Invigilation
- Examination
- Reports
- Settings

---

# Session Rules

Always verify

- Active session
- Valid role
- College scope (if applicable)

Never trust client-side role information alone.

---

# API Rules

Every protected API must

- Validate session
- Validate permissions
- Return appropriate HTTP status

---

# UI Rules

Hide unauthorized menus.

Prevent navigation to restricted pages.

Display friendly "Access Denied" messages.

---

# AI Rules

Before modifying

Read

Authentication Routes

↓

Middleware

↓

Role Utilities

↓

Protected APIs

↓

Protected Pages

Modify only the affected layer.

---

# Never Break

Login

Logout

Session

Role Checks

Middleware

Permission Validation