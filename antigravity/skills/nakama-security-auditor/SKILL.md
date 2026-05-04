---
name: nakama-security-auditor
description: >
  Audits Nakama-specific code for security vulnerabilities and defensive patterns. 
  Use when reviewing Express middleware, JWT authentication, Zod validation schemas, 
  or Prisma database queries. Trigger when the user says "audit security", "check JWT", 
  "is this query safe", or "validate my Zod schema". Do NOT trigger for UI styling, 
  CSS tasks, or basic React component logic.
---

# Nakama Security Auditor

Expert auditor for the Nakama stack (Express 5, Prisma 6, React 19). This skill ensures that all data flows—from the database to the client—are sanitized, authenticated, and resilient.

---

## Phase 1: Backend & Auth Hardening

**Entry:** Working on server-side middleware, routes, or authentication logic.

1. **JWT Verification**: Ensure `jsonwebtoken` is used with a strong secret and that tokens are checked for both existence and validity in the `auth` middleware.
2. **Middleware Order**: Verify that `helmet()`, `cors()`, and `express-rate-limit` are initialized before any route handlers.
3. **Sensitive Endpoints**: Confirm that login, register, and password-reset routes have stricter rate-limiting than general API routes.
4. **Cookie Safety**: Verify that JWTs (if used in cookies) are set with `httpOnly: true`, `secure: true`, and `sameSite: 'strict'`.

**Exit:** Backend authentication and basic header security are confirmed.

---

## Phase 2: Data Validation & Query Safety

**Entry:** Working on Zod schemas or Prisma database calls.

1. **Zod Strictness**: Ensure Zod schemas use `.strict()` or `.strip()` to prevent unexpected object properties from bypassing validation.
2. **Prisma Injection**: Confirm that no raw SQL is being constructed via string concatenation. Always use Prisma's template tags for raw queries.
3. **Data Exposure**: Review `Prisma` select statements to ensure `password`, `email` (if private), and internal IDs are not leaked to the frontend.
4. **Input Sanitization**: Use `sanitize-html` for any user-provided content that will be rendered in the browser.

**Exit:** All inputs are validated and database interactions are parameterized.

---

## Phase 3: Frontend Security (React 19)

**Entry:** Working on client-side API calls or data rendering.

1. **Referrer Policy**: Ensure `referrerPolicy="no-referrer"` or `referrerPolicy="strict-origin-when-cross-origin"` is applied to all external images/assets to prevent leakage.
2. **Error Masking**: Ensure that the frontend does not display raw stack traces or internal server error messages to the end user.
3. **XSS Prevention**: Verify that no user-provided strings are passed into `dangerouslySetInnerHTML` without rigorous sanitization.

**Exit:** Client-side data handling follows defensive standards.

---

## Common Traps

| Trap | Correct Behavior |
|---|---|
| Storing JWTs in `localStorage` | Store JWTs in `httpOnly` cookies to prevent XSS-based token theft. |
| Vague Zod error messages | Provide specific `.message()` strings in Zod to avoid leaking internal field names. |
| Skipping `.catch()` on Prisma calls | Always wrap Prisma calls in try/catch to log errors to Winston and return a 500. |
| Trusting client-side validation alone | Always re-validate every single field on the server using the shared Zod schemas. |

---

## Eval Cases (evals.json)

```json
[
  {
    "query": "Review my Express auth middleware for security issues.",
    "should_trigger": true,
    "expected_behavior": "Loads nakama-security-auditor and checks JWT/Cookie settings.",
    "failure_mode": "Fires a general coding skill instead."
  },
  {
    "query": "Is this Prisma query vulnerable to injection: prisma.user.findMany({ where: { name: input } })",
    "should_trigger": true,
    "expected_behavior": "Loads skill and explains why Prisma's object syntax is safe.",
    "failure_mode": "Ignores the query safety aspect."
  },
  {
    "query": "How do I center a div in Tailwind?",
    "should_trigger": false,
    "expected_behavior": "Does NOT load security-auditor.",
    "failure_mode": "Fires on UI tasks."
  },
  {
    "query": "Update the color of the Login button.",
    "should_trigger": false,
    "expected_behavior": "Stays silent.",
    "failure_mode": "Fires on non-security tasks."
  }
]
```
