# API_GUIDELINES.md

# OSRA API Standards

Version: 1.0

---

# Purpose

This document defines how APIs should be created and maintained.

Every API must remain consistent with the existing architecture.

Never introduce breaking changes.

---

# Framework

Next.js App Router

Route Handlers

Example

src/app/api/**/route.js

---

# General Rules

Always

✓ Validate request body

✓ Validate query parameters

✓ Validate route parameters

✓ Return JSON

✓ Return proper HTTP status

✓ Handle errors

✓ Log server errors when necessary

Never

✗ Return HTML

✗ Throw raw MongoDB errors

✗ Expose stack traces

✗ Return inconsistent response formats

---

# Response Format

Success

{
    success: true,
    data: ...
}

Failure

{
    success: false,
    message: "...",
    error: ...
}

Keep response shape consistent.

---

# HTTP Status

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Validation

Use existing validation layer.

Do not duplicate validation logic.

If validation exists

Reuse it.

---

# Database Access

API

↓

Service

↓

Repository

↓

Model

Avoid writing complex database logic directly inside route handlers.

---

# Authentication

Respect existing authentication.

Never bypass

NextAuth

Role middleware

Session validation

Permission checks

---

# Authorization

Always verify

Role

Ownership

Permissions

College scope

Never trust client input.

---

# Error Handling

Use try/catch.

Return meaningful errors.

Do not expose internal implementation.

---

# Pagination

Prefer

page

limit

sort

search

filters

Never return extremely large datasets.

---

# Search

Prefer server-side search.

Support partial matches where appropriate.

Avoid fetching everything then filtering in React.

---

# Performance

Prefer

indexes

lean()

projection

pagination

Avoid

multiple duplicate queries

expensive populate()

large payloads

---

# File Upload

Reuse existing upload utilities.

Validate

type

size

mime

Never trust filename.

---

# Security

Validate all user input.

Escape dangerous values.

Never expose secrets.

Never expose MongoDB internals.

---

# Logging

Log only

important events

unexpected failures

security events

Avoid noisy logging.

---

# AI Rules

Before editing an API

1. Read the existing route.

2. Read the service.

3. Read repository if present.

4. Preserve response format.

5. Preserve backward compatibility.

6. Modify only necessary code.

Never rewrite an API from scratch unless requested.

---

# Final Checklist

✓ Validation

✓ Error handling

✓ Proper status code

✓ Authentication

✓ Authorization

✓ Consistent response

✓ Build passes

✓ No breaking changes