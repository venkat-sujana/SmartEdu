# ARCHITECTURE.md

# OSRA Architecture

## Philosophy

OSRA follows a layered architecture.

Every feature should have a clear responsibility.

Never mix UI, Business Logic and Database Logic.

---

# Overall Architecture

Presentation Layer

↓

App Router

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

---

# Folder Responsibilities

## src/app

Contains

- Pages
- Layouts
- API Routes
- Route Groups

Never place reusable business logic here.

---

## src/components

Reusable UI Components.

Components should

- receive props
- avoid direct database access
- avoid heavy business logic

---

## src/services

Business Logic Layer.

Responsibilities

- calculations
- workflows
- orchestration
- data transformation

Services should not contain UI.

---

## src/repositories

Repository Pattern.

Responsibilities

- database queries
- reusable MongoDB operations

Never place UI logic here.

---

## src/models

Mongoose Schemas.

Responsibilities

- schema
- validation
- indexes
- relationships

Avoid business logic.

---

## src/lib

Shared libraries.

Examples

- auth
- mongodb
- cloudinary
- sms
- timetable configuration

---

## src/utils

Pure helper functions.

Examples

- calculations
- formatting
- exports
- workload calculation

Utilities should be independent.

---

## src/hooks

Reusable React Hooks.

No UI.

No database logic.

---

## src/validations

Validation Layer.

Every API should validate inputs.

---

# Data Flow

User

↓

Page

↓

Component

↓

Service

↓

Repository

↓

Model

↓

MongoDB

---

# AI Editing Rules

Before changing code

1. Identify affected module.

2. Locate reusable component.

3. Reuse existing service.

4. Reuse repository.

5. Preserve API compatibility.

6. Preserve UI consistency.

---

# Performance Strategy

Prefer

- reusable components
- memoization
- lazy loading
- pagination
- optimized fetch

Avoid

- duplicate API calls
- unnecessary renders
- repeated database queries

---

# Project Principles

Do not duplicate existing logic.

Prefer extension over replacement.

Small reusable modules are preferred over large files.

Every change should improve maintainability.

Backward compatibility is mandatory.