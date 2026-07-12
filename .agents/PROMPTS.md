# OSRA AI Prompt Library

This document contains reusable prompts for AI assistants working on OSRA.

---

# General Rules

Before generating code

1. Read AGENTS.md
2. Read ARCHITECTURE.md
3. Read DATABASE.md
4. Read API_GUIDELINES.md
5. Read the relevant module documentation.

Never guess project structure.

---

# Prompt 1

Implement a new feature.

Requirements

- Follow existing architecture.
- Reuse existing components.
- Do not break APIs.
- Return complete updated files only.

---

# Prompt 2

Fix a bug.

Requirements

- Find root cause.
- Explain the issue.
- Modify only required files.
- Preserve existing functionality.

---

# Prompt 3

Improve UI.

Requirements

- Tailwind CSS only.
- Keep responsive.
- Do not change functionality.
- Reuse existing UI components.

---

# Prompt 4

Optimize Performance.

Requirements

- Reduce unnecessary renders.
- Reduce duplicate API calls.
- Improve database queries.
- Preserve behavior.

---

# Prompt 5

Refactor Code.

Requirements

- Improve readability.
- Do not change behavior.
- Remove duplication.
- Keep architecture intact.

---

# Prompt 6

Create API.

Requirements

- Follow API_GUIDELINES.md
- Validate inputs.
- Handle errors.
- Preserve response format.

---

# Prompt 7

Modify Database.

Requirements

- Preserve schema compatibility.
- Reuse existing models.
- Never remove fields.
- Validate data.

---

# Prompt 8

Create Dashboard.

Requirements

- Fast loading.
- Responsive.
- Cards.
- Statistics.
- Charts if applicable.

---

# Prompt 9

Generate PDF.

Requirements

- Professional layout.
- Proper pagination.
- Consistent formatting.
- Preserve existing export logic.

---

# Prompt 10

Before Every Response

Understand

↓

Architecture

↓

Module

↓

Dependencies

↓

Generate production-ready code.