---
trigger: always_on
---

All backend API endpoints must include comprehensive try/catch blocks.

Never fail silently; always log errors to the console and return appropriate HTTP status codes (e.g., 400 for bad input, 500 for server errors).

All database queries must use parameterized inputs to prevent SQL injection.